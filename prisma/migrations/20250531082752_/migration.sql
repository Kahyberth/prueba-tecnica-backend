-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('Administrador', 'Auxiliar_de_Registro');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correoElectronico" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comerciante" (
    "id" SERIAL NOT NULL,
    "nombreRazonSocial" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "telefono" TEXT,
    "correoElectronico" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "Estado" NOT NULL,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "usuarioActualizaId" INTEGER NOT NULL,

    CONSTRAINT "Comerciante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Establecimiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ingresos" DOUBLE PRECISION NOT NULL,
    "numeroEmpleados" INTEGER NOT NULL,
    "comercianteId" INTEGER NOT NULL,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "usuarioActualizaId" INTEGER NOT NULL,

    CONSTRAINT "Establecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correoElectronico_key" ON "Usuario"("correoElectronico");

-- AddForeignKey
ALTER TABLE "Comerciante" ADD CONSTRAINT "Comerciante_usuarioActualizaId_fkey" FOREIGN KEY ("usuarioActualizaId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento" ADD CONSTRAINT "Establecimiento_comercianteId_fkey" FOREIGN KEY ("comercianteId") REFERENCES "Comerciante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento" ADD CONSTRAINT "Establecimiento_usuarioActualizaId_fkey" FOREIGN KEY ("usuarioActualizaId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
