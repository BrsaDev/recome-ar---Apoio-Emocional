import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

declare module 'fastify' {
    interface FastifyInstance {
        verifyAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export default fastifyPlugin(async (fastify: FastifyInstance) => {
    fastify.decorate(
        'verifyAdmin',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
                const user = request.user as any;
                if (user.role !== 'ADMIN') {
                    reply.status(403).send({ error: 'Acesso negado: Requer privilégios administrativos.' });
                }
            } catch (err) {
                reply.send(err);
            }
        }
    );
});
