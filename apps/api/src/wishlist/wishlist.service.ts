import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaClient) {}

  async ensure(userId: number) {
    let wl = await this.prisma.wishlist.findUnique({ where: { userId }, include: { items: true } });
    if (!wl) wl = await this.prisma.wishlist.create({ data: { userId }, include: { items: true } });
    return wl;
  }

  get(userId: number) {
    return this.ensure(userId);
  }

  async add(userId: number, productId: string) {
    const wl = await this.ensure(userId);
    await this.prisma.wishlistItem.create({ data: { wishlistId: wl.id, productId } });
    return this.get(userId);
  }

  async remove(userId: number, itemId: number) {
    await this.prisma.wishlistItem.delete({ where: { id: itemId } });
    return this.get(userId);
  }
}
