import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { prisma } from '../lib/prisma';

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

                const jwtUser = request.user as { id: string } | undefined;
                if (jwtUser && jwtUser.id) {
                    const user = await prisma.user.findUnique({
                        where: { id: jwtUser.id },
                        select: { isBanned: true }
                    });

                    if (!user || user.isBanned) {
                        return reply.status(403).send({
                            error: 'Acesso negado: Sua conta foi suspensa por violar as diretrizes de conduta.'
                        });
                    }
                }
            } catch (err) {
                reply.send(err);
            }
        }
    );
});
