-- Insertar solicitudes de adopción
INSERT INTO solicitud_adopcion (id, mascota_id, adoptante_id, fecha_solicitud, estado, comentarios_adoptante, fecha_respuesta, evaluador_id) VALUES
(1, 1, 1, '2024-02-10 14:30:00', 'PENDIENTE', 'Tengo experiencia con perros grandes y casa con patio', null, null),
(2, 2, 2, '2024-02-12 10:15:00', 'APROBADA', 'Busco un gato tranquilo para mi departamento', '2024-02-13 16:20:00', 3),
(3, 3, 4, '2024-02-14 09:45:00', 'PENDIENTE', 'Familia con experiencia en Pastor Alemán', null, null),
(4, 1, 2, '2024-02-15 11:30:00', 'RECHAZADA', 'También me interesa Luna', '2024-02-16 14:10:00', 3),
(5, 5, 5, '2024-02-18 09:10:00', 'PENDIENTE', 'Estoy buscando un perro guardián y compañero', null, null),
(6, 6, 8, '2024-02-19 13:00:00', 'PENDIENTE', 'Quiero darle un hogar a Nala, soy amante de los gatos', null, null),
(7, 7, 9, '2024-02-20 08:40:00', 'APROBADA', 'Perfecto para mis hijos pequeños', '2024-02-21 10:00:00', 7);

-- Insertar chats
INSERT INTO chat (id, solicitud_adopcion_id, fecha_creacion, activo) VALUES
(1, 1, '2024-02-10 14:35:00', true),
(2, 2, '2024-02-12 10:20:00', false),
(3, 3, '2024-02-14 09:50:00', true),
(4, 4, '2024-02-15 11:35:00', false),
(5, 5, '2024-02-18 09:15:00', true),
(6, 6, '2024-02-19 13:05:00', true),
(7, 7, '2024-02-20 08:45:00', false);

-- Insertar participantes de chat
INSERT INTO chat_participante (chat_id, perfil_id, fecha_union) VALUES
(1, 1, '2024-02-10 14:35:00'), -- Adoptante Juan
(1, 3, '2024-02-10 14:36:00'), -- Refugio
(2, 2, '2024-02-12 10:20:00'), -- Adoptante María
(2, 3, '2024-02-12 10:21:00'), -- Refugio
(3, 4, '2024-02-14 09:50:00'), -- Adoptante Carlos
(3, 3, '2024-02-14 09:51:00'), -- Refugio
(4, 2, '2024-02-15 11:35:00'), -- Adoptante María
(4, 3, '2024-02-15 11:36:00'), -- Refugio
(5, 5, '2024-02-18 09:15:00'),
(5, 7, '2024-02-18 09:16:00'),
(6, 8, '2024-02-19 13:05:00'),
(6, 7, '2024-02-19 13:06:00'),
(7, 9, '2024-02-20 08:45:00'),
(7, 10, '2024-02-20 08:46:00');

-- Insertar mensajes
INSERT INTO mensaje (chat_id, remitente_id, contenido, fecha, leido, tipo_mensaje) VALUES
(1, 1, 'Hola, estoy muy interesado en adoptar a Luna. ¿Podrían darme más información?', '2024-02-10 14:40:00', true, 'TEXTO'),
(1, 3, 'Hola Juan, gracias por tu interés. Luna es una perra muy especial. ¿Podrías contarnos sobre tu experiencia con perros?', '2024-02-10 15:20:00', true, 'TEXTO'),
(1, 1, 'He tenido perros toda mi vida, especialmente razas grandes. Tengo un patio amplio y tiempo para dedicarle.', '2024-02-10 16:10:00', false, 'TEXTO'),

(2, 2, 'Buenos días, me gustaría conocer más sobre Simón', '2024-02-12 10:25:00', true, 'TEXTO'),
(2, 3, 'Hola María, Simón es perfecto para departamentos. Es muy tranquilo y cariñoso.', '2024-02-12 11:30:00', true, 'TEXTO'),
(2, 2, '¡Perfecto! ¿Cuándo podríamos coordinar una visita?', '2024-02-12 14:15:00', true, 'TEXTO'),

(3, 4, 'Buenas tardes, nuestra familia está interesada en Max', '2024-02-14 10:00:00', true, 'TEXTO'),
(3, 3, 'Hola Carlos, Max necesita una familia muy activa. ¿Tienen experiencia con Pastor Alemán?', '2024-02-14 11:45:00', false, 'TEXTO'),
(5, 5, 'Hola, me interesa mucho Rocky como perro de compañía', '2024-02-18 09:20:00', false, 'TEXTO'),
(6, 8, 'Buenos días, me gustaría adoptar a Nala', '2024-02-19 13:10:00', true, 'TEXTO'),
(7, 9, 'Estamos felices de poder adoptar a Toby', '2024-02-20 09:00:00', true, 'TEXTO');


-- Insertar notificaciones
INSERT INTO notificacion (destinatario_id, tipo, titulo, mensaje, fecha, leida, solicitud_adopcion_id, chat_id) VALUES
(3, 'NUEVA_SOLICITUD', 'Nueva solicitud de adopción', 'Juan Pérez ha enviado una solicitud para adoptar a Luna', '2024-02-10 14:30:00', true, 1, null),
(1, 'NUEVO_MENSAJE', 'Nuevo mensaje en chat', 'El refugio ha respondido a tu consulta sobre Luna', '2024-02-10 15:20:00', false, null, 1),
(7, 'NUEVA_SOLICITUD', 'Solicitud de adopción de Rocky', 'Sofía quiere adoptar a Rocky', '2024-02-18 09:10:00', false, 5, 5),
(7, 'NUEVA_SOLICITUD', 'Solicitud de adopción de Nala', 'Valentina quiere adoptar a Nala', '2024-02-19 13:00:00', false, 6, 6),
(10, 'RESPUESTA_SOLICITUD', 'Solicitud aprobada', 'Toby ha sido adoptado exitosamente', '2024-02-21 10:00:00', true, 7, 7);