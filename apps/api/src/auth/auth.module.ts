import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { PrismaClient } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      useFactory: () => {
        if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
          return {
            privateKey: process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
            publicKey: process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
            signOptions: { algorithm: 'RS256', expiresIn: '15m' },
          };
        }
        return {
          secret: process.env.JWT_SECRET || 'devsecret',
          signOptions: { algorithm: 'HS256', expiresIn: '15m' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, PrismaClient, JwtStrategy],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
