import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  async listFlat() {
    return this.categories.findAllFlat();
  }

  @Get('tree')
  async listTree() {
    return this.categories.findTree();
  }
}
