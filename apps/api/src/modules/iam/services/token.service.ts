import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '@workspace/database';
import { AuditService } from './audit.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateRawToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  // Short-lived Access Token (15 minutes)
  async signAccessToken(userId: string, email: string, role: Role, universityId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, email, role, universityId },
      { expiresIn: '15m' },
    );
  }

  // Create new session & issue tokens
  async createSession(userId: string, email: string, role: Role, universityId: string, ip?: string, userAgent?: string) {
    const rawRefreshToken = this.generateRawToken();
    const refreshTokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        ipAddress: ip,
        deviceInfo: userAgent,
        expiresAt,
      },
    });

    const accessToken = await this.signAccessToken(userId, email, role, universityId);

    return {
      accessToken,
      refreshToken: `${session.id}.${rawRefreshToken}`, // Packed Session ID + Token
    };
  }

  // Refresh Token Rotation with REUSE DETECTION
  async rotateSession(packedToken: string, ip?: string, userAgent?: string) {
    const [sessionId, rawToken] = packedToken.split('.');
    if (!sessionId || !rawToken) {
      throw new UnauthorizedException('Invalid token format');
    }

    const tokenHash = this.hashToken(rawToken);

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    // 🚨 BREACH DETECTION: If session is revoked or token doesn't match, revoke entire family!
    if (!session || session.isRevoked || session.refreshTokenHash !== tokenHash) {
      if (session) {
        // Token reuse detected! Invalidate all sessions for this family immediately
        await this.prisma.session.updateMany({
          where: { familyId: session.familyId },
          data: { isRevoked: true },
        });

        await this.audit.log({
          userId: session.userId,
          action: 'TOKEN_REUSE_DETECTED',
          ipAddress: ip,
          userAgent,
          metadata: { sessionId: session.id, familyId: session.familyId },
        });
      }
      throw new UnauthorizedException('Session terminated due to security violation');
    }

    if (new Date() > session.expiresAt) {
      throw new UnauthorizedException('Session expired');
    }

    // Rotate: generate new refresh token and advance the chain
    const newRawToken = this.generateRawToken();
    const newHash = this.hashToken(newRawToken);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHash,
        lastSeenAt: new Date(),
        ipAddress: ip,
      },
    });

    const newAccessToken = await this.signAccessToken(
      session.user.id,
      session.user.email,
      session.user.role,
      session.user.universityId,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: `${session.id}.${newRawToken}`,
      user: session.user,
    };
  }

  async revokeSession(packedToken: string) {
    const [sessionId] = packedToken.split('.');
    if (sessionId) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { isRevoked: true },
      }).catch(() => null);
    }
  }
}