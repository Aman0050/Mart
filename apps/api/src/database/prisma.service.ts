import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected');
    } catch (e) {
      this.logger.error('❌ Database connection failed. Running in mocked mode. Error: ' + e.message);
    }

    // Log slow queries (>100ms) in development
    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error Prisma event typing
      this.$on('query', (e: { query: string; duration: number }) => {
        if (e.duration > 100) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Soft delete helper — sets deletedAt instead of removing the row.
   * Usage: prisma.softDelete('user', { id: 'xxx' })
   */
  async softDelete(model: string, where: Record<string, unknown>) {
    return this[model].update({
      where,
      data: { status: 'deleted' },
    });
  }

  /**
   * Paginate helper — wraps findMany with count.
   */
  async paginate<T>(
    model: string,
    args: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
      page?: number;
      limit?: number;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    },
  ): Promise<{ data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const { page = 1, limit = 20, where = {}, orderBy = { createdAt: 'desc' }, include, select } = args;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this[model].findMany({ where, orderBy, skip, take: limit, ...(include && { include }), ...(select && { select }) }),
      this[model].count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
