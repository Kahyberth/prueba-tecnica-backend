import { Estado } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMerchantStatusDto {
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsEnum(Estado, {
    message: 'El estado debe ser ACTIVO o INACTIVO',
  })
  estado: Estado;
}
