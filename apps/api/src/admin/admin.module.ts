import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AdminProductsController } from './admin.products.controller';
import { AdminOrdersController } from './admin.orders.controller';
import { AdminCategoriesController } from './admin.categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CategoriesModule,
  ],
  controllers: [AdminProductsController, AdminOrdersController, AdminCategoriesController],
  providers: [PrismaClient],
})
export class AdminModule {}
