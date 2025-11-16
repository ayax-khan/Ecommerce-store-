import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  async get(@Req() req: any) {
    return this.cart.getCart(req.user.userId);
  }

  @Post()
  async add(@Req() req: any, @Body() body: { productId: string; quantity: number; unitPrice?: number }) {
    return this.cart.addItem(req.user.userId, body);
  }

  @Put()
  async update(@Req() req: any, @Body() body: { items: { id: number; quantity: number }[] }) {
    return this.cart.updateQuantities(req.user.userId, body.items);
  }
}
