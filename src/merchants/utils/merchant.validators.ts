import { departmentsAndCities } from '../data/departmentsAndCities';

export const validateMunicipio = (municipio: string): boolean => {
  return departmentsAndCities.some((department) =>
    department.municipios.some(
      (city) => city.toLowerCase() === municipio.toLowerCase(),
    ),
  );
};
