import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@workspace/database';

export interface AuditContext {
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(context: AuditContext) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: context.userId,
          action: context.action,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          metadata: context.metadata ? JSON.parse(JSON.stringify(context.metadata)) : undefined,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to record audit event: ${context.action}`, err);
    }
  }
}