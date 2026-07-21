import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function paymentRoutes(fastify: FastifyInstance) {
    // Verify Google Play Billing Receipt
    fastify.post('/payments/verify-google-receipt', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        const schema = z.object({
            purchaseToken: z.string(),
            productId: z.string(),
            plan: z.enum(['PREMIUM1', 'PREMIUM2', 'PREMIUM3']),
        });

        const { plan } = schema.parse(request.body);
        const userId = (request.user as any).id;

        // IN PRODUCTION: Call Google Play Developer API to validate the purchaseToken
        // For now, we simulate a successful validation

        fastify.log.info(`Validating purchase for user ${userId}, plan ${plan}`);

        // Update user plan
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { plan },
        });

        return {
            success: true,
            message: `Plano ${plan} ativado com sucesso!`,
            user: updatedUser
        };
    });
}
