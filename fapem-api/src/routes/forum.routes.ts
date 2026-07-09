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

    // Get Topic Details with Posts
    fastify.get('/forum/topics/:id', async (request, reply) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        const topic = await prisma.topic.findUnique({
            where: { id },
            include: {
                author: {
                    select: { nickname: true, avatarId: true }
                },
                posts: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: {
                            select: { nickname: true, avatarId: true }
                        }
                    }
                }
            }
        });

        if (!topic) {
            return reply.status(404).send({ error: 'Tópico não encontrado.' });
        }

        return topic;
    });

    // Add Reply Post to Topic
    fastify.post('/forum/topics/:id/replies', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const { id: topicId } = z.object({ id: z.string() }).parse(request.params);
        const schema = z.object({
            content: z.string().min(1),
        });
        const { content } = schema.parse(request.body);
        const userId = (request.user as any).id;

        const topic = await prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) {
            return reply.status(404).send({ error: 'Tópico não encontrado.' });
        }

        const post = await prisma.$transaction(async (tx) => {
            const newPost = await tx.post.create({
                data: {
                    content,
                    authorId: userId,
                    topicId,
                },
                include: {
                    author: {
                        select: { nickname: true, avatarId: true }
                    }
                }
            });

            await tx.topic.update({
                where: { id: topicId },
                data: {
                    repliesCount: { increment: 1 }
                }
            });

            return newPost;
        });

        return post;
    });

    // React to a Post
    fastify.post('/forum/posts/:postId/react', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const { postId } = z.object({ postId: z.string() }).parse(request.params);
        const schema = z.object({
            reaction: z.string()
        });
        const { reaction } = schema.parse(request.body);

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return reply.status(404).send({ error: 'Post não encontrado.' });
        }

        const currentReactions = (post.reactions as Record<string, number> | null) || {};
        const count = currentReactions[reaction] || 0;
        const updatedReactions = {
            ...currentReactions,
            [reaction]: count + 1
        };

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                reactions: updatedReactions
            }
        });

        return updatedPost;
    });
}
