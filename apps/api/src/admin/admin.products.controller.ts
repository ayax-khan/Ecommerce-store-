import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { PrismaClient } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/products')
export class AdminProductsController {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private prisma: PrismaClient,
  ) {}

  @Post()
  async create(@Body() body: any) {
    // derive effective price and stock status
    const regularPrice = body.regularPrice ?? body.price;
    const salePrice = body.salePrice ?? null;
    const effectivePrice = salePrice && salePrice > 0 ? salePrice : regularPrice;
    const availableQty = body.availableQty ?? 0;
    const stockStatus = body.stockStatus || (availableQty > 0 ? 'in_stock' : 'out_of_stock');

    const payload = {
      title: body.title,
      description: body.description,
      price: effectivePrice,
      regularPrice,
      salePrice,
      images: body.images || [],
      categoryIds: body.categoryIds || [],
      tags: body.tags || [],
      brand: body.brand,
      availableQty,
      stockStatus,
      weight: body.weight,
      dimensions: body.dimensions,
      isActive: body.isActive !== false,
      variants: body.variants || [],
    };

    const created = await this.productModel.create(payload);
    // sync inventory
    await this.prisma.inventory.upsert({
      where: { productId: String(created._id) },
      create: { productId: String(created._id), availableQty: created.availableQty ?? 0, allocatedQty: 0 },
      update: { availableQty: created.availableQty ?? 0 },
    });
    return created;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const regularPrice = body.regularPrice ?? body.price;
    const salePrice = body.salePrice ?? null;
    const update: any = { ...body };
    if (regularPrice != null) update.regularPrice = regularPrice;
    if (salePrice !== undefined) update.salePrice = salePrice;
    if (regularPrice != null) {
      update.price = salePrice && salePrice > 0 ? salePrice : regularPrice;
    }
    if (body.availableQty != null) {
      update.availableQty = body.availableQty;
      update.stockStatus = body.stockStatus || (body.availableQty > 0 ? 'in_stock' : 'out_of_stock');
    }

    const updated = await this.productModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (typeof body.availableQty === 'number') {
      await this.prisma.inventory.upsert({
        where: { productId: id },
        create: { productId: id, availableQty: body.availableQty, allocatedQty: 0 },
        update: { availableQty: body.availableQty },
      });
    }
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productModel.findByIdAndDelete(id);
    try {
      await this.prisma.inventory.delete({ where: { productId: id } });
    } catch {
      // ignore if inventory row missing
    }
    return { deleted: true };
  }

  @Get()
  async list() {
    return this.productModel.find().limit(100).lean();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.productModel.findById(id).lean();
  }
}
