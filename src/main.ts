import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { AppValidationPipe } from './common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // Prefix semua route dengan /api
  app.setGlobalPrefix('api');

  // CORS (web / mobile)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validasi global
  app.useGlobalPipes(new AppValidationPipe());

  // Global error handler
  app.useGlobalFilters(new AllExceptionsFilter());

  // Logging setiap request
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );

  // Config Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dataset API')
    .setDescription('List API documentation for Dataset Backend')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', // nama scheme, bebas
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true }, // biar token nggak ke-reset tiap refresh
  });

  // Ambil port dari config
  const port =
    config.get<number>('app.app.port' as any) ||
    config.get<number>('app.port') ||
    3000;

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(
    `📚 Documentation is running on: http://localhost:${port}/api/docs`,
  );
  // console.log('DATABASE_URL =', process.env.DATABASE_URL);
}
bootstrap();
