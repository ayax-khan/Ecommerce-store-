import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [CartController],
  providers: [CartService, PrismaClient],
})
export class CartModule {}
