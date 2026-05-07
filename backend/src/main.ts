import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  // bodyParser: false — configuramos los parsers manualmente para poder
  // guardar el rawBody en req para el webhook de Stripe
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));
  const config = app.get(ConfigService);

  // ── Body parsers ──────────────────────────────────────────────────────────
  // express.json() con verify: guarda el raw buffer en req.rawBody
  // para que el webhook de Stripe pueda verificar la firma
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bodyParser = require('body-parser');

  app.use(
    bodyParser.json({
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(bodyParser.urlencoded({ extended: true }));

  // Seguridad: headers HTTP (X-Content-Type-Options, Strict-Transport-Security, etc.)
  // CSP configurada para permitir los assets inline que usa Swagger UI
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          scriptSrc: [`'self'`, `'unsafe-inline'`],
          scriptSrcElem: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          upgradeInsecureRequests: null,
        },
      },
    }),
  );
  app.use(cookieParser());

  // Prefijo global de la API
  const apiPrefix = config.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  const allowedOrigins = [
    config.get<string>('FRONTEND_URL'),
    config.get<string>('CORS_EXTRA_ORIGIN'),
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true, // necesario para que el navegador envíe las cookies HTTP-only
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('VeriTix API')
    .setDescription(
      'Documentación de la API REST de VeriTix — plataforma de venta y validación de boletos para conciertos y eventos en vivo.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Access token JWT obtenido en /auth/login o /auth/register. Expira en 15 min.',
      },
      'access-token',
    )
    .addCookieAuth(
      'refresh_token',
      {
        type: 'apiKey',
        in: 'cookie',
        description:
          'Refresh token HTTP-only enviado automáticamente por el navegador. Expira en 7 días.',
      },
      'refresh_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Servidor iniciado en http://localhost:${port}`);
  logger.log(`Documentación Swagger en http://localhost:${port}/docs`);
}
bootstrap();
