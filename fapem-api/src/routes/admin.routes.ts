import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function adminRoutes(fastify: FastifyInstance) {
    // Stats
    fastify.get('/admin/stats', { onRequest: [fastify.verifyAdmin] }, async () => {
        const totalUsers = await prisma.user.count();
        const planStats = await prisma.user.groupBy({
            by: ['plan'],
            _count: true
        });

        // Simulated MRR calculation based on plans (Mock prices: PREMIUM1=0.99, PREMIUM2=9.90, PREMIUM3=24.99)
        const mrr = planStats.reduce((acc, stat) => {
            if (stat.plan === 'PREMIUM1') return acc + (stat._count * 0.99);
            if (stat.plan === 'PREMIUM2') return acc + (stat._count * 9.90);
            if (stat.plan === 'PREMIUM3') return acc + (stat._count * 24.99);
            return acc;
        }, 0);

        return {
            totalUsers,
            planStats,
            mrr: Number(mrr.toFixed(2))
        };
    });

    // User Management
    fastify.get('/admin/users', { onRequest: [fastify.verifyAdmin] }, async () => {
        return prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
    });

    fastify.patch('/admin/users/:id/plan', { onRequest: [fastify.verifyAdmin] }, async (request) => {
        const paramsSchema = z.object({ id: z.string() });
        const bodySchema = z.object({ plan: z.enum(['FREE', 'PREMIUM1', 'PREMIUM2', 'PREMIUM3']) });

        const { id } = paramsSchema.parse(request.params);
        const { plan } = bodySchema.parse(request.body);

        return prisma.user.update({
            where: { id },
            data: { plan }
        });
    });

    fastify.post('/admin/users/:id/ban', { onRequest: [fastify.verifyAdmin] }, async (request) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        const user = await prisma.user.findUnique({ where: { id } });

        return prisma.user.update({
            where: { id },
            data: { isBanned: !user?.isBanned }
        });
    });

    // Support Tickets
    fastify.get('/admin/tickets', { onRequest: [fastify.verifyAdmin] }, async () => {
        return prisma.supportTicket.findMany({
            include: { user: { select: { nickname: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    });

    fastify.post('/admin/tickets/:id/reply', { onRequest: [fastify.verifyAdmin] }, async (request) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        const { response } = z.object({ response: z.string() }).parse(request.body);

        return prisma.supportTicket.update({
            where: { id },
            data: {
                adminResponse: response,
                status: 'RESOLVED'
            }
        });
    });

    // Delete Ticket (Admin Only)
    fastify.delete('/admin/tickets/:id', { onRequest: [fastify.verifyAdmin] }, async (request) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        await prisma.supportTicket.delete({ where: { id } });
        return { success: true };
    });

    // Delete Custom Room (Admin Only)
    fastify.delete('/admin/rooms/:id', { onRequest: [fastify.verifyAdmin] }, async (request) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        await prisma.room.delete({ where: { id } });
        return { success: true };
    });

    // Delete Forum Topic (Admin Only)
    fastify.delete('/admin/forum/topics/:id', { onRequest: [fastify.verifyAdmin] }, async (request) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        await prisma.topic.delete({ where: { id } });
        return { success: true };
    });
}
