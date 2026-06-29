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

        // Verify room exists (optional but recommended)
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
            return reply.status(404).send({ error: 'Sala não encontrada.' });
        }

        // LiveKit Token Logic
        const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
        const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';

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

    // Create Custom Room (Premium Only)
    fastify.post('/rooms', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const userRole = (request.user as any).plan;
        if (userRole !== 'PREMIUM') {
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
}
