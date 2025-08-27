-- adoptionsdb
CREATE DATABASE IF NOT EXISTS adoptionsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE adoptionsdb;

CREATE TABLE IF NOT EXISTS solicitud_adopcion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mascota_id BIGINT NOT NULL,
    adoptante_id BIGINT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('PENDIENTE','APROBADA','RECHAZADA') DEFAULT 'PENDIENTE',
    motivo_rechazo TEXT,
    comentarios_adoptante TEXT,
    fecha_respuesta TIMESTAMP NULL,
    evaluador_id BIGINT
);

CREATE TABLE IF NOT EXISTS chat (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    solicitud_adopcion_id BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (solicitud_adopcion_id) REFERENCES solicitud_adopcion(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_participante (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chat_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chat(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chat_perfil (chat_id, perfil_id)
);

CREATE TABLE IF NOT EXISTS mensaje (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chat_id BIGINT NOT NULL,
    remitente_id BIGINT NOT NULL,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    tipo_mensaje ENUM('TEXTO','IMAGEN','DOCUMENTO') DEFAULT 'TEXTO',
    archivo_url VARCHAR(500),
    FOREIGN KEY (chat_id) REFERENCES chat(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notificacion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    destinatario_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT FALSE,
    solicitud_adopcion_id BIGINT NULL,
    chat_id BIGINT NULL,
    FOREIGN KEY (solicitud_adopcion_id) REFERENCES solicitud_adopcion(id) ON DELETE CASCADE,
    FOREIGN KEY (chat_id) REFERENCES chat(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_solicitud_mascota ON solicitud_adopcion(mascota_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_adoptante ON solicitud_adopcion(adoptante_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_estado ON solicitud_adopcion(estado);
