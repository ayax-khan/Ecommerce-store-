import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument, Product } from './schemas/product.schema';
import { PrismaClient } from '@prisma/client';

export type ProductSearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string; // 'price_asc' | 'price_desc' | 'newest'
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private prisma: PrismaClient,
  ) {}

  async search(params: ProductSearchParams) {
    const { q, category, brand, minPrice, maxPrice } = params;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(Math.max(1, params.limit || 24), 60);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category) filter.categoryIds = category;
    if (brand) filter.brand = brand;
    if (minPrice != null || maxPrice != null) {
      filter.price = {};
      if (minPrice != null) filter.price.$gte = minPrice;
      if (maxPrice != null) filter.price.$lte = maxPrice;
    }

    let sort: any = {};
    switch (params.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Only show active products in customer-facing listing
    (filter as any).isActive = true;

    const [items, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id: string) {
    return this.productModel.findById(id).lean();
  }

  async getHomeSections() {
    // Hot deals: cheapest items for now
    const hotDeals = await this.productModel
      .find({ isActive: true })
      .sort({ price: 1 })
      .limit(8)
      .lean();

    // New arrivals: latest createdAt
    const newArrivals = await this.productModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Best sellers: aggregate from OrderItem in Postgres
    const bestSellerRows = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 8,
    });
    const bestIds = bestSellerRows.map((r) => r.productId);
    const bestProducts = bestIds.length
      ? await this.productModel.find({ _id: { $in: bestIds }, isActive: true }).lean()
      : [];
    const bestMap = new Map<string, any>();
    for (const p of bestProducts) bestMap.set(String(p._id), p);
    const bestSellers = bestIds
      .map((id) => bestMap.get(id))
      .filter(Boolean);

    return { hotDeals, newArrivals, bestSellers };
  }
}
