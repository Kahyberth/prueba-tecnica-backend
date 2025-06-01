INSERT INTO "Usuario" (nombre, "correoElectronico", contraseña, rol) VALUES
('Ana Torres', 'ana.admin@example.com', 'admin123', 'Administrador'),
('Luis Pérez', 'luis.aux@example.com', 'aux123', 'Auxiliar_de_Registro');


INSERT INTO "Comerciante" ("nombreRazonSocial", municipio, telefono, "correoElectronico", estado, "usuarioActualizaId", "fechaActualizacion") VALUES
('Supermercado La Estrella', 'Medellín', '3001234567', 'contacto@laestrella.com', 'ACTIVO', 1, now()),
('Panadería San Juan', 'Bogotá', NULL, NULL, 'ACTIVO', 1, now()),
('Ferretería El Martillo', 'Cali', '3119988776', 'ventas@martillo.com', 'INACTIVO', 2, now()),
('Tienda Naturista Vida', 'Bucaramanga', NULL, 'info@vidanaturista.co', 'ACTIVO', 1, now()),
('Papelería Central', 'Cartagena', '3123344556', NULL, 'ACTIVO', 2, now());


INSERT INTO "Establecimiento" (
  nombre, ingresos, "numeroEmpleados", "comercianteId", "fechaActualizacion", "usuarioActualizaId"
) VALUES
('Sucursal La Estrella Centro', 12000.50, 5, 2, now(), 1),
('Sucursal La Estrella Norte', 18500.75, 7, 2, now(), 1),
('Panadería San Juan Norte', 9000.00, 4, 3, now(), 2),
('Panadería San Juan Sur', 11000.90, 6, 3, now(), 2),
('El Martillo Principal', 20000.00, 10, 4, now(), 1),
('Ferretería Martillo Express', 15000.25, 8, 4, now(), 2),
('Vida Natural Norte', 5000.50, 3, 5, now(), 2),
('Vida Natural Centro', 6200.00, 4, 5, now(), 1),
('Papelería Central Plaza', 8800.00, 5, 6, now(), 2),
('Papelería Central Sur', 9300.75, 6, 6, now(), 1);
