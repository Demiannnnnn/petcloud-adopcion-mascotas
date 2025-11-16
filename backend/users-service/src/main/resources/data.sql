-- Insertar perfiles de ejemplo (PERSONA y EMPRESA)
INSERT INTO perfil (id, tipo_perfil, rut, correo, contraseña, condiciones_hogar, activo) VALUES
(3, 'EMPRESA', '96123456-7', 'refugio@ejemplo.com', '$2a$10$hash3', 'Refugio de animales registrado', true),
(7, 'EMPRESA', '77445566-3', 'protectoranimal@ong.com', '$2a$10$hash7', 'Organización registrada de rescate animal', true),
(10, 'EMPRESA', '44332211-9', 'hogarfelino@ejemplo.com', '$2a$10$hash10', 'Refugio especializado en gatos', true);

-- Insertar datos en persona usando los IDs generados (asumiendo autoincremento secuencial)
--INSERT INTO persona (id, nombre_completo, ubicacion, numero_whatsapp, fecha_nacimiento) VALUES
--(1, 'Juan Pérez González', 'Santiago, Región Metropolitana', '+56987654321', '1985-03-15'),
--(2, 'María González López', 'Valparaíso, Región de Valparaíso', '+56976543210', '1990-07-22'),
--(4, 'Carlos Rodríguez Silva', 'Concepción, Región del Biobío', '+56965432109', '1982-11-08'),
--(5, 'Sofía Martínez Rojas', 'La Serena, Coquimbo', '+56912349876', '1993-05-10'),
--(6, 'Diego Ramírez Fuentes', 'Viña del Mar, V Región', '+56911223344', '1980-09-02'),
--(8, 'Valentina Torres Díaz', 'Talca, Región del Maule', '+56987651234', '1995-11-25'),
--(9, 'Fernando Muñoz Ortega', 'Puerto Varas, Los Lagos', '+56999887766', '1987-06-14');

-- Insertar datos en empresa usando los IDs generados (asumiendo autoincremento secuencial)
INSERT INTO empresa (id, nombre_empresa, verificado, rut_empresa, direccion, telefono_contacto) VALUES
(3, 'Refugio Esperanza Animal', true, '96123456-7', 'Av. Libertador 1234, Santiago', '+56224567890'),
(7, 'Protector Animal ONG', true, '77445566-3', 'Calle Solidaridad 101, Santiago', '+56226781234'),
(10, 'Hogar Felino', true, '44332211-9', 'Av. Gatos 2020, Valparaíso', '+5632223344');
SELECT 1;
