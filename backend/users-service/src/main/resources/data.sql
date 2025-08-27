-- Insertar perfiles de prueba
INSERT INTO perfil (id, tipo_perfil, rut, correo, contraseña, condiciones_hogar, activo) VALUES
(1, 'PERSONA', '12345678-9', 'juan.perez@email.com', '$2a$10$hash1', 'Casa con patio grande, sin otros animales', true),
(2, 'PERSONA', '87654321-0', 'maria.gonzalez@email.com', '$2a$10$hash2', 'Departamento, experiencia con gatos', true),
(3, 'EMPRESA', '96123456-7', 'refugio@ejemplo.com', '$2a$10$hash3', 'Refugio de animales registrado', true),
(4, 'PERSONA', '11223344-5', 'carlos.rodriguez@email.com', '$2a$10$hash4', 'Casa familiar, niños pequeños', true),
(5, 'PERSONA', '99887766-5', 'sofia.martinez@email.com', '$2a$10$hash5', 'Departamento con terraza, sin niños', true),
(6, 'PERSONA', '88776655-4', 'diego.ramirez@email.com', '$2a$10$hash6', 'Casa grande en la playa, experiencia con perros', true),
(7, 'EMPRESA', '77445566-3', 'protectoranimal@ong.com', '$2a$10$hash7', 'Organización registrada de rescate animal', true),
(8, 'PERSONA', '66554433-2', 'valentina.torres@email.com', '$2a$10$hash8', 'Departamento mediano, ama los gatos', true),
(9, 'PERSONA', '55443322-1', 'fernando.munoz@email.com', '$2a$10$hash9', 'Casa con jardín, experiencia con gatos y perros', true),
(10, 'EMPRESA', '44332211-9', 'hogarfelino@ejemplo.com', '$2a$10$hash10', 'Refugio especializado en gatos', true);

-- Insertar personas
INSERT INTO persona (id, nombre_completo, ubicacion, numero_whatsapp, fecha_nacimiento) VALUES
(1, 'Juan Pérez González', 'Santiago, Región Metropolitana', '+56987654321', '1985-03-15'),
(2, 'María González López', 'Valparaíso, Región de Valparaíso', '+56976543210', '1990-07-22'),
(4, 'Carlos Rodríguez Silva', 'Concepción, Región del Biobío', '+56965432109', '1982-11-08'),
(5, 'Sofía Martínez Rojas', 'La Serena, Coquimbo', '+56912349876', '1993-05-10'),
(6, 'Diego Ramírez Fuentes', 'Viña del Mar, V Región', '+56911223344', '1980-09-02'),
(8, 'Valentina Torres Díaz', 'Talca, Región del Maule', '+56987651234', '1995-11-25'),
(9, 'Fernando Muñoz Ortega', 'Puerto Varas, Los Lagos', '+56999887766', '1987-06-14');

-- Insertar empresas
INSERT INTO empresa (id, nombre_empresa, verificado, rut_empresa, direccion, telefono_contacto) VALUES
(3, 'Refugio Esperanza Animal', true, '96123456-7', 'Av. Libertador 1234, Santiago', '+56224567890'),
(7, 'Protector Animal ONG', true, '77445566-3', 'Calle Solidaridad 101, Santiago', '+56226781234'),
(10, 'Hogar Felino', true, '44332211-9', 'Av. Gatos 2020, Valparaíso', '+5632223344');

-- Insertar documentos de prueba
INSERT INTO documento (perfil_id, tipo, nombre_archivo, validado, fecha_subida) VALUES
(1, 'CEDULA', 'cedula_juan.pdf', true, '2024-01-15 10:30:00'),
(1, 'CERTIFICADO_ANTECEDENTES', 'antecedentes_juan.pdf', true, '2024-01-15 10:35:00'),
(2, 'CEDULA', 'cedula_maria.pdf', true, '2024-01-20 14:20:00'),
(3, 'CERTIFICADO_LEGAL', 'certificado_refugio.pdf', true, '2024-01-10 09:15:00'),
(4, 'CEDULA', 'cedula_carlos.pdf', false, '2024-02-01 16:45:00'),
(5, 'CEDULA', 'cedula_sofia.pdf', true, '2024-02-01 11:20:00'),
(6, 'CEDULA', 'cedula_diego.pdf', true, '2024-02-02 15:40:00'),
(7, 'CERTIFICADO_LEGAL', 'certificado_protector.pdf', true, '2024-01-25 09:00:00'),
(8, 'CEDULA', 'cedula_valentina.pdf', false, '2024-02-10 18:00:00'),
(9, 'CEDULA', 'cedula_fernando.pdf', true, '2024-02-12 12:15:00'),
(10, 'CERTIFICADO_LEGAL', 'hogarfelino_doc.pdf', true, '2024-01-30 10:00:00');
