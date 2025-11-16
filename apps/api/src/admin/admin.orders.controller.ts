import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaClient } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private prisma: PrismaClient) {}

  @Get()
  async list(@Query('status') status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { id: 'desc' },
      include: { items: true, payment: true },
      take: 100,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { status: string }) {
    return this.prisma.order.update({ where: { id: Number(id) }, data: { status: body.status } });
  }
}
