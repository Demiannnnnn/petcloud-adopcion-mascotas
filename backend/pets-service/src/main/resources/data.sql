INSERT INTO mascota (id, propietario_id, nombre, especie, raza, edad, sexo, ubicacion, descripcion, disponible_adopcion, imagen_url, peso, esterilizado) VALUES
(1, 3, 'Luna', 'PERRO', 'Labrador Mix', 3, 'HEMBRA', 'Santiago, RM', 'Perra muy cariñosa y juguetona, ideal para familias', true, 'https://ejemplo.com/luna.jpg', 25.5, true),
(2, 3, 'Simón', 'GATO', 'Siamés', 2, 'MACHO', 'Santiago, RM', 'Gato tranquilo y sociable, se lleva bien con otros gatos', true, 'https://ejemplo.com/simon.jpg', 4.2, true),
(3, 3, 'Max', 'PERRO', 'Pastor Alemán', 5, 'MACHO', 'Valparaíso, V Región', 'Perro entrenado, necesita familia activa', true, 'https://ejemplo.com/max.jpg', 32.0, true),
(4, 1, 'Mila', 'GATO', 'Persa', 4, 'HEMBRA', 'Santiago, RM', 'Gata hogareña, muy mimosa', false, 'https://ejemplo.com/mila.jpg', 3.8, true),
(5, 7, 'Rocky', 'PERRO', 'Pitbull', 2, 'MACHO', 'Santiago, RM', 'Muy juguetón y protector', true, 'https://ejemplo.com/rocky.jpg', 28.0, false),
(6, 7, 'Nala', 'GATO', 'Común europeo', 1, 'HEMBRA', 'Santiago, RM', 'Gatita rescatada, cariñosa', true, 'https://ejemplo.com/nala.jpg', 2.8, false),
(7, 10, 'Toby', 'PERRO', 'Beagle', 4, 'MACHO', 'Valparaíso, V Región', 'Muy amigable, excelente con niños', true, 'https://ejemplo.com/toby.jpg', 10.5, true),
(8, 10, 'Mimi', 'GATO', 'Angora', 3, 'HEMBRA', 'Valparaíso, V Región', 'Tranquila y hogareña', false, 'https://ejemplo.com/mimi.jpg', 3.0, true),
(9, 1, 'Bruno', 'PERRO', 'Golden Retriever', 6, 'MACHO', 'Concepción, Biobío', 'Entrenado y obediente', true, 'https://ejemplo.com/bruno.jpg', 35.0, true),
(10, 2, 'Lola', 'GATO', 'Maine Coon', 2, 'HEMBRA', 'Valparaíso, V Región', 'Grande y cariñosa', true, 'https://ejemplo.com/lola.jpg', 5.0, false);

INSERT INTO historial_clinico (mascota_id, fecha, descripcion, veterinario, tipo_consulta, costo) VALUES
(1, '2024-01-15', 'Revisión general y vacunas al día', 'Dr. Ana Martínez', 'REVISION', 25000),
(1, '2023-12-10', 'Esterilización exitosa', 'Dr. Pedro Sánchez', 'TRATAMIENTO', 80000),
(2, '2024-02-01', 'Control rutinario, excelente estado', 'Dra. Carmen López', 'REVISION', 20000),
(3, '2024-01-20', 'Tratamiento pulgas y desparasitación', 'Dr. Luis Torres', 'TRATAMIENTO', 35000),
(4, '2024-02-15', 'Revisión dental y limpieza', 'Dra. Sofia Morales', 'REVISION', 45000),
(5, '2024-02-10', 'Vacunación inicial', 'Dr. Hugo Castro', 'VACUNA', 30000),
(6, '2024-02-12', 'Desparasitación', 'Dra. Paula Fernández', 'TRATAMIENTO', 15000),
(7, '2024-02-15', 'Revisión general', 'Dr. Manuel Soto', 'REVISION', 20000),
(9, '2024-01-05', 'Control anual', 'Dr. Andrés Paredes', 'REVISION', 25000);

INSERT INTO vacuna (mascota_id, nombre, fecha_aplicacion, proxima_dosis, lote, veterinario) VALUES
(1, 'Séxtuple Canina', '2024-01-15', '2025-01-15', 'LOT123', 'Dr. Ana Martínez'),
(1, 'Antirrábica', '2024-01-15', '2025-01-15', 'LOT124', 'Dr. Ana Martínez'),
(2, 'Triple Felina', '2024-02-01', '2025-02-01', 'LOT125', 'Dra. Carmen López'),
(2, 'Antirrábica Felina', '2024-02-01', '2025-02-01', 'LOT126', 'Dra. Carmen López'),
(3, 'Séxtuple Canina', '2023-12-15', '2024-12-15', 'LOT127', 'Dr. Luis Torres'),
(5, 'Antirrábica', '2024-02-10', '2025-02-10', 'LOT200', 'Dr. Hugo Castro'),
(6, 'Triple Felina', '2024-02-12', '2025-02-12', 'LOT201', 'Dra. Paula Fernández'),
(7, 'Séxtuple Canina', '2024-02-15', '2025-02-15', 'LOT202', 'Dr. Manuel Soto');

-- Insertar seguimiento post adopción (para mascotas ya adoptadas)
INSERT INTO seguimiento_post_adopcion (mascota_id, adoptante_id, fecha_seguimiento, estado_mascota, observaciones, veterinario_encargado) VALUES
(4, 1, '2024-02-20', 'EXCELENTE', 'Mila se ha adaptado perfectamente a su nuevo hogar. Muy activa y cariñosa.', 'Dra. Sofia Morales');
