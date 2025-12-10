import 'dotenv/config'; // Load env vars before anything else
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SecurityLoggerInterceptor } from './common/interceptors/security-logger.interceptor';
import { PrismaService } from './prisma.service';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditService } from './modules/audit/audit.service';
import { AccessControlGuard } from './common/guards/access-control.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api'); // /api/v1/...

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));
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
  console.log('✅  Database connected successfully');
  console.log('----------------------------------------------------------');
}
bootstrap();
