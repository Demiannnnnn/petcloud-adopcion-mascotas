-- usersdb
CREATE DATABASE IF NOT EXISTS usersdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE usersdb;

CREATE TABLE IF NOT EXISTS perfil (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tipo_perfil VARCHAR(50) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    condiciones_hogar TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS persona (
    id BIGINT PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    ubicacion VARCHAR(200),
    numero_whatsapp VARCHAR(20),
    fecha_nacimiento DATE,
    FOREIGN KEY (id) REFERENCES perfil(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS empresa (
    id BIGINT PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    rut_empresa VARCHAR(20) UNIQUE,
    direccion VARCHAR(300),
    telefono_contacto VARCHAR(20),
    FOREIGN KEY (id) REFERENCES perfil(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documento (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    perfil_id BIGINT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    nombre_archivo VARCHAR(200),
    archivo LONGBLOB,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (perfil_id) REFERENCES perfil(id) ON DELETE CASCADE
);

-- índices recomendados
CREATE INDEX IF NOT EXISTS idx_perfil_correo ON perfil(correo);
CREATE INDEX IF NOT EXISTS idx_perfil_rut ON perfil(rut);
