import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authPlugin from './plugins/auth';
import adminAuthPlugin from './plugins/adminAuth';
import socketPlugin from './plugins/socket';
import { authRoutes } from './routes/auth.routes';
import { forumRoutes } from './routes/forum.routes';
import { roomsRoutes } from './routes/rooms.routes';
import { paymentRoutes } from './routes/payment.routes';
import { adminRoutes } from './routes/admin.routes';

dotenv.config();

const fastify = Fastify({
    logger: true,
});

// Register Plugins
fastify.register(cors, {
    origin: true,
});

fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'super-secret-fapem-key',
});

// Register Custom Plugins & Routes
fastify.register(authPlugin);
fastify.register(adminAuthPlugin);
fastify.register(socketPlugin);
fastify.register(authRoutes);
fastify.register(forumRoutes);
fastify.register(roomsRoutes);
fastify.register(paymentRoutes);
fastify.register(adminRoutes);

// Health Check
fastify.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 FAPEM API running on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
