-- Donaciones de prueba
INSERT INTO donacion (id, donante_id, receptor_id, tipo_donacion, descripcion, monto, cantidad, unidad, fecha_donacion, estado, metodo_pago, comprobante_url, direccion_entrega, fecha_entrega, comentarios) VALUES
(1, 1, 7, 'MONETARIA', 'Donación monetaria para alimentos', 50000, null, null, '2024-02-01 12:00:00', 'CONFIRMADA', 'TRANSFERENCIA', null, null, null, 'Ayuda mensual'),
(2, 2, 10, 'ALIMENTO', '20 kg de alimento para gatos', null, 20, 'KG', '2024-02-05 15:30:00', 'ENTREGADA', null, null, 'Av. Gatos 2020, Valparaíso', '2024-02-06', 'Entrega realizada en refugio'),
(3, 6, 7, 'MONETARIA', 'Aporte en efectivo', 30000, null, null, '2024-02-07 09:00:00', 'CONFIRMADA', 'TARJETA', null, null, null, 'Apoyo general'),
(4, 8, 7, 'JUGUETES', 'Caja con juguetes para perros', null, 10, 'UNIDADES', '2024-02-10 16:00:00', 'ENTREGADA', null, null, 'Calle Solidaridad 101, Santiago', '2024-02-11', 'Muy agradecidos'),
(5, 9, 10, 'ALIMENTO', '10 latas de comida húmeda', null, 10, 'LATAS', '2024-02-15 14:20:00', 'PENDIENTE', null, null, 'Av. Gatos 2020', null, 'Se entregarán el fin de semana');

-- Campañas de donación
INSERT INTO campana_donacion (id, organizador_id, titulo, descripcion, meta_monetaria, monto_recaudado, fecha_inicio, fecha_fin, activa, imagen_url, causa) VALUES
(1, 7, 'Alimento para 50 perros', 'Campaña para recaudar fondos y alimentos para perros rescatados', 500000, 80000, '2024-02-01', '2024-03-01', true, 'https://ejemplo.com/campana1.jpg', 'Alimento'),
(2, 10, 'Medicinas urgentes', 'Recaudar fondos para cubrir tratamientos médicos de gatos', 300000, 50000, '2024-02-10', '2024-03-15', true, 'https://ejemplo.com/campana2.jpg', 'Salud animal');

-- Donaciones vinculadas a campañas
INSERT INTO donacion_campana (donacion_id, campana_id) VALUES
(1, 1),
(3, 1),
(5, 2);

