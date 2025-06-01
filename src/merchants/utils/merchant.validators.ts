import { BadRequestException } from '@nestjs/common';
import { departmentsAndCities } from '../data/departmentsAndCities';

export const validateMunicipio = (municipio: string): boolean => {
  return departmentsAndCities.some((department) =>
    department.municipios.some(
      (city) => city.toLowerCase() === municipio.toLowerCase(),
    ),
  );
};

export const validateMerchantId = (merchantId: number): void => {
  if (!merchantId || merchantId <= 0 || !Number.isInteger(merchantId)) {
    throw new BadRequestException(
      'El ID del comerciante debe ser un número entero positivo',
    );
  }
};
