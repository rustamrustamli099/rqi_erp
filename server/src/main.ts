import 'dotenv/config'; // Load env vars before anything else
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { json, urlencoded } from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import { GlobalExceptionFilter } from './platform/http/filters/http-exception.filter';
import { TransformInterceptor } from './platform/http/interceptors/transform.interceptor';
import { SanitizationInterceptor } from './platform/http/interceptors/sanitization.interceptor';
import { SecurityLoggerInterceptor } from './platform/http/interceptors/security-logger.interceptor';
import { PrismaService } from './prisma.service';
import { AuditInterceptor } from './platform/http/interceptors/audit.interceptor';
import { AuditService } from './platform/audit/audit.service';
import { AccessControlGuard } from './platform/auth/access-control.guard';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // [OBSERVABILITY] Use Structured JSON Logger
  const { Logger } = require('nestjs-pino');
  app.useLogger(app.get(Logger));

  // Enable API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api'); // /api/v1/...

  // [SECURITY] Enterprise Hardening: Strict Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"], // Strict: No inline scripts
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null, // Just presence of key is enough, usually. Helmet 6 uses boolean? Helmet 4/5 uses [] or null.
        // Let's use correct syntax for latest helmet usually just having the key is fine.
      },
      useDefaults: true
    },
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny', // Prevent clickjacking
    },
  }));

  // [SECURITY] Request Safety: Body Limits
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));
  // [SECURITY] Sanitization: Prevent Stored XSS
  app.useGlobalInterceptors(new SanitizationInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new SecurityLoggerInterceptor(app.get(PrismaService)));
  app.useGlobalInterceptors(new AuditInterceptor(app.get(AuditService)));

  // Swagger Configuration
  const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
  const config = new DocumentBuilder()
    .setTitle('RQI API')
    .setDescription('ERP System Basic API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log('----------------------------------------------------------');
  console.log('🚀  RQI ERP Backend is running on port ' + (process.env.PORT ?? 3000));
  try {
    const prismaService = app.get(PrismaService);
    await prismaService.$connect();
    console.log('✅  Database connected successfully');
  } catch (error) {
    console.error('❌  Database connection failed:', error);
    process.exit(1);
  }
  console.log('----------------------------------------------------------');
}
bootstrap();
