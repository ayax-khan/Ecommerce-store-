import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WishlistService } from './wishlist.service';

@UseGuards(AuthGuard('jwt'))
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  get(@Req() req: any) {
    return this.wishlist.get(req.user.userId);
  }

  @Post()
  add(@Req() req: any, @Body() body: { productId: string }) {
    return this.wishlist.add(req.user.userId, body.productId);
  }

  @Delete(':itemId')
  remove(@Req() req: any, @Param('itemId') itemId: string) {
    return this.wishlist.remove(req.user.userId, parseInt(itemId));
  }
}
