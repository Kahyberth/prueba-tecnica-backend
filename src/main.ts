import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app
    .listen(process.env.PORT ?? 3000)
    .then(() => {
      logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
    })
    .catch((error) => {
      logger.error(error);
    });
}

bootstrap();
