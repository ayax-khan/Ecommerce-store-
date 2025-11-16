import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaClient) {}

  async ensureCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({ where: { userId }, include: { items: true } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId }, include: { items: true } });
    }
    return cart;
  }

  async getCart(userId: number) {
    return this.ensureCart(userId);
  }

  async addItem(userId: number, body: { productId: string; quantity: number; unitPrice?: number }) {
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.create({
      data: { cartId: cart.id, productId: body.productId, quantity: body.quantity, unitPrice: body.unitPrice ?? null },
    });
    return this.getCart(userId);
  }

  async updateQuantities(userId: number, items: { id: number; quantity: number }[]) {
    const cart = await this.ensureCart(userId);
    await Promise.all(
      items.map((i) => this.prisma.cartItem.update({ where: { id: i.id }, data: { quantity: i.quantity } }))
    );
    return this.getCart(userId);
  }
}
