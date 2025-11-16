import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '24',
    @Query('sort') sort?: string,
  ) {
    return this.products.search({
      q,
      category,
      brand,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 24,
      sort,
    });
  }

  @Get('home-sections')
  async homeSections() {
    return this.products.getHomeSections();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.products.getById(id);
  }
}
