import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { appConfigSchema } from './config/app.config';
import { MerchantsModule } from './merchants/merchants.module';
import { PrismaService } from './prisma-service/prisma-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: appConfigSchema,
    }),
    AuthModule,
    MerchantsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
