import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @author Kahyberth Gonzalez
   * @description Inicia sesión de un usuario y genera un token de autenticación
   * @param {LoginDto} loginDto - DTO de inicio de sesión
   * @returns {Promise<{ message: string; user: any }>}
   */
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.login(loginDto);

    console.log(token);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return { message: 'Login exitoso', user };
  }

  /**
   * @author Kahyberth Gonzalez
   * @description Cierra sesión de un usuario eliminando el token de autenticación
   * @returns {Promise<{ message: string }>}
   */
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logout exitoso' };
  }

  /**
   * @author Kahyberth Gonzalez
   * @description Verifica si la sesión del usuario está activa
   * @returns {Promise<{ message: string }>}
   */
  @Get('verify-session')
  @Auth()
  async verifySession() {
    return { message: 'Session verificada' };
  }
}
