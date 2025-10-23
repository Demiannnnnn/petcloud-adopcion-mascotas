
CREATE TABLE IF NOT EXISTS solicitud_adopcion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mascota_id BIGINT NOT NULL,
    adoptante_id BIGINT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    motivo_rechazo TEXT,
    comentarios_adoptante TEXT,
    fecha_respuesta TIMESTAMP NULL,
    evaluador_id BIGINT
);

CREATE TABLE IF NOT EXISTS chat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    solicitud_adopcion_id BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (solicitud_adopcion_id) REFERENCES solicitud_adopcion(id)
);

CREATE TABLE IF NOT EXISTS chat_participante (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    UNIQUE (chat_id, perfil_id)
);

CREATE TABLE IF NOT EXISTS mensaje (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    remitente_id BIGINT NOT NULL,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    tipo_mensaje VARCHAR(20) DEFAULT 'TEXTO',
    archivo_url VARCHAR(500),
    FOREIGN KEY (chat_id) REFERENCES chat(id)
);

CREATE TABLE IF NOT EXISTS notificacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    destinatario_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT FALSE,
    solicitud_adopcion_id BIGINT NULL,
    chat_id BIGINT NULL,
    FOREIGN KEY (solicitud_adopcion_id) REFERENCES solicitud_adopcion(id),
    FOREIGN KEY (chat_id) REFERENCES chat(id)
);

CREATE INDEX idx_solicitud_mascota ON solicitud_adopcion(mascota_id);
CREATE INDEX idx_solicitud_adoptante ON solicitud_adopcion(adoptante_id);
CREATE INDEX idx_solicitud_estado ON solicitud_adopcion(estado);
