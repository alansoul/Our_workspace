import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountStatus, User } from '@workspace/database';
import { AuthUser } from '@workspace/shared-types';
import { PrismaService } from '@workspace/database';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AuditService } from './audit.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly audit: AuditService,
  ) {}

  // ═══════════════════════════════════════════════════════
  // REGISTER: User + PasswordCredential + Session + Audit
  // ═══════════════════════════════════════════════════════
  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const domain = dto.email.split('@')[1]?.toLowerCase();
    if (!domain) {
      throw new BadRequestException('Invalid email format');
    }

    const university = await this.prisma.university.findUnique({
      where: { emailDomain: domain },
    });
    if (!university) {
      throw new BadRequestException(
        `Your institution domain (@${domain}) is not registered. Contact admin.`,
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase() },
          { username: dto.username.toLowerCase() },
        ],
      },
    });
    if (existingUser) {
      throw new ConflictException('Email or username is already taken');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          username: dto.username.toLowerCase(),
          fullName: dto.fullName,
          branch: dto.branch,
          batch: dto.batch,
          rollNumber: dto.rollNumber,
          universityId: university.id,
          status: AccountStatus.ACTIVE,
        },
      });

      await tx.passwordCredential.create({
        data: {
          userId: createdUser.id,
          passwordHash,
        },
      });

      return createdUser;
    });

    const tokens = await this.tokenService.createSession(
      user.id,
      user.email,
      user.role,
      user.universityId,
      ip,
      userAgent,
    );

    await this.audit.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      ipAddress: ip,
      userAgent,
    });

    return {
      message: 'Registration successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  // ═══════════════════════════════════════════════════════
  // LOGIN: Credentials + State Check + Session + Audit
  // ═══════════════════════════════════════════════════════
  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const invalidCredentialsMsg = 'Invalid email or password';

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { password: true },
    });

    if (!user || !user.password) {
      await this.audit.log({
        action: 'LOGIN_FAILED_UNKNOWN_USER',
        ipAddress: ip,
        userAgent,
        metadata: { attemptedEmail: dto.email },
      });
      throw new UnauthorizedException(invalidCredentialsMsg);
    }

    if (user.status !== AccountStatus.ACTIVE) {
      await this.audit.log({
        userId: user.id,
        action: 'LOGIN_BLOCKED_INACTIVE_ACCOUNT',
        ipAddress: ip,
        userAgent,
        metadata: { status: user.status },
      });
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      user.password.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      await this.audit.log({
        userId: user.id,
        action: 'LOGIN_FAILED_BAD_PASSWORD',
        ipAddress: ip,
        userAgent,
      });
      throw new UnauthorizedException(invalidCredentialsMsg);
    }

    const tokens = await this.tokenService.createSession(
      user.id,
      user.email,
      user.role,
      user.universityId,
      ip,
      userAgent,
    );

    await this.audit.log({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      ipAddress: ip,
      userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  // ═══════════════════════════════════════════════════════
  // REFRESH & LOGOUT
  // ═══════════════════════════════════════════════════════
  async refreshSession(refreshToken: string, ip?: string, userAgent?: string) {
    const result = await this.tokenService.rotateSession(refreshToken, ip, userAgent);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: this.sanitizeUser(result.user),
    };
  }

  async logout(refreshToken: string) {
    await this.tokenService.revokeSession(refreshToken);
  }

  private sanitizeUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      universityId: user.universityId,
      emailVerified: user.emailVerified,
    };
  }
}