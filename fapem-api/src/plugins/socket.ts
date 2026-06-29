import type { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Server } from 'socket.io';

declare module 'fastify' {
    interface FastifyInstance {
        io: Server;
    }
}

export default fastifyPlugin(async (fastify: FastifyInstance) => {
    const io = new Server(fastify.server, {
        cors: {
            origin: '*', // Refine in production
            methods: ['GET', 'POST'],
        },
    });

    fastify.decorate('io', io);

    io.on('connection', (socket) => {
        fastify.log.info(`Socket connected: ${socket.id}`);

        socket.on('join-room', (roomId: string) => {
            socket.join(roomId);
            fastify.log.info(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('disconnect', () => {
            fastify.log.info(`Socket disconnected: ${socket.id}`);
        });
    });

    fastify.addHook('onClose', (instance, done) => {
        instance.io.close();
        done();
    });
});
