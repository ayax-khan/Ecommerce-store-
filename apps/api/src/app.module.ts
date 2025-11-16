import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CheckoutModule } from './checkout/checkout.module';
import { WebhooksController } from './checkout/webhooks.controller';
import { AdminModule } from './admin/admin.module';
import { OrdersModule } from './orders/orders.module';
import { MeModule } from './me/me.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MongooseModule.forRoot(process.env.MONGO_URL || 'mongodb://localhost:27017/buy2enjoy'),
    ProductsModule,
    AuthModule,
    CartModule,
    WishlistModule,
    CheckoutModule,
    AdminModule,
    OrdersModule,
    MeModule,
    CategoriesModule,
  ],
  controllers: [HealthController, WebhooksController],
})
export class AppModule {}
