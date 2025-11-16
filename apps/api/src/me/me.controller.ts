import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

class AddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('me')
export class MeController {
  constructor(private prisma: PrismaClient) {}

  @Get('addresses')
  async listAddresses(@Req() req: any) {
    return this.prisma.address.findMany({ where: { userId: req.user.userId }, orderBy: { id: 'desc' } });
  }

  @Post('addresses')
  async createAddress(@Req() req: any, @Body() dto: AddressDto) {
    return this.prisma.address.create({
      data: {
        userId: req.user.userId,
        label: dto.label,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'Pakistan',
      },
    });
  }

  @Put('addresses/:id')
  async updateAddress(@Req() req: any, @Param('id') id: string, @Body() dto: AddressDto) {
    const addrId = Number(id);
    const addr = await this.prisma.address.findUnique({ where: { id: addrId } });
    if (!addr || addr.userId !== req.user.userId) {
      return { error: 'Not found' };
    }
    return this.prisma.address.update({
      where: { id: addrId },
      data: {
        label: dto.label,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || addr.country,
      },
    });
  }

  @Delete('addresses/:id')
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    const addrId = Number(id);
    const addr = await this.prisma.address.findUnique({ where: { id: addrId } });
    if (!addr || addr.userId !== req.user.userId) {
      return { error: 'Not found' };
    }
    await this.prisma.address.delete({ where: { id: addrId } });
    return { deleted: true };
  }
}
