import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CategoriesService, CategoryInput } from '../categories/categories.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  async list() {
    return this.categories.findAllFlat();
  }

  @Get('tree')
  async tree() {
    return this.categories.findTree();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.categories.findOne(id);
  }

  @Post()
  async create(@Body() body: CategoryInput) {
    return this.categories.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<CategoryInput>) {
    return this.categories.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categories.delete(id);
  }
}
