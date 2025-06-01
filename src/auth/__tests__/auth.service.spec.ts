import { Logger, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma-service/prisma-service.service';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { GetJwtService } from '../jwt/get-jwt.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let getJwtService: GetJwtService;
  let logger: jest.Mocked<Logger>;

  const mockUser = {
    id: 1,
    nombre: 'Juan Pérez',
    correoElectronico: 'juan@example.com',
    contraseña: 'password123',
    rol: 'Administrador',
    fechaRegistro: new Date(),
    fechaActualizacion: new Date(),
  };

  const mockPayload = {
    id: mockUser.id,
    nombre: mockUser.nombre,
    correoElectronico: mockUser.correoElectronico,
    rol: mockUser.rol,
  };

  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            usuario: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: GetJwtService,
          useValue: {
            generateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    getJwtService = module.get<GetJwtService>(GetJwtService);

    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    (service as any).logger = logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    describe('Successful authentication', () => {
      it('should authenticate user with valid credentials', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          mockUser,
        );
        (getJwtService.generateToken as jest.Mock).mockResolvedValue(mockToken);

        const result = await service.login(loginDto);

        expect(result).toEqual({
          user: mockPayload,
          token: mockToken,
        });

        expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
          where: { correoElectronico: loginDto.email },
        });
        expect(getJwtService.generateToken).toHaveBeenCalledWith(mockPayload);
        expect(logger.log).toHaveBeenCalledWith('Autenticación exitosa');
      });

      it('should handle user with different role', async () => {
        const userWithDifferentRole = {
          ...mockUser,
          rol: 'Usuario',
        };

        const expectedPayload = {
          ...mockPayload,
          rol: 'Usuario',
        };

        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          userWithDifferentRole,
        );
        (getJwtService.generateToken as jest.Mock).mockResolvedValue(mockToken);

        const result = await service.login(loginDto);

        expect(result).toEqual({
          user: expectedPayload,
          token: mockToken,
        });
        expect(getJwtService.generateToken).toHaveBeenCalledWith(
          expectedPayload,
        );
      });

      it('should handle user with special characters in name', async () => {
        const userWithSpecialName = {
          ...mockUser,
          nombre: 'José María Ñoño',
        };

        const expectedPayload = {
          ...mockPayload,
          nombre: 'José María Ñoño',
        };

        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          userWithSpecialName,
        );
        (getJwtService.generateToken as jest.Mock).mockResolvedValue(mockToken);

        const result = await service.login(loginDto);

        expect(result.user.nombre).toBe('José María Ñoño');
        expect(getJwtService.generateToken).toHaveBeenCalledWith(
          expectedPayload,
        );
      });
    });

    describe('Failed authentication - User not found', () => {
      it('should throw UnauthorizedException when user does not exist', async () => {
        const loginDto: LoginDto = {
          email: 'nonexistent@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'Credenciales inválidas',
        );

        expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
          where: { correoElectronico: loginDto.email },
        });
        expect(getJwtService.generateToken).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
          'Error al autenticar al usuario',
          expect.any(UnauthorizedException),
        );
      });

      it('should handle email case sensitivity', async () => {
        const loginDto: LoginDto = {
          email: 'JUAN@EXAMPLE.COM',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );

        expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
          where: { correoElectronico: 'JUAN@EXAMPLE.COM' },
        });
      });
    });

    describe('Failed authentication - Invalid password', () => {
      it('should throw UnauthorizedException when password is incorrect', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'wrongpassword',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          mockUser,
        );

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'Credenciales inválidas',
        );

        expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
          where: { correoElectronico: loginDto.email },
        });
        expect(getJwtService.generateToken).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
          'Error al autenticar al usuario',
          expect.any(UnauthorizedException),
        );
      });

      it('should be case sensitive for passwords', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'PASSWORD123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          mockUser,
        );

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should handle empty password', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: '',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          mockUser,
        );

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should handle null password in database', async () => {
        const userWithNullPassword = {
          ...mockUser,
          contraseña: null,
        };

        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          userWithNullPassword,
        );

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });

    describe('Database errors', () => {
      it('should handle database connection errors', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        const dbError = new Error('Database connection failed');
        (prismaService.usuario.findUnique as jest.Mock).mockRejectedValue(
          dbError,
        );

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'Credenciales inválidas',
        );

        expect(logger.error).toHaveBeenCalledWith(
          'Error al autenticar al usuario',
          dbError,
        );
        expect(getJwtService.generateToken).not.toHaveBeenCalled();
      });

      it('should handle database timeout errors', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        const timeoutError = new Error('Query timeout');
        (prismaService.usuario.findUnique as jest.Mock).mockRejectedValue(
          timeoutError,
        );

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );

        expect(logger.error).toHaveBeenCalledWith(
          'Error al autenticar al usuario',
          timeoutError,
        );
      });
    });

    describe('JWT Service errors', () => {
      it('should handle JWT generation errors', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          mockUser,
        );
        const jwtError = new Error('JWT secret not configured');
        (getJwtService.generateToken as jest.Mock).mockRejectedValue(jwtError);

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'Credenciales inválidas',
        );

        expect(getJwtService.generateToken).toHaveBeenCalledWith(mockPayload);
        expect(logger.error).toHaveBeenCalledWith(
          'Error al autenticar al usuario',
          jwtError,
        );
      });

      it('should handle JWT service returning null/undefined', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          mockUser,
        );
        (getJwtService.generateToken as jest.Mock).mockResolvedValue(
          null as any,
        );

        const result = await service.login(loginDto);

        expect(result).toEqual({
          user: mockPayload,
          token: null,
        });
      });
    });

    describe('Edge cases and input validation', () => {
      it('should handle empty email', async () => {
        const loginDto: LoginDto = {
          email: '',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );

        expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
          where: { correoElectronico: '' },
        });
      });

      it('should handle whitespace in email', async () => {
        const loginDto: LoginDto = {
          email: '  juan@example.com  ',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );

        expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
          where: { correoElectronico: '  juan@example.com  ' },
        });
      });

      it('should handle user with missing properties', async () => {
        const incompleteUser = {
          id: 1,
          correoElectronico: 'juan@example.com',
          contraseña: 'password123',
        };

        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          incompleteUser as any,
        );
        (getJwtService.generateToken as jest.Mock).mockResolvedValue(mockToken);

        const result = await service.login(loginDto);

        expect(result.user).toEqual({
          id: 1,
          nombre: undefined,
          correoElectronico: 'juan@example.com',
          rol: undefined,
        });
      });

      it('should handle special characters in password', async () => {
        const userWithSpecialPassword = {
          ...mockUser,
          contraseña: 'pássw@rd123!ñ€',
        };

        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'pássw@rd123!ñ€',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          userWithSpecialPassword,
        );
        (getJwtService.generateToken as jest.Mock).mockResolvedValue(mockToken);

        const result = await service.login(loginDto);

        expect(result).toEqual({
          user: mockPayload,
          token: mockToken,
        });
      });
    });

    describe('Logging behavior', () => {
      it('should log successful authentication', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'password123',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          mockUser,
        );
        (getJwtService.generateToken as jest.Mock).mockResolvedValue(mockToken);

        await service.login(loginDto);

        expect(logger.log).toHaveBeenCalledWith('Autenticación exitosa');
        expect(logger.log).toHaveBeenCalledTimes(1);
      });

      it('should log errors without exposing sensitive information', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'wrongpassword',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(
          mockUser,
        );

        await expect(service.login(loginDto)).rejects.toThrow();

        expect(logger.error).toHaveBeenCalledWith(
          'Error al autenticar al usuario',
          expect.any(UnauthorizedException),
        );
        expect(logger.log).not.toHaveBeenCalled();
      });

      it('should not log sensitive data like passwords', async () => {
        const loginDto: LoginDto = {
          email: 'juan@example.com',
          password: 'secretpassword',
        };

        (prismaService.usuario.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow();

        expect(logger.error).toHaveBeenCalled();
        const loggedMessage = logger.error.mock.calls[0][0];
        expect(loggedMessage).not.toContain('secretpassword');
      });
    });
  });
});
