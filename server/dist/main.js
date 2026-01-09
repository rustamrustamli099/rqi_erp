"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const cookieParser = require('cookie-parser');
const http_exception_filter_1 = require("./platform/http/filters/http-exception.filter");
const transform_interceptor_1 = require("./platform/http/interceptors/transform.interceptor");
const sanitization_interceptor_1 = require("./platform/http/interceptors/sanitization.interceptor");
const security_logger_interceptor_1 = require("./platform/http/interceptors/security-logger.interceptor");
const prisma_service_1 = require("./prisma.service");
const audit_interceptor_1 = require("./platform/http/interceptors/audit.interceptor");
const audit_service_1 = require("./system/audit/audit.service");
const helmet_1 = __importDefault(require("helmet"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const { Logger } = require('nestjs-pino');
    app.useLogger(app.get(Logger));
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.setGlobalPrefix('api');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: null,
            },
            useDefaults: true
        },
        strictTransportSecurity: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        frameguard: {
            action: 'deny',
        },
    }));
    app.use((0, express_1.json)({ limit: '10mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '10mb' }));
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.GlobalExceptionFilter(app.get(core_1.HttpAdapterHost)));
    app.useGlobalInterceptors(new sanitization_interceptor_1.SanitizationInterceptor());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalInterceptors(new security_logger_interceptor_1.SecurityLoggerInterceptor(app.get(prisma_service_1.PrismaService)));
    app.useGlobalInterceptors(new audit_interceptor_1.AuditInterceptor(app.get(audit_service_1.AuditService)));
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
        const prismaService = app.get(prisma_service_1.PrismaService);
        await prismaService.$connect();
        console.log('✅  Database connected successfully');
    }
    catch (error) {
        console.error('❌  Database connection failed:', error);
        process.exit(1);
    }
    console.log('----------------------------------------------------------');
}
bootstrap();
//# sourceMappingURL=main.js.map