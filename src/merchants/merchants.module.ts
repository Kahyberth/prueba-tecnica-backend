import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
@Module({
  controllers: [MerchantsController],
  providers: [MerchantsService, PrismaService],
  imports: [AuthModule, CacheModule.register()],
})
export class MerchantsModule {}
