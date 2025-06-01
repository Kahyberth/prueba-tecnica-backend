import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { LoginDto } from './dto/login.dto';
import { GetJwtService } from './jwt/get-jwt.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private getJwtService: GetJwtService,
  ) {}
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { correoElectronico: email },
      });

      if (!usuario) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const contraseñaValida = password === usuario.contraseña;

      if (!contraseñaValida) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const payload = {
        id: usuario.id,
        nombre: usuario.nombre,
        correoElectronico: usuario.correoElectronico,
        rol: usuario.rol,
      };

      const token = await this.getJwtService.generateToken(payload);

      this.logger.log('Autenticación exitosa');

      return { user: payload, token };
    } catch (error) {
      this.logger.error('Error al autenticar al usuario', error);
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
}
