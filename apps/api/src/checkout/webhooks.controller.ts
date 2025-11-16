import { Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

@Controller('webhooks')
export class WebhooksController {
  private stripe: Stripe | null = null;
  constructor(private prisma: PrismaClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    this.stripe = key ? new Stripe(key, { apiVersion: '2024-06-20' }) : null;
  }

  @Post('stripe')
  @HttpCode(200)
  async handleStripe(@Req() req: any, @Headers('stripe-signature') signature: string) {
    if (!this.stripe) return { received: true };
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const body = req.rawBody || req.body; // ensure raw body is available in main.ts if needed
    try {
      const event = this.stripe.webhooks.constructEvent(body, signature, whSecret!);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = Number(session.metadata?.orderId);
        if (orderId) {
          await this.prisma.$transaction(async (tx) => {
            await tx.payment.create({
              data: {
                orderId,
                gateway: 'stripe',
                amount: (session.amount_total || 0) / 100,
                status: 'Paid',
                transactionId: session.payment_intent?.toString() || null,
                paidAt: new Date(),
              },
            });
            const items = await tx.orderItem.findMany({ where: { orderId } });
            for (const it of items) {
              await tx.inventory.update({
                where: { productId: it.productId },
                data: { allocatedQty: { decrement: it.quantity } },
              });
            }
            await tx.order.update({ where: { id: orderId }, data: { status: 'Paid' } });
          });
        }
      }
    } catch (e) {
      return { error: 'signature verification failed' };
    }
    return { received: true };
  }
}
