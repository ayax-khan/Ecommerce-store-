import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaClient],
})
export class CheckoutModule {}
