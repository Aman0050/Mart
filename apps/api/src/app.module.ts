import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { validateConfig } from './config/config.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SearchModule } from './modules/search/search.module';
import { LeadsModule } from './modules/leads/leads.module';
import { RfqsModule } from './modules/rfqs/rfqs.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { EmailModule } from './modules/email/email.module';

import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // ── Config ──────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      validate: validateConfig,
      envFilePath: ['.env.local', '.env'],
    }),

    // ── Caching ──────────────────────────────────
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 1 minute default
      max: 100,   // max 100 items in cache
    }),

    // ── Rate Limiting ────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },     // 10 req/sec
      { name: 'medium', ttl: 60000, limit: 200 },   // 200 req/min
      { name: 'long', ttl: 3600000, limit: 1000 },  // 1000 req/hr
    ]),

    // ── Core ─────────────────────────────────────
    DatabaseModule,

    // ── Feature Modules ──────────────────────────
    AuthModule,
    UsersModule,
    CompaniesModule,
    ProductsModule,
    CategoriesModule,
    SearchModule,
    LeadsModule,
    RfqsModule,
    PaymentsModule,
    SubscriptionsModule,
    UploadModule,
    NotificationsModule,
    AdminModule,
    HealthModule,
    FeedbacksModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
