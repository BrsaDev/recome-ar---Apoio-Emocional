import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export default fastifyPlugin(async (fastify: FastifyInstance) => {
    fastify.decorate(
        'authenticate',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        }
    );
});
