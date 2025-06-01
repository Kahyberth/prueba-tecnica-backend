import { BadRequestException } from '@nestjs/common';
import { departmentsAndCities } from '../data/departmentsAndCities';

export const validateMunicipio = (municipio: string): boolean => {
  if (!municipio || typeof municipio !== 'string') {
    return false;
  }

  return departmentsAndCities.some((department) =>
    department.municipios.some(
      (city) => city.toLowerCase() === municipio.toLowerCase(),
    ),
  );
};

export const validateMerchantId = (merchantId: number): void => {
  if (merchantId == null || Number.isNaN(merchantId)) {
    throw new BadRequestException(
      'El ID del comerciante debe ser un número entero positivo',
    );
  }

  if (!Number.isFinite(merchantId)) {
    throw new BadRequestException(
      'El ID del comerciante debe ser un número entero positivo',
    );
  }

  if (merchantId <= 0 || merchantId !== Math.floor(merchantId)) {
    throw new BadRequestException(
      'El ID del comerciante debe ser un número entero positivo',
    );
  }
};
