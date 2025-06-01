import { format } from '@fast-csv/format';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Estado } from '@prisma/client';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { departmentsAndCities } from './data/departmentsAndCities';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { PaginatedResponse, PaginationDto } from './dto/pagination.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { invalidateMerchantsCache } from './utils/merchant.cache';
import { findMerchantWithEstablishments } from './utils/merchant.data';
import {
  MerchantTotals,
  calculateMerchantTotals,
} from './utils/merchant.totals';
import {
  validateMerchantId,
  validateMunicipio,
} from './utils/merchant.validators';

@Injectable()
export class MerchantsService {
  private readonly logger = new Logger(MerchantsService.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getDepartmentsAndCities() {
    return departmentsAndCities;
  }

  async getMerchants(
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 5 } = paginationDto || {};
    const skip = (page - 1) * limit;
    const cacheKey = `merchants:page:${page}:limit:${limit}`;

    try {
      const cachedResult =
        await this.cacheManager.get<PaginatedResponse<any>>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const [merchants, total] = await Promise.all([
        this.prisma.comerciante.findMany({
          skip,
          take: limit,
          orderBy: { fechaRegistro: 'desc' },
          include: {
            usuarioActualiza: {
              select: {
                nombre: true,
                correoElectronico: true,
              },
            },
            establecimientos: {
              select: {
                id: true,
                nombre: true,
                ingresos: true,
                numeroEmpleados: true,
              },
            },
          },
        }),
        this.prisma.comerciante.count(),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const result: PaginatedResponse<any> = {
        data: merchants,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      };

      await this.cacheManager.set(cacheKey, result, 300);

      return result;
    } catch (error) {
      await this.cacheManager.del(cacheKey);
      throw new NotFoundException('Comerciante no encontrado');
    }
  }

  async getMerchantById(id: number) {
    const cacheKey = `merchant:${id}`;

    const cachedResult = await this.cacheManager.get<any>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const merchant = await this.prisma.comerciante.findUnique({
        where: { id },
        include: {
          usuarioActualiza: {
            select: {
              nombre: true,
              correoElectronico: true,
            },
          },
          establecimientos: true,
        },
      });

      if (!merchant) {
        throw new NotFoundException('Comerciante no encontrado');
      }

      return merchant;
    } catch (error) {
      await this.cacheManager.del(cacheKey);
      throw new NotFoundException('Comerciante no encontrado');
    }
  }

  async createMerchant(createMerchantDto: CreateMerchantDto, userId: number) {
    const {
      nombreRazonSocial,
      municipio,
      telefono,
      correoElectronico,
      estado = Estado.ACTIVO,
    } = createMerchantDto;

    try {
      const municipioExists = validateMunicipio(municipio);
      if (!municipioExists) {
        throw new BadRequestException(
          'El municipio proporcionado no es válido. Consulte la lista de municipios disponibles.',
        );
      }

      if (correoElectronico) {
        const existingMerchant = await this.prisma.comerciante.findFirst({
          where: { correoElectronico },
        });

        if (existingMerchant) {
          throw new ConflictException(
            'Ya existe un comerciante registrado con este correo electrónico',
          );
        }
      }

      const newMerchant = await this.prisma.comerciante.create({
        data: {
          nombreRazonSocial: nombreRazonSocial.trim(),
          municipio: municipio.trim(),
          telefono: telefono?.trim(),
          correoElectronico: correoElectronico?.toLowerCase().trim(),
          estado,
          usuarioActualizaId: userId,
        },
        include: {
          usuarioActualiza: {
            select: {
              nombre: true,
              correoElectronico: true,
            },
          },
          establecimientos: true,
        },
      });

      await invalidateMerchantsCache(this.cacheManager);

      return {
        message: 'Comerciante creado exitosamente',
        data: newMerchant,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Error al crear el comerciante. Verifique los datos proporcionados.',
      );
    }
  }

  async getTotalsByMerchant(merchantId: number): Promise<MerchantTotals> {
    validateMerchantId(merchantId);

    const cacheKey = `merchant-totals:${merchantId}`;

    try {
      const cachedTotals =
        await this.cacheManager.get<MerchantTotals>(cacheKey);
      if (cachedTotals) {
        return cachedTotals;
      }

      const merchant = await findMerchantWithEstablishments(
        this.prisma,
        merchantId,
      );
      const totals = calculateMerchantTotals(merchant.establecimientos);

      await this.cacheManager.set(cacheKey, totals, 300);

      return totals;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      await this.cacheManager.del(cacheKey);
      this.logger.error(
        `Error calculating totals for merchant ${merchantId}:`,
        error,
      );
      throw new BadRequestException(
        'Error al calcular los totales del comerciante',
      );
    }
  }

  async updateMerchant(
    id: number,
    updateMerchantDto: UpdateMerchantDto,
    userId: number,
  ) {
    if (!updateMerchantDto || Object.keys(updateMerchantDto).length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos un campo para actualizar',
      );
    }

    const {
      nombreRazonSocial,
      municipio,
      telefono,
      correoElectronico,
      estado,
    } = updateMerchantDto;

    try {
      const existingMerchant = await this.prisma.comerciante.findUnique({
        where: { id },
      });

      if (!existingMerchant) {
        throw new NotFoundException('Comerciante no encontrado');
      }

      if (municipio) {
        const municipioExists = validateMunicipio(municipio);
        if (!municipioExists) {
          throw new BadRequestException(
            'El municipio proporcionado no es válido. Consulte la lista de municipios disponibles.',
          );
        }
      }

      if (
        correoElectronico &&
        correoElectronico !== existingMerchant.correoElectronico
      ) {
        const merchantWithEmail = await this.prisma.comerciante.findFirst({
          where: {
            correoElectronico: correoElectronico.toLowerCase().trim(),
            id: { not: id },
          },
        });

        if (merchantWithEmail) {
          throw new ConflictException(
            'Ya existe un comerciante registrado con este correo electrónico',
          );
        }
      }

      const updateData: any = {
        usuarioActualizaId: userId,
        fechaActualizacion: new Date(),
      };

      if (nombreRazonSocial !== undefined) {
        updateData.nombreRazonSocial = nombreRazonSocial.trim();
      }
      if (municipio !== undefined) {
        updateData.municipio = municipio.trim();
      }
      if (telefono !== undefined) {
        updateData.telefono = telefono?.trim() || null;
      }
      if (correoElectronico !== undefined) {
        updateData.correoElectronico =
          correoElectronico?.toLowerCase().trim() || null;
      }
      if (estado !== undefined) {
        updateData.estado = estado;
      }

      const updatedMerchant = await this.prisma.comerciante.update({
        where: { id },
        data: updateData,
        include: {
          usuarioActualiza: {
            select: {
              nombre: true,
              correoElectronico: true,
            },
          },
          establecimientos: true,
        },
      });

      await invalidateMerchantsCache(this.cacheManager);
      await this.cacheManager.del(`merchant:${id}`);

      return {
        message: 'Comerciante actualizado exitosamente',
        data: updatedMerchant,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Error al actualizar el comerciante. Verifique los datos proporcionados.',
      );
    }
  }

  async updateMerchantStatus(id: number, estado: Estado, userId: number) {
    if (!Object.values(Estado).includes(estado)) {
      throw new BadRequestException(
        `Estado inválido. Los valores permitidos son: ${Object.values(Estado).join(', ')}`,
      );
    }

    try {
      const existingMerchant = await this.prisma.comerciante.findUnique({
        where: { id },
      });

      if (!existingMerchant) {
        throw new NotFoundException('Comerciante no encontrado');
      }

      if (existingMerchant.estado === estado) {
        return {
          message: 'El comerciante ya tiene el estado solicitado',
          data: existingMerchant,
        };
      }

      const updatedMerchant = await this.prisma.comerciante.update({
        where: { id },
        data: {
          estado,
          usuarioActualizaId: userId,
          fechaActualizacion: new Date(),
        },
        include: {
          usuarioActualiza: {
            select: {
              nombre: true,
              correoElectronico: true,
            },
          },
          establecimientos: true,
        },
      });

      await invalidateMerchantsCache(this.cacheManager);
      await this.cacheManager.del(`merchant:${id}`);

      return {
        message: 'Estado del comerciante actualizado exitosamente',
        data: updatedMerchant,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Error al actualizar el estado del comerciante. Verifique los datos proporcionados.',
      );
    }
  }

  async deleteMerchant(id: number) {
    try {
      const existingMerchant = await this.prisma.comerciante.findUnique({
        where: { id },
        include: {
          establecimientos: true,
        },
      });

      if (!existingMerchant) {
        throw new NotFoundException('Comerciante no encontrado');
      }

      if (
        existingMerchant.establecimientos &&
        existingMerchant.establecimientos.length > 0
      ) {
        throw new ConflictException(
          'No se puede eliminar el comerciante porque tiene establecimientos asociados. Elimine primero los establecimientos.',
        );
      }

      const deletedMerchant = await this.prisma.comerciante.delete({
        where: { id },
        include: {
          usuarioActualiza: {
            select: {
              nombre: true,
              correoElectronico: true,
            },
          },
        },
      });

      await invalidateMerchantsCache(this.cacheManager);
      await this.cacheManager.del(`merchant:${id}`);

      return {
        message: 'Comerciante eliminado exitosamente',
        data: deletedMerchant,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new BadRequestException('Error al eliminar el comerciante.');
    }
  }

  async generarCSV(res: Response) {
    const merchants = await this.prisma.comerciante.findMany({
      where: {
        estado: Estado.ACTIVO,
      },
      include: {
        establecimientos: true,
      },
    });

    const reportsDir = path.resolve(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      this.logger.log(`Carpeta creada en: ${reportsDir}`);
    }

    const fileName = `reporte_comerciantes_${Date.now()}.csv`;
    const filePath = path.join(reportsDir, fileName);

    const writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const sepLine = 'sep=|\n';
    writeStream.write(sepLine);
    res.write(sepLine);

    const csvStream = format({ headers: false, delimiter: '|' });

    csvStream.pipe(writeStream);
    csvStream.pipe(res);

    csvStream.write([
      'Nombre o Razón Social',
      'Municipio',
      'Teléfono',
      'Correo Electrónico',
      'Fecha de Registro',
      'Estado',
      'Cantidad de Establecimientos',
      'Total Ingresos',
      'Cantidad de Empleados',
    ]);

    for (const fila of merchants) {
      csvStream.write([
        fila.nombreRazonSocial,
        fila.municipio,
        fila.telefono,
        fila.correoElectronico,
        fila.fechaRegistro,
        fila.estado,
        fila.establecimientos.length.toString(),
        fila.establecimientos
          .reduce((acc, e) => acc + e.ingresos, 0)
          .toString(),
        fila.establecimientos
          .reduce((acc, e) => acc + e.numeroEmpleados, 0)
          .toString(),
      ]);
    }
    csvStream.end();
    csvStream.on('end', () => {
      writeStream.end();
      this.logger.log(`CSV guardado en disco en: ${filePath}`);
    });
  }
}
