import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MeController } from './me.controller';

@Module({
  controllers: [MeController],
  providers: [PrismaClient],
})
export class MeModule {}
