import { Estado } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateMerchantDto {
  @IsNotEmpty({ message: 'La razón social es requerida' })
  @IsString({ message: 'La razón social debe ser un texto' })
  @Length(2, 200, {
    message: 'La razón social debe tener entre 2 y 200 caracteres',
  })
  nombreRazonSocial: string;

  @IsNotEmpty({ message: 'El municipio es requerido' })
  @IsString({ message: 'El municipio debe ser un texto' })
  @Length(2, 100, {
    message: 'El municipio debe tener entre 2 y 100 caracteres',
  })
  municipio: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  correoElectronico?: string;

  @IsOptional()
  @IsEnum(Estado, { message: 'El estado debe ser ACTIVO o INACTIVO' })
  estado?: Estado;
}
