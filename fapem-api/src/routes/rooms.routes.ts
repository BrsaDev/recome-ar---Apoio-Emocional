import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AccessToken } from 'livekit-server-sdk';

export async function roomsRoutes(fastify: FastifyInstance) {
    // List Rooms
    fastify.get('/rooms', async () => {
        const rooms = await prisma.room.findMany({
            include: {
                owner: {
                    select: { nickname: true }
                }
            }
        });

        return rooms;
    });

    // Generate LiveKit Token
    fastify.post('/rooms/:id/token', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string(),
        });

        const { id: roomId } = paramsSchema.parse(request.params);
        const userId = (request.user as any).id;
        const nickname = (request.user as any).nickname;
        const userPlan = (request.user as any).plan;

        if (userPlan === 'FREE') {
            return reply.status(403).send({ error: 'Acesso restrito: O plano gratuito tem acesso apenas a chat de texto.' });
        }

        // Verify room exists (optional but recommended)
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
            return reply.status(404).send({ error: 'Sala não encontrada.' });
        }

        // LiveKit Token Logic
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
            return reply.status(500).send({ error: 'Erro de servidor: Chaves do LiveKit não configuradas para o ambiente.' });
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: userId,
            name: nickname,
        });

        at.addGrant({
            roomJoin: true,
            room: roomId,
            canPublish: true,
            canSubscribe: true
        });

        return { token: await at.toJwt() };
    });

    fastify.post('/rooms', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const userRole = (request.user as any).plan;
        if (userRole === 'FREE') {
            return reply.status(403).send({ error: 'Apenas usuários Premium podem criar salas customizadas.' });
        }

        const schema = z.object({
            name: z.string().min(3).max(40),
            description: z.string().max(100),
            type: z.enum(['PUBLIC', 'VIP']),
        });

        const { name, description, type } = schema.parse(request.body);
        const userId = (request.user as any).id;

        const room = await prisma.room.create({
            data: {
                name,
                description,
                type: type === 'VIP' ? 'VIP' : 'PREMIUM', // Premium rooms are technically marked as PREMIUM or VIP depending on owner preference
                ownerId: userId,
            }
        });

        return room;
    });

    // Delete Custom Room
    fastify.delete('/rooms/:id', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string(),
        });
        const { id } = paramsSchema.parse(request.params);
        const userId = (request.user as any).id;

        const room = await prisma.room.findUnique({ where: { id } });
        if (!room) {
            return reply.status(404).send({ error: 'Sala não encontrada.' });
        }

        if (room.ownerId !== userId) {
            return reply.status(403).send({ error: 'Você não tem permissão para excluir esta sala.' });
        }

        await prisma.room.delete({ where: { id } });
        return { success: true };
    });

    // Edit Custom Room
    fastify.patch('/rooms/:id', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string(),
        });
        const { id } = paramsSchema.parse(request.params);
        const userId = (request.user as any).id;

        const schema = z.object({
            name: z.string().min(3).max(40).optional(),
            description: z.string().max(100).optional(),
            type: z.enum(['PUBLIC', 'VIP']).optional(),
        });

        const { name, description, type } = schema.parse(request.body);

        const room = await prisma.room.findUnique({ where: { id } });
        if (!room) {
            return reply.status(404).send({ error: 'Sala não encontrada.' });
        }

        if (room.ownerId !== userId) {
            return reply.status(403).send({ error: 'Você não tem permissão para editar esta sala.' });
        }

        const updatedRoom = await prisma.room.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(type && { type: type === 'VIP' ? 'VIP' : 'PREMIUM' })
            }
        });

        return updatedRoom;
    });
}
