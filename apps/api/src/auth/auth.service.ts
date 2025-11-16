import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private prisma: PrismaClient,
    private emailService: EmailService,
  ) {}

  async register(dto: { email: string; password: string; name?: string }) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new UnauthorizedException('Email already registered');
    const hash = await bcrypt.hash(dto.password, 10);
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        name: dto.name,
        isEmailVerified: false,
        emailVerifyToken: token,
        emailVerifyExpiresAt: expires,
      },
    });
    await this.emailService.sendVerificationEmail(user.email, token);
    // User can still browse and add to cart; checkout will enforce verification.
    return this.issueTokens(user.id, user.role);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.issueTokens(user.id, user.role);
    return { ...tokens, user: { id: user.id, email: user.email, role: user.role, name: user.name } };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken);
      return this.issueTokens(payload.sub, payload.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If an account exists for this email, a reset link has been sent.' };
    }
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiresAt: expires },
    });
    await this.emailService.sendPasswordResetEmail(user.email, token);
    return { message: 'If an account exists for this email, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token) throw new BadRequestException('Token is required');
    const user = await this.prisma.user.findFirst({ where: { passwordResetToken: token } });
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });
    // We do not auto-login from API; frontend will send user to login page.
    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    if (!token) throw new BadRequestException('Token is required');
    const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user || !user.emailVerifyExpiresAt || user.emailVerifyExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiresAt: null,
      },
    });
    const tokens = await this.issueTokens(updated.id, updated.role);
    return {
      ...tokens,
      user: { id: updated.id, email: updated.email, role: updated.role, name: updated.name },
      message: 'Email verified successfully',
    };
  }

  private async issueTokens(userId: number, role: string) {
    const accessToken = await this.jwt.signAsync({ sub: userId, role }, { expiresIn: '15m' });
    const refreshToken = await this.jwt.signAsync({ sub: userId, role }, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  private logVerificationLink(email: string, token: string) {
    // kept for fallback/logging; EmailService handles real sending.
    // eslint-disable-next-line no-console
    console.log(`Email verification link for ${email}: http://localhost:3000/verify-email?token=${token}`);
  }

  private logPasswordResetLink(email: string, token: string) {
    // eslint-disable-next-line no-console
    console.log(`Password reset link for ${email}: http://localhost:3000/reset-password?token=${token}`);
  }
}
