import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';

@Module({
  controllers: [WishlistController],
  providers: [WishlistService, PrismaClient],
})
export class WishlistModule {}
