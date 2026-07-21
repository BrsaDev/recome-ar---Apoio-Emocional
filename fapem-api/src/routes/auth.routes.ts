import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function authRoutes(fastify: FastifyInstance) {
    // Register / Login (Secure credentials-based flow)
    fastify.post('/auth/access', async (request, reply) => {
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(6),
            nickname: z.string().min(2).max(30).optional(),
            avatarId: z.string().optional(),
        });

        const { email, password, nickname, avatarId } = schema.parse(request.body);

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            // Check if user is banned
            if (user.isBanned) {
                return reply.status(403).send({
                    error: 'Sua conta foi suspensa por violar as diretrizes de conduta do aplicativo.'
                });
            }

            // Check if user has password authentication configured (not just Google OAuth)
            if (!user.passwordHash) {
                return reply.status(400).send({
                    error: 'Esta conta foi criada usando o Google. Por favor, faça login com o Google.'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return reply.status(401).send({ error: 'Senha inválida. Por favor, tente novamente.' });
            }

            // Optionally update nickname/avatar if provided
            if (nickname || avatarId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        ...(nickname ? { nickname } : {}),
                        ...(avatarId ? { avatarId } : {}),
                    },
                });
            }
        } else {
            // Signup flow: nickname/avatar are required
            if (!nickname || !avatarId) {
                return reply.status(400).send({
                    error: 'Nome de usuário e avatar são obrigatórios para a criação de uma nova conta.'
                });
            }

            // Create password hash
            const passwordHash = await bcrypt.hash(password, 10);

            // Create new user
            user = await prisma.user.create({
                data: {
                    nickname,
                    avatarId,
                    email,
                    passwordHash,
                    plan: 'FREE',
                },
            });
        }

        const token = fastify.jwt.sign({
            id: user.id,
            nickname: user.nickname,
            plan: user.plan,
            role: user.role
        });

        return { user, token };
    });

    // Google OAuth Login
    fastify.post('/auth/google', async (request, reply) => {
        const schema = z.object({
            idToken: z.string(),
            avatarId: z.string().optional(),
        });

        const { idToken, avatarId } = schema.parse(request.body);

        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID as string,
            });

            const payload = (ticket as any).getPayload();
            if (!payload) {
                return reply.status(400).send({ error: 'Token do Google inválido.' });
            }

            const { sub: googleId, email, name, picture } = payload;

            // Try to find user by googleId
            let user = await prisma.user.findUnique({
                where: { googleId },
            });

            // If not found, try by email to link accounts
            if (!user && email) {
                user = await prisma.user.findUnique({
                    where: { email },
                });

                if (user) {
                    // Link account
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { googleId },
                    });
                }
            }

            // Check if user is banned
            if (user && user.isBanned) {
                return reply.status(403).send({
                    error: 'Sua conta foi suspensa por violar as diretrizes de conduta do aplicativo.'
                });
            }

            // If still not found, create new
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        googleId,
                        email,
                        nickname: name || 'Usuário Google',
                        avatarId: avatarId || 'avatar-google',
                        plan: 'FREE',
                    },
                });
            }

            const token = fastify.jwt.sign({
                id: user.id,
                nickname: user.nickname,
                plan: user.plan,
                role: user.role
            });

            return { user, token };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(401).send({ error: 'Falha na autenticação com o Google.' });
        }
    });

    // Get Me
    fastify.get('/user/me', {
        onRequest: [fastify.authenticate]
    }, async (request) => {
        const user = await prisma.user.findUnique({
            where: { id: (request.user as any).id },
            include: {
                myAngels: {
                    include: {
                        angel: true
                    }
                }
            }
        });

        return user;
    });

    // Update Public Key (E2EE)
    fastify.patch('/user/public-key', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const schema = z.object({
            publicKey: z.string().min(10),
        });

        const { publicKey } = schema.parse(request.body);

        await prisma.user.update({
            where: { id: (request.user as any).id },
            data: { publicKey },
        });

        return { success: true };
    });

    // Get User Public Key (E2EE)
    fastify.get('/user/:id/public-key', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);

        const user = await prisma.user.findUnique({
            where: { id },
            select: { publicKey: true }
        });

        if (!user) {
            return reply.status(404).send({ error: 'Usuário não encontrado.' });
        }

        return { publicKey: user.publicKey };
    });

    // Accept Terms of Service
    fastify.post('/user/accept-terms', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const schema = z.object({
            name: z.string(),
            acceptedAt: z.string(),
            version: z.string(),
        });
        const { name, acceptedAt, version } = schema.parse(request.body);

        fastify.log.info(`[Terms Accepted] User '${name}' accepted terms version ${version} at ${acceptedAt}`);
        return { success: true, data: { name, acceptedAt, version } };
    });

    // Create Support Ticket
    fastify.post('/user/tickets', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const schema = z.object({
            subject: z.string(),
            message: z.string(),
        });
        const { subject, message } = schema.parse(request.body);
        const userId = (request.user as any).id;

        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                subject,
                message,
                status: 'OPEN',
            }
        });

        return ticket;
    });

    // Get My Support Tickets
    fastify.get('/user/tickets', {
        onRequest: [fastify.authenticate]
    }, async (request) => {
        const userId = (request.user as any).id;

        const tickets = await prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return tickets;
    });

    // Update User Plan (Promotional / Billing)
    fastify.patch('/user/plan', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const schema = z.object({
            plan: z.enum(['FREE', 'PREMIUM1', 'PREMIUM2', 'PREMIUM3']),
        });
        const { plan } = schema.parse(request.body);
        const userId = (request.user as any).id;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { plan }
        });

        const token = fastify.jwt.sign({
            id: updatedUser.id,
            nickname: updatedUser.nickname,
            plan: updatedUser.plan,
            role: updatedUser.role
        });

        return { user: updatedUser, token };
    });
}
