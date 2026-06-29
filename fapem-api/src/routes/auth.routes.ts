import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function authRoutes(fastify: FastifyInstance) {
    // Register / Login (Anonymous/Simple)
    fastify.post('/auth/access', async (request, reply) => {
        const schema = z.object({
            nickname: z.string().min(2).max(30),
            avatarId: z.string(),
            email: z.string().email().optional(),
        });

        const { nickname, avatarId, email } = schema.parse(request.body);

        let user;

        if (email) {
            user = await prisma.user.findUnique({
                where: { email },
            });
        }

        if (!user) {
            user = await prisma.user.create({
                data: {
                    nickname,
                    avatarId,
                    email: email ?? null,
                    plan: 'FREE',
                },
            });
        } else {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { nickname, avatarId },
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
                audience: process.env.GOOGLE_CLIENT_ID ?? undefined,
            });

            const payload = ticket.getPayload();
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
}
