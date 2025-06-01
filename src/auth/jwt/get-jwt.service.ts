import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt.payload.interface';

@Injectable()
export class GetJwtService {
  constructor(private readonly jwtService: JwtService) {}
  async generateToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
