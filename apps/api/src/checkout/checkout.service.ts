import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class CheckoutService {
  private stripe: Stripe | null = null;

  constructor(private prisma: PrismaClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    this.stripe = key ? new Stripe(key, { apiVersion: '2024-06-20' }) : null;
  }

  async createCheckout(userId: number, opts: { successUrl?: string; cancelUrl?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (!user.isEmailVerified) {
      const now = new Date();
      let token = user.emailVerifyToken;
      let expires = user.emailVerifyExpiresAt;
      if (!token || !expires || expires < now) {
        const { randomBytes } = await import('crypto');
        token = randomBytes(32).toString('hex');
        expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        await this.prisma.user.update({
          where: { id: userId },
          data: { emailVerifyToken: token, emailVerifyExpiresAt: expires },
        });
      }
      // eslint-disable-next-line no-console
      console.log(`Email verification required. Link for ${user.email}: http://localhost:3000/verify-email?token=${token}`);
      throw new BadRequestException({
        code: 'EMAIL_VERIFICATION_REQUIRED',
        message: 'Please verify your email address. We have sent you a verification link.',
      });
    }

    const cart = await this.prisma.cart.findUnique({ where: { userId }, include: { items: true } });
    if (!cart || cart.items.length === 0) return { error: 'Cart is empty' };

    // Reserve inventory and create order atomically
    const { orderId, total, items } = await this.prisma.$transaction(async (tx) => {
      // Reserve inventory per item with row-level locks
      for (const item of cart.items) {
        // Ensure row exists and lock it
        await tx.$executeRawUnsafe(
          'INSERT INTO "Inventory" ("productId", "availableQty", "allocatedQty", "updatedAt") VALUES ($1, 0, 0, NOW()) ON CONFLICT ("productId") DO NOTHING',
          item.productId,
        );
        await tx.$executeRawUnsafe(
          'SELECT 1 FROM "Inventory" WHERE "productId" = $1 FOR UPDATE',
          item.productId,
        );
        const inv = await tx.inventory.findUnique({ where: { productId: item.productId } });
        const qty = item.quantity;
        if (!inv || inv.availableQty < qty) {
          throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
        }
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { availableQty: { decrement: qty }, allocatedQty: { increment: qty } },
        });
      }

      const totalAmount = cart.items.reduce((s, i) => s + Number(i.unitPrice ?? 0) * i.quantity, 0);
      const order = await tx.order.create({
        data: { userId, status: 'Pending', totalAmount },
      });
      // Create order items
      for (const ci of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: ci.productId,
            quantity: ci.quantity,
            unitPrice: (ci.unitPrice ?? new Prisma.Decimal(0)) as any,
          },
        });
      }
      // Clear cart items after order creation so cart is empty for the user
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return { orderId: order.id, total: totalAmount, items: cart.items };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    const lineItems = items.map((i) => ({
      price_data: {
        currency: 'pkr',
        product_data: { name: i.productId },
        unit_amount: Math.round(Number(i.unitPrice ?? 0) * 100),
      },
      quantity: i.quantity,
    }));

    if (!this.stripe) {
      return { orderId, message: 'Stripe key not configured. Skipping session creation.' };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: opts.successUrl || 'http://localhost:3000/success?order={CHECKOUT_SESSION_ID}',
      cancel_url: opts.cancelUrl || 'http://localhost:3000/cart',
      metadata: { orderId: String(orderId) },
    });

    return { orderId, sessionId: session.id, url: session.url };
  }
}
