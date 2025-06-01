import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma-service/prisma-service.service';

export const findMerchantWithEstablishments = async (
  prisma: PrismaService,
  merchantId: number,
) => {
  const merchant = await prisma.comerciante.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      establecimientos: {
        select: {
          ingresos: true,
          numeroEmpleados: true,
        },
      },
    },
  });

  if (!merchant) {
    throw new NotFoundException(
      `Comerciante con ID ${merchantId} no encontrado`,
    );
  }

  return merchant;
};
