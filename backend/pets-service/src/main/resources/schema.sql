-- petsdb
CREATE DATABASE IF NOT EXISTS petsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petsdb;

CREATE TABLE IF NOT EXISTS mascota (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    propietario_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100),
    edad INT,
    sexo ENUM('MACHO', 'HEMBRA') NOT NULL,
    ubicacion VARCHAR(200),
    descripcion TEXT,
    disponible_adopcion BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imagen_url VARCHAR(500),
    peso DECIMAL(5,2),
    esterilizado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS historial_clinico (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mascota_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT NOT NULL,
    veterinario VARCHAR(200),
    tipo_consulta VARCHAR(100),
    costo DECIMAL(10,2),
    FOREIGN KEY (mascota_id) REFERENCES mascota(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vacuna (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mascota_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    proxima_dosis DATE,
    lote VARCHAR(50),
    veterinario VARCHAR(200),
    FOREIGN KEY (mascota_id) REFERENCES mascota(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seguimiento_post_adopcion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mascota_id BIGINT NOT NULL,
    adoptante_id BIGINT NOT NULL,
    fecha_seguimiento DATE NOT NULL,
    estado_mascota VARCHAR(50),
    observaciones TEXT,
    fotos_url TEXT,
    veterinario_encargado VARCHAR(200),
    FOREIGN KEY (mascota_id) REFERENCES mascota(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mascota_propietario ON mascota(propietario_id);
CREATE INDEX IF NOT EXISTS idx_mascota_especie ON mascota(especie);
CREATE INDEX IF NOT EXISTS idx_mascota_disponible ON mascota(disponible_adopcion);
