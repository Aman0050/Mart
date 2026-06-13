import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const actualPhone = (dto.phone === '0000000000' || !dto.phone) ? `DUMMY-${Date.now().toString().slice(-6)}` : dto.phone;

    // Check uniqueness
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.phone && dto.phone !== '0000000000' ? [{ phone: dto.phone }] : []),
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (exists) {
      throw new ConflictException(
        exists.phone === dto.phone
          ? 'Phone number already registered'
          : 'Email already registered',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: actualPhone,
        passwordHash,
        role: dto.role || 'buyer',
      },
      select: {
        id: true, fullName: true, email: true,
        phone: true, role: true, status: true, createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Trigger Welcome Email asynchronously
    if (user.email) {
      this.emailService.sendWelcomeEmail(user.email, user.fullName).catch(e => {
        console.error('Failed to send welcome email', e);
      });

      // Generate Verification Token
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      await this.prisma.verificationToken.create({
        data: {
          userId: user.id,
          token,
          type: 'email_verification',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        },
      });

      this.emailService.sendVerificationEmail(user.email, token).catch(e => {
        console.error('Failed to send verification email', e);
      });
    }

    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: dto.identifier },
          { email: dto.identifier },
        ],
        status: 'active',
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, refreshToken: __, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.refreshToken) throw new UnauthorizedException('Access denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Access denied');

    const tokens = await this.generateTokens(user.id, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, fullName: true, email: true, phone: true,
        role: true, status: true, emailVerified: true,
        phoneVerified: true, createdAt: true,
        ownedCompany: {
          select: {
            id: true, companyName: true, slug: true,
            verified: true, status: true, logoUrl: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { phone: dto.identifier }],
      },
    });

    if (!user) return { message: 'If this account exists, a reset link has been sent.' };

    // Generate reset token
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours
      },
    });

    // Send email with the token
    if (user.email) {
      this.emailService.sendPasswordResetEmail(user.email, token).catch(e => {
        console.error('Failed to send password reset email', e);
      });
    }

    return { message: 'If this account exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const verification = await this.prisma.verificationToken.findFirst({
      where: {
        token: dto.token,
        type: 'password_reset',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { passwordHash },
      }),
      this.prisma.verificationToken.update({
        where: { id: verification.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const verification = await this.prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'email_verification',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
      this.prisma.verificationToken.update({
        where: { id: verification.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  // ── Private helpers ──────────────────────────

  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('jwt.accessSecret'),
        expiresIn: this.config.get('jwt.accessExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('jwt.refreshSecret'),
        expiresIn: this.config.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }
}
