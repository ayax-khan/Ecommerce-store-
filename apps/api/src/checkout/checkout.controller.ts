import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CheckoutService } from './checkout.service';
import { Response } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post()
  async initiate(@Req() req: any, @Body() body: { successUrl?: string; cancelUrl?: string }) {
    return this.checkout.createCheckout(req.user.userId, body);
  }
}
