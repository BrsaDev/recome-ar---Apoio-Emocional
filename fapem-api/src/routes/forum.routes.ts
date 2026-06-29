import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function forumRoutes(fastify: FastifyInstance) {
    // List Topics
    fastify.get('/forum/topics', async (request) => {
        const querySchema = z.object({
            category: z.string().optional(),
            search: z.string().optional(),
        });

        const { category, search } = querySchema.parse(request.query);

        const topics = await prisma.topic.findMany({
            where: {
                ...(category && category !== 'Tudos' ? { category } : {}),
                ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
            },
            include: {
                author: {
                    select: { nickname: true, avatarId: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return topics;
    });

    // Create Topic
    fastify.post('/forum/topics', {
        onRequest: [fastify.authenticate]
    }, async (request) => {
        const schema = z.object({
            title: z.string().min(5).max(100),
            category: z.string(),
            content: z.string().min(10),
        });

        const { title, category, content } = schema.parse(request.body);
        const userId = (request.user as any).id;

        const topic = await prisma.topic.create({
            data: {
                title,
                category,
                authorId: userId,
                posts: {
                    create: {
                        content,
                        authorId: userId,
                    }
                }
            },
            include: {
                posts: true
            }
        });

        return topic;
    });
}
