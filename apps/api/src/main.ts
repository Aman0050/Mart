import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  if (process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'placeholder_dsn') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0, 
      profilesSampleRate: 1.0,
      environment: process.env.NODE_ENV || 'development',
    });
  }

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const adminUrl = configService.get<string>('ADMIN_URL');

  // ── Security ─────────────────────────────────
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // ── CORS ─────────────────────────────────────
  app.enableCors({
    origin: [frontendUrl, adminUrl].filter((url): url is string => Boolean(url)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // ── Global Prefix & Versioning ────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  // ── Global Pipes ──────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,         // Auto-transform DTOs
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global Filters & Interceptors ─────────────
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
    new SentryInterceptor(),
  );

  // ── Swagger (Dev/Staging only) ─────────────────
  if (configService.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nexmarto API')
      .setDescription('B2B Marketplace REST API — v1')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication')
      .addTag('users', 'User management')
      .addTag('companies', 'Company profiles')
      .addTag('products', 'Product listings')
      .addTag('leads', 'Buyer-seller inquiries')
      .addTag('rfqs', 'Request for Quotation board')
      .addTag('payments', 'Payments & subscriptions')
      .addTag('admin', 'Admin operations')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(`🚀 Nexmarto API running on http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
