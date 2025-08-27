-- donationsdb
CREATE DATABASE IF NOT EXISTS donationsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE donationsdb;

CREATE TABLE IF NOT EXISTS donacion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    donante_id BIGINT NOT NULL,
    receptor_id BIGINT,
    tipo_donacion ENUM('MONETARIA','ALIMENTO','MEDICINA','JUGUETES','ACCESORIOS','OTRO') NOT NULL,
    descripcion TEXT,
    monto DECIMAL(12,2),
    cantidad INT,
    unidad VARCHAR(20),
    fecha_donacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('PENDIENTE','CONFIRMADA','ENTREGADA','CANCELADA') DEFAULT 'PENDIENTE',
    metodo_pago VARCHAR(50),
    comprobante_url VARCHAR(500),
    direccion_entrega VARCHAR(300),
    fecha_entrega DATE,
    comentarios TEXT
);

CREATE TABLE IF NOT EXISTS campana_donacion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    donacion_id BIGINT NOT NULL,
    campana_id BIGINT NOT NULL,
    FOREIGN KEY (donacion_id) REFERENCES donacion(id) ON DELETE CASCADE,
    FOREIGN KEY (campana_id) REFERENCES campana_donacion(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_donante ON donacion(donante_id);
CREATE INDEX IF NOT EXISTS idx_tipo_donacion ON donacion(tipo_donacion);
CREATE INDEX IF NOT EXISTS idx_fecha_donacion ON donacion(fecha_donacion);
