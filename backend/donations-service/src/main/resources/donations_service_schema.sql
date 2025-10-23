
CREATE TABLE IF NOT EXISTS donacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donante_id BIGINT NOT NULL,
    receptor_id BIGINT,
    tipo_donacion VARCHAR(20) NOT NULL,
    descripcion TEXT,
    monto DECIMAL(12,2),
    cantidad INT,
    unidad VARCHAR(20),
    fecha_donacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    metodo_pago VARCHAR(50),
    comprobante_url VARCHAR(500),
    direccion_entrega VARCHAR(300),
    fecha_entrega DATE,
    comentarios TEXT
);

CREATE TABLE IF NOT EXISTS campana_donacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organizador_id BIGINT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    meta_monetaria DECIMAL(12,2),
    monto_recaudado DECIMAL(12,2) DEFAULT 0,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    imagen_url VARCHAR(500),
    causa VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS donacion_campana (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donacion_id BIGINT NOT NULL,
    campana_id BIGINT NOT NULL,
    -- Las claves foráneas se pueden definir en H2, pero ON DELETE CASCADE puede requerir ajuste en JPA
    FOREIGN KEY (donacion_id) REFERENCES donacion(id),
    FOREIGN KEY (campana_id) REFERENCES campana_donacion(id)
);

-- Los índices se pueden crear así en H2
CREATE INDEX idx_donante ON donacion(donante_id);
CREATE INDEX idx_tipo_donacion ON donacion(tipo_donacion);
CREATE INDEX idx_fecha_donacion ON donacion(fecha_donacion);
