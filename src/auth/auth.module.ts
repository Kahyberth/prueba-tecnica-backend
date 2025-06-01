import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from 'src/prisma-service/prisma-service.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GetJwtService } from './jwt/get-jwt.service';
import { JwtStrategy } from './jwt/strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, GetJwtService],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [PassportModule, JwtModule, JwtStrategy, GetJwtService],
})
export class AuthModule {}
