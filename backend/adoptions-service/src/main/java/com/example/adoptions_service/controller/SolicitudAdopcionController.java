package com.example.adoptions_service.controller;

import java.net.URI;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.example.adoptions_service.model.Chat;
import com.example.adoptions_service.model.ChatParticipante;
import com.example.adoptions_service.model.EstadoSolicitud;
import com.example.adoptions_service.model.Notificacion;
import com.example.adoptions_service.model.SolicitudAdopcion;
import com.example.adoptions_service.repository.ChatParticipanteRepository;
import com.example.adoptions_service.repository.ChatRepository;
import com.example.adoptions_service.repository.MensajeRepository;
import com.example.adoptions_service.repository.NotificacionRepository;
import com.example.adoptions_service.repository.SolicitudAdopcionRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/adoptions")
public class SolicitudAdopcionController {
	private final SolicitudAdopcionRepository repo;
	private final NotificacionRepository notificacionRepo;
	private final ChatRepository chatRepo;
	private final ChatParticipanteRepository chatParticipanteRepo;
	private final MensajeRepository mensajeRepo;
	private static final Logger log = LoggerFactory.getLogger(SolicitudAdopcionController.class);

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	public SolicitudAdopcionController(SolicitudAdopcionRepository repo, RestTemplate restTemplate, NotificacionRepository notificacionRepo, ChatRepository chatRepo, ChatParticipanteRepository chatParticipanteRepo, MensajeRepository mensajeRepo) {
		this.repo = repo;
		this.restTemplate = restTemplate;
		this.notificacionRepo = notificacionRepo;
		this.chatRepo = chatRepo;
		this.chatParticipanteRepo = chatParticipanteRepo;
		this.mensajeRepo = mensajeRepo;
	}

	@PostMapping
	public ResponseEntity<?> create(@RequestBody AdopcionRequest req) {
		// basic validation
		if (req == null || req.getMascotaId() == null || req.getAdoptanteId() == null) {
			return ResponseEntity.badRequest().body(java.util.Map.of("error", "mascotaId and adoptanteId are required"));
		}
		try {
			SolicitudAdopcion s = new SolicitudAdopcion();
			s.setMascotaId(req.getMascotaId());
			s.setAdoptanteId(req.getAdoptanteId());
			s.setComentariosAdoptante(req.getMensaje());
			// optionally store contacto in comentarios if provided
			if (req.getContacto() != null && !req.getContacto().isEmpty()) {
				String prev = s.getComentariosAdoptante() == null ? "" : s.getComentariosAdoptante() + "\n";
				s.setComentariosAdoptante(prev + "Contacto: " + req.getContacto());
			}
			s.setFechaSolicitud(new java.util.Date());
			s.setEstado(EstadoSolicitud.PENDING);
			SolicitudAdopcion saved = repo.save(s);

			// create chat for this solicitud so both parties can communicate immediately
			try {
				// avoid duplicate chat
				Chat existing = chatRepo.findBySolicitudAdopcionId(saved.getId());
				if (existing == null) {
					Chat c = new Chat();
					c.setSolicitudAdopcionId(saved.getId());
					c.setFechaCreacion(new java.util.Date());
					c.setActivo(true);
					Chat persisted = chatRepo.save(c);
					log.info("Created chat {} for solicitud {}", persisted.getId(), saved.getId());

					// determine propietario (owner) via pets-service
					Long propietarioId = null;
					try {
						String petsBase = System.getenv().getOrDefault("PETS_API_BASE", "http://localhost:8082");
						java.util.Map map = restTemplate.getForObject(petsBase + "/api/mascotas/" + saved.getMascotaId(), java.util.Map.class);
						if (map != null) {
							Object pid = map.get("propietarioId");
							if (pid == null) pid = map.get("propietario");
							if (pid instanceof Number) propietarioId = ((Number)pid).longValue();
							else if (pid instanceof String) {
								try { propietarioId = Long.valueOf((String)pid); } catch (Exception x) { }
							}
						}
					} catch (Exception e) {
						log.debug("Could not fetch mascota owner for chat creation: {}", e.getMessage());
					}

					// create participants: adoptante and propietario (if available)
					Long adoptanteId = saved.getAdoptanteId();
					try {
						var existingParts = chatParticipanteRepo.findByChatId(persisted.getId());
						final Long adoptanteFinal = adoptanteId;
						final Long propietarioFinal = propietarioId;
						if (adoptanteFinal != null) {
							boolean found = existingParts.stream().anyMatch(p -> adoptanteFinal.equals(p.getPerfilId()));
							if (!found) {
								ChatParticipante p1 = new ChatParticipante();
								p1.setChatId(persisted.getId());
								p1.setPerfilId(adoptanteFinal);
								p1.setFechaUnion(new java.util.Date());
								chatParticipanteRepo.save(p1);
							}
						}
						if (propietarioFinal != null && !propietarioFinal.equals(adoptanteFinal)) {
							boolean found2 = existingParts.stream().anyMatch(p -> propietarioFinal.equals(p.getPerfilId()));
							if (!found2) {
								ChatParticipante p2 = new ChatParticipante();
								p2.setChatId(persisted.getId());
								p2.setPerfilId(propietarioFinal);
								p2.setFechaUnion(new java.util.Date());
								chatParticipanteRepo.save(p2);
							}
						}
					} catch (Exception exParts) {
						// fallback: attempt to save participants, may create duplicates but avoid failing chat creation
						if (adoptanteId != null) {
							try {
								ChatParticipante p1 = new ChatParticipante();
								p1.setChatId(persisted.getId());
								p1.setPerfilId(adoptanteId);
								p1.setFechaUnion(new java.util.Date());
								chatParticipanteRepo.save(p1);
							} catch (Exception __) {}
						}
						if (propietarioId != null && !propietarioId.equals(adoptanteId)) {
							try {
								ChatParticipante p2 = new ChatParticipante();
								p2.setChatId(persisted.getId());
								p2.setPerfilId(propietarioId);
								p2.setFechaUnion(new java.util.Date());
								chatParticipanteRepo.save(p2);
							} catch (Exception __) {}
						}
					}
				}
			} catch (Exception e) {
				log.warn("Failed to create chat for solicitud {}: {}", saved.getId(), e.getMessage());
			}

			// compose response including created chat, participants and messages if available
			java.util.Map<String, Object> out = new java.util.HashMap<>();
			out.put("solicitud", saved);
			try {
				Chat created = chatRepo.findBySolicitudAdopcionId(saved.getId());
				if (created != null) {
					out.put("chat", created);
					out.put("participantes", chatParticipanteRepo.findByChatId(created.getId()));
					try { out.put("mensajes", mensajeRepo.findByChatIdOrderByFechaAsc(created.getId())); } catch (Exception e) { out.put("mensajes", java.util.Collections.emptyList()); }
				}
			} catch (Exception e) {
				// ignore
			}
			return ResponseEntity.created(URI.create("/api/adoptions/" + saved.getId())).body(out);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(java.util.Map.of("error", "internal", "message", e.getMessage()));
		}
	}

	@GetMapping
	public List<SolicitudAdopcion> listByAdoptante(@RequestParam(required = false) Long adoptanteId) {
		if (adoptanteId != null) return repo.findByAdoptanteId(adoptanteId);
		return repo.findAll();
	}

	// Owners: list requests received for a specific mascota or multiple mascotas
	@GetMapping("/received")
	public List<SolicitudAdopcion> listReceived(@RequestParam(required = false) Long mascotaId, @RequestParam(required = false) String mascotaIds) {
		if (mascotaId != null) return repo.findByMascotaId(mascotaId);
		if (mascotaIds != null && !mascotaIds.isBlank()) {
			java.util.List<Long> ids = new java.util.ArrayList<>();
			for (String p : mascotaIds.split(",")) {
				try { ids.add(Long.valueOf(p.trim())); } catch (NumberFormatException e) {}
			}
			return repo.findByMascotaIdIn(ids);
		}
		return java.util.Collections.emptyList();
	}

	@PatchMapping("/{id}/approve")
	public ResponseEntity<?> approve(@PathVariable Long id, HttpServletRequest request) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		SolicitudAdopcion s = opt.get();
		if (s.getEstado() != EstadoSolicitud.PENDING) return ResponseEntity.badRequest().build();

		// Simple header-based authorization: require X-User-Id or X-User-Perfil-Tipo
		String headerUserId = request.getHeader("X-User-Id");
		String headerPerfilId = request.getHeader("X-User-Perfil-Id");
		String headerPerfilTipo = request.getHeader("X-User-Perfil-Tipo");
		if ((headerUserId == null || headerUserId.isEmpty()) && (headerPerfilTipo == null || headerPerfilTipo.isEmpty())) {
			return ResponseEntity.status(403).build();
		}

		// Record evaluator (if provided) and response time
		// Prefer explicit X-User-Id; fallback to X-User-Perfil-Id if present
		String evaluadorHeader = (headerUserId != null && !headerUserId.isEmpty()) ? headerUserId : headerPerfilId;
		log.debug("Approve called - headers: X-User-Id='{}', X-User-Perfil-Id='{}', X-User-Perfil-Tipo='{}'", headerUserId, headerPerfilId, headerPerfilTipo);
		if (evaluadorHeader != null && !evaluadorHeader.isEmpty()) {
			try {
				Long val = Long.valueOf(evaluadorHeader);
				s.setEvaluadorId(val);
				log.debug("Setting evaluadorId to {} for solicitud {}", val, id);
			} catch (NumberFormatException nfe) {
				log.debug("Invalid evaluador header value: {}", evaluadorHeader);
			}
		} else {
			log.debug("No evaluador header found for solicitud {}", id);
		}
		s.setFechaRespuesta(new java.util.Date());
		// mark as approved locally before attempting reservation. We'll revert if reservation fails.
		s.setEstado(EstadoSolicitud.APPROVED);
		SolicitudAdopcion saved = repo.save(s);
		log.debug("Saved solicitud {} with evaluadorId={}", saved.getId(), saved.getEvaluadorId());

		// Call pets-service /reserve endpoint to attempt atomic reservation
		try {
			String petsBase = System.getenv().getOrDefault("PETS_API_BASE", "http://localhost:8082");
			String url = petsBase + "/api/mascotas/" + s.getMascotaId() + "/reserve";
			if (s.getAdoptanteId() != null) {
				url += "?adoptanteId=" + s.getAdoptanteId();
			}
			org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(null);
			// Use POST here to avoid dependence on Apache HttpClient for PATCH support when running locally
			restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, entity, Void.class);
		} catch (org.springframework.web.client.HttpClientErrorException.Conflict cex) {
			// If pets-service reports conflict (already reserved), revert the saved approval and return 409
			s.setEstado(EstadoSolicitud.PENDING);
			s.setEvaluadorId(null);
			s.setFechaRespuesta(null);
			repo.save(s);
			return ResponseEntity.status(409).build();
		} catch (RestClientException ex) {
			// On any reservation error, revert the approval so we don't leave orphan APPROVED records.
			try {
				s.setEstado(EstadoSolicitud.PENDING);
				s.setEvaluadorId(null);
				s.setFechaRespuesta(null);
				repo.save(s);
			} catch (Exception re) {
				log.error("Failed to revert solicitud {} after reservation error: {}", id, re.getMessage(), re);
			}
			log.warn("Reservation failed for solicitud {}: {}", id, ex.getMessage());
			return ResponseEntity.status(502).body(java.util.Map.of("error", "reservation_failed", "message", ex.getMessage()));
		}

		// create a notification for the adoptante informing approval (include mascota name when available)
		try {
			if (saved.getAdoptanteId() != null) {
				String petsBase = System.getenv().getOrDefault("PETS_API_BASE", "http://localhost:8082");
				String petName = String.valueOf(saved.getMascotaId());
				try {
					java.util.Map map = restTemplate.getForObject(petsBase + "/api/mascotas/" + saved.getMascotaId(), java.util.Map.class);
					if (map != null && map.get("nombre") != null) petName = String.valueOf(map.get("nombre"));
				} catch (Exception fetchEx) {
					log.debug("Could not fetch mascota name for notification: {}", fetchEx.getMessage());
				}
				Notificacion n = new Notificacion();
				n.setDestinatarioId(saved.getAdoptanteId());
				n.setTipo("ADOPTION_APPROVED");
				n.setTitulo("Solicitud aprobada");
				n.setMensaje("Tu solicitud de adopción para la mascota " + petName + " fue aprobada.");
				n.setFecha(new java.util.Date());
				n.setLeida(false);
				n.setSolicitudAdopcionId(saved.getId());
				notificacionRepo.save(n);
			}
		} catch (Exception e) {
			log.warn("Failed to create notification for approval: {}", e.getMessage());
		}

		return ResponseEntity.ok(saved);
	}

	@PatchMapping("/{id}/reject")
	public ResponseEntity<SolicitudAdopcion> reject(@PathVariable Long id, @RequestBody(required = false) String motivo) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		SolicitudAdopcion s = opt.get();
	if (s.getEstado() != EstadoSolicitud.PENDING) return ResponseEntity.badRequest().build();
		// set evaluator and response time if header present
		// Try to extract headers from current request via RequestContextHolder
		try {
			jakarta.servlet.http.HttpServletRequest req = ((org.springframework.web.context.request.ServletRequestAttributes)org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getRequest();
			String headerUserId = req.getHeader("X-User-Id");
			String headerPerfilId = req.getHeader("X-User-Perfil-Id");
			String evaluadorHeader = (headerUserId != null && !headerUserId.isEmpty()) ? headerUserId : headerPerfilId;
			if (evaluadorHeader != null && !evaluadorHeader.isEmpty()) {
				try { s.setEvaluadorId(Long.valueOf(evaluadorHeader)); } catch (NumberFormatException e) {}
			}
		} catch (IllegalStateException ise) {
			// no request bound, ignore
		}
		s.setEstado(EstadoSolicitud.REJECTED);
		s.setMotivoRechazo(motivo);
		s.setFechaRespuesta(new java.util.Date());
		SolicitudAdopcion saved = repo.save(s);
		// create notification for rejection
		try {
			if (saved.getAdoptanteId() != null) {
				String petsBase = System.getenv().getOrDefault("PETS_API_BASE", "http://localhost:8082");
				String petName = String.valueOf(saved.getMascotaId());
				try {
					java.util.Map map = restTemplate.getForObject(petsBase + "/api/mascotas/" + saved.getMascotaId(), java.util.Map.class);
					if (map != null && map.get("nombre") != null) petName = String.valueOf(map.get("nombre"));
				} catch (Exception fetchEx) {
					log.debug("Could not fetch mascota name for notification: {}", fetchEx.getMessage());
				}
				Notificacion n = new Notificacion();
				n.setDestinatarioId(saved.getAdoptanteId());
				n.setTipo("ADOPTION_REJECTED");
				n.setTitulo("Solicitud rechazada");
				String msg = "Tu solicitud de adopción para la mascota " + petName + " fue rechazada.";
				if (motivo != null && !motivo.isBlank()) msg += " Motivo: " + motivo;
				n.setMensaje(msg);
				n.setFecha(new java.util.Date());
				n.setLeida(false);
				n.setSolicitudAdopcionId(saved.getId());
				notificacionRepo.save(n);
			}
		} catch (Exception e) {
			log.warn("Failed to create notification for rejection: {}", e.getMessage());
		}
		// delete any chat and its related resources associated with this solicitud (cleanup)
		try {
			Chat c = chatRepo.findBySolicitudAdopcionId(saved.getId());
			if (c != null) {
				// delete messages
				try {
					var msgs = mensajeRepo.findByChatIdOrderByFechaAsc(c.getId());
					if (msgs != null && !msgs.isEmpty()) mensajeRepo.deleteAll(msgs);
				} catch (Exception exm) {
					log.warn("Failed to delete mensajes for chat {}: {}", c.getId(), exm.getMessage());
				}
				// delete participants
				try {
					var parts = chatParticipanteRepo.findByChatId(c.getId());
					if (parts != null && !parts.isEmpty()) chatParticipanteRepo.deleteAll(parts);
				} catch (Exception exp) {
					log.warn("Failed to delete participantes for chat {}: {}", c.getId(), exp.getMessage());
				}
				// finally delete the chat record
				try {
					chatRepo.delete(c);
					log.info("Deleted chat {} due to solicitud {} rejection", c.getId(), saved.getId());
				} catch (Exception exc) {
					log.warn("Failed to delete chat {}: {}", c.getId(), exc.getMessage());
				}
			}
		} catch (Exception cleanupEx) {
			log.warn("Error during chat cleanup for solicitud {}: {}", saved.getId(), cleanupEx.getMessage());
		}
		return ResponseEntity.ok(saved);
	}

	@PatchMapping("/{id}/cancel")
	public ResponseEntity<SolicitudAdopcion> cancel(@PathVariable Long id) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		SolicitudAdopcion s = opt.get();
	if (s.getEstado() != EstadoSolicitud.PENDING) return ResponseEntity.badRequest().build();
		// set evaluator and response time if header present
		try {
			jakarta.servlet.http.HttpServletRequest req = ((org.springframework.web.context.request.ServletRequestAttributes)org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getRequest();
			String headerUserId = req.getHeader("X-User-Id");
			String headerPerfilId = req.getHeader("X-User-Perfil-Id");
			String evaluadorHeader = (headerUserId != null && !headerUserId.isEmpty()) ? headerUserId : headerPerfilId;
			if (evaluadorHeader != null && !evaluadorHeader.isEmpty()) {
				try { s.setEvaluadorId(Long.valueOf(evaluadorHeader)); } catch (NumberFormatException e) {}
			}
		} catch (IllegalStateException ise) {
			// ignore if no request bound
		}
		s.setEstado(EstadoSolicitud.CANCELLED);
		s.setFechaRespuesta(new java.util.Date());
		return ResponseEntity.ok(repo.save(s));
	}

	// One-off reconciliation endpoint to repair mismatches where solicitudes are APPROVED
	// but the corresponding mascota is still available. This can be invoked manually by an admin
	// or by a scheduled job later. For safety it's a POST and returns a quick summary.
	@PostMapping("/reconcile")
	public ResponseEntity<?> reconcileApproved() {
		java.util.List<SolicitudAdopcion> approved = repo.findByEstado(EstadoSolicitud.APPROVED);
		int attempted = 0, repaired = 0, conflicts = 0, errors = 0;
		String petsBase = System.getenv().getOrDefault("PETS_API_BASE", "http://localhost:8082");
		for (SolicitudAdopcion s : approved) {
			attempted++;
			try {
				String url = petsBase + "/api/mascotas/" + s.getMascotaId() + "/reserve";
				if (s.getAdoptanteId() != null) url += "?adoptanteId=" + s.getAdoptanteId();
				org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(null);
				// Use POST for the same reason as above
				restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, entity, Void.class);
				repaired++;
			} catch (org.springframework.web.client.HttpClientErrorException.Conflict cex) {
				// If already reserved by someone else, revert the approval to PENDING
				try {
					s.setEstado(EstadoSolicitud.PENDING);
					s.setEvaluadorId(null);
					s.setFechaRespuesta(null);
					repo.save(s);
				} catch (Exception re) {
					log.error("Failed to revert solicitud {} during reconcile: {}", s.getId(), re.getMessage(), re);
				}
				conflicts++;
			} catch (RestClientException rex) {
				// For other errors, revert to PENDING to avoid leaving ghost approvals
				try {
					s.setEstado(EstadoSolicitud.PENDING);
					s.setEvaluadorId(null);
					s.setFechaRespuesta(null);
					repo.save(s);
				} catch (Exception re) {
					log.error("Failed to revert solicitud {} during reconcile (error): {}", s.getId(), re.getMessage(), re);
				}
				errors++;
			}
		}
		return ResponseEntity.ok(java.util.Map.of("attempted", attempted, "repaired", repaired, "conflicts_reverted", conflicts, "errors_reverted", errors));
	}

}
