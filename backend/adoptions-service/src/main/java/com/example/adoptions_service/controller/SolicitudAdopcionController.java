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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;

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
@CrossOrigin(origins = {"https://localhost", "https://localhost:443", "http://localhost:3000", "http://localhost:3001"})
public class SolicitudAdopcionController {
	private final SolicitudAdopcionRepository repo;
	private final NotificacionRepository notificacionRepo;
	private final ChatRepository chatRepo;
	private final ChatParticipanteRepository chatParticipanteRepo;
	private final MensajeRepository mensajeRepo;
	private static final Logger log = LoggerFactory.getLogger(SolicitudAdopcionController.class);

	@Value("${adoption.limit.persona}")
	private int personaAdoptionLimit;

	@Value("${adoption.limit.empresa}")
	private int empresaAdoptionLimit;

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

	@GetMapping("/count/{adoptanteId}")
	public ResponseEntity<?> getAdoptionCount(@PathVariable Long adoptanteId) {
		long approvedCount = repo.findByAdoptanteId(adoptanteId).stream()
			.filter(s -> s.getEstado() == EstadoSolicitud.APPROVED)
			.count();
		return ResponseEntity.ok(Map.of("approvedCount", approvedCount));
	}

	/**
	 * Idempotent endpoint to ensure a chat exists for an existing solicitud.
	 * Useful to backfill chats for solicitudes created before this logic was deployed.
	 */
	@PostMapping("/{id}/ensure-chat")
	public ResponseEntity<?> ensureChatForSolicitud(@PathVariable Long id) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		SolicitudAdopcion s = opt.get();
		try {
			// if already exists, return it
			Chat existing = chatRepo.findBySolicitudAdopcionId(s.getId());
			if (existing != null) {
				java.util.Map<String,Object> out = new java.util.HashMap<>();
				out.put("chat", existing);
				out.put("participantes", chatParticipanteRepo.findByChatId(existing.getId()));
				try { out.put("mensajes", mensajeRepo.findByChatIdOrderByFechaAsc(existing.getId())); } catch (Exception e) { out.put("mensajes", java.util.Collections.emptyList()); }
				return ResponseEntity.ok(out);
			}

			// determine propietario via pets-service if possible
			Long propietarioId = null;
			try {
				String petsBase = System.getenv().getOrDefault("PETS_API_BASE", "http://localhost:8082");
				java.util.Map map = restTemplate.getForObject(petsBase + "/api/mascotas/" + s.getMascotaId(), java.util.Map.class);
				if (map != null) {
					Object pid = map.get("propietarioId");
					if (pid == null) pid = map.get("propietario");
					if (pid instanceof Number) propietarioId = ((Number)pid).longValue();
					else if (pid instanceof String) {
						try { propietarioId = Long.valueOf((String)pid); } catch (Exception x) { }
					}
				}
			} catch (Exception e) {
				log.debug("Could not fetch mascota owner for ensure-chat: {}", e.getMessage());
			}

			Long adoptanteId = s.getAdoptanteId();
			Chat persisted = null;
			try {
				if (adoptanteId != null && propietarioId != null) {
					var partsOfAdoptante = chatParticipanteRepo.findByPerfilId(adoptanteId);
					for (var pa : partsOfAdoptante) {
						Long candidateChatId = pa.getChatId();
						var parts = chatParticipanteRepo.findByChatId(candidateChatId);
						boolean hasProp = false;
						for (var p : parts) {
							if (propietarioId.equals(p.getPerfilId())) { hasProp = true; break; }
						}
						if (hasProp) {
							persisted = chatRepo.findById(candidateChatId).orElse(null);
							log.info("Reusing existing chat {} between {} and {} for solicitud {}", candidateChatId, adoptanteId, propietarioId, s.getId());
							break;
						}
					}
				}
				if (persisted == null) {
					Chat c = new Chat();
					c.setSolicitudAdopcionId(s.getId());
					c.setFechaCreacion(new java.util.Date());
					c.setActivo(true);
					persisted = chatRepo.save(c);
					log.info("Created chat {} for solicitud {} (ensure)", persisted.getId(), s.getId());
					// add participants
					if (adoptanteId != null) {
						ChatParticipante p1 = new ChatParticipante();
						p1.setChatId(persisted.getId());
						p1.setPerfilId(adoptanteId);
						p1.setFechaUnion(new java.util.Date());
						chatParticipanteRepo.save(p1);
					}
					if (propietarioId != null && !propietarioId.equals(adoptanteId)) {
						ChatParticipante p2 = new ChatParticipante();
						p2.setChatId(persisted.getId());
						p2.setPerfilId(propietarioId);
						p2.setFechaUnion(new java.util.Date());
						chatParticipanteRepo.save(p2);
					}
				}
			} catch (Exception ex) {
				log.warn("ensure-chat failed for solicitud {}: {}", s.getId(), ex.getMessage());
			}

			// attempt to create contactos in users-service if both known
			try {
				if (adoptanteId != null && propietarioId != null) {
					String usersBase = System.getenv().getOrDefault("USERS_API_BASE", "http://localhost:8081");
					java.util.Map<String,Object> b1 = new java.util.HashMap<>();
					b1.put("ownerPerfilId", propietarioId);
					b1.put("contactoPerfilId", adoptanteId);
					try { restTemplate.postForEntity(usersBase + "/api/contactos", b1, java.util.Map.class); } catch (Exception x) { log.debug("could not add contacto: {}", x.getMessage()); }
					java.util.Map<String,Object> b2 = new java.util.HashMap<>();
					b2.put("ownerPerfilId", adoptanteId);
					b2.put("contactoPerfilId", propietarioId);
					try { restTemplate.postForEntity(usersBase + "/api/contactos", b2, java.util.Map.class); } catch (Exception x) { log.debug("could not add contacto reverse: {}", x.getMessage()); }
				}
			} catch (Exception e) { log.debug("contacts create failed: {}", e.getMessage()); }

			// return created chat info
			Chat created = chatRepo.findBySolicitudAdopcionId(s.getId());
			java.util.Map<String,Object> out = new java.util.HashMap<>();
			out.put("chat", created);
			out.put("participantes", created == null ? java.util.Collections.emptyList() : chatParticipanteRepo.findByChatId(created.getId()));
			try { out.put("mensajes", created == null ? java.util.Collections.emptyList() : mensajeRepo.findByChatIdOrderByFechaAsc(created.getId())); } catch (Exception e) { out.put("mensajes", java.util.Collections.emptyList()); }
			return ResponseEntity.status(created == null ? 500 : 201).body(out);
		} catch (Exception e) {
			return ResponseEntity.status(500).body(java.util.Map.of("error","internal","message", e.getMessage()));
		}
	}

	@PostMapping
	public ResponseEntity<?> create(@RequestBody AdopcionRequest req) {
		log.info("Received adoption request: {}", req);
		// basic validation
		if (req == null || req.getMascotaId() == null || req.getAdoptanteId() == null) {
			return ResponseEntity.badRequest().body(java.util.Map.of("error", "mascotaId and adoptanteId are required"));
		}

		// Check adoption limit
		try {
			String usersBase = System.getenv().getOrDefault("USERS_API_BASE", "http://localhost:8081");
			String url = usersBase + "/api/perfil/" + req.getAdoptanteId();
			ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
			Map<String, Object> userProfile = response.getBody();
			String userType = (String) userProfile.get("tipoPerfil");
			log.info("User type: {}", userType);

			long approvedCount = repo.findByAdoptanteId(req.getAdoptanteId()).stream()
				.filter(s -> s.getEstado() == EstadoSolicitud.APPROVED)
				.count();
			log.info("Approved adoption count: {}", approvedCount);

			if ("PERSONA".equals(userType) && approvedCount >= personaAdoptionLimit) {
				log.warn("Adoption limit reached for user {}", req.getAdoptanteId());
				return ResponseEntity.status(403).body(Map.of("error", "Adoption limit reached for PERSONA"));
			} else if ("EMPRESA".equals(userType) && approvedCount >= empresaAdoptionLimit) {
				log.warn("Adoption limit reached for user {}", req.getAdoptanteId());
				return ResponseEntity.status(403).body(Map.of("error", "Adoption limit reached for EMPRESA"));
			}
		} catch (Exception e) {
			log.error("Failed to check adoption limit", e);
			return ResponseEntity.status(500).body(Map.of("error", "Failed to check adoption limit"));
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

					// Attempt to reuse an existing chat between adoptante and propietario (if both known)
					Long adoptanteId = saved.getAdoptanteId();
					Chat persisted = null;
					try {
						if (adoptanteId != null && propietarioId != null) {
							// find participant entries for adoptante and check chats where propietario also participates
							var partsOfAdoptante = chatParticipanteRepo.findByPerfilId(adoptanteId);
							for (var pa : partsOfAdoptante) {
								Long candidateChatId = pa.getChatId();
								var parts = chatParticipanteRepo.findByChatId(candidateChatId);
								boolean hasProp = false;
								for (var p : parts) {
									if (propietarioId.equals(p.getPerfilId())) { hasProp = true; break; }
								}
								if (hasProp) {
									// reuse this chat
									persisted = chatRepo.findById(candidateChatId).orElse(null);
									if (persisted != null) {
										// Update the solicitudAdopcionId to link this chat to the new solicitud
										persisted.setSolicitudAdopcionId(saved.getId());
										persisted = chatRepo.save(persisted);
									}
									log.info("Reusing existing chat {} between {} and {} for solicitud {}", candidateChatId, adoptanteId, propietarioId, saved.getId());
									break;
								}
							}
						}
						if (persisted == null) {
							// no existing chat found, create a new one and attach participants
							Chat c = new Chat();
							c.setSolicitudAdopcionId(saved.getId());
							c.setFechaCreacion(new java.util.Date());
							c.setActivo(true);
							persisted = chatRepo.save(c);
							log.info("Created chat {} for solicitud {}", persisted.getId(), saved.getId());

							// create participants: adoptante and propietario (if available)
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
						}
					} catch (Exception exParts) {
						// fallback: if any issue, try to create participants on a newly created chat
						if (persisted == null) {
							try {
								Chat c = new Chat();
								c.setSolicitudAdopcionId(saved.getId());
								c.setFechaCreacion(new java.util.Date());
								c.setActivo(true);
								persisted = chatRepo.save(c);
							} catch (Exception ee) { persisted = null; }
						}
						// attempt to create contacts between adoptante and propietario in users-service
						try {
							if (adoptanteId != null && propietarioId != null) {
								String usersBase = System.getenv().getOrDefault("USERS_API_BASE", "http://localhost:8081");
								java.util.Map<String, Object> body1 = new java.util.HashMap<>();
								body1.put("ownerPerfilId", propietarioId);
								body1.put("contactoPerfilId", adoptanteId);
								try {
									restTemplate.postForEntity(usersBase + "/api/contactos", body1, java.util.Map.class);
									log.info("Added contacto: owner={} contacto={}", propietarioId, adoptanteId);
								} catch (Exception e2) {
									log.debug("Could not add contacto (owner->contacto): {}", e2.getMessage());
								}

								java.util.Map<String, Object> body2 = new java.util.HashMap<>();
								body2.put("ownerPerfilId", adoptanteId);
								body2.put("contactoPerfilId", propietarioId);
								try {
									restTemplate.postForEntity(usersBase + "/api/contactos", body2, java.util.Map.class);
									log.info("Added contacto: owner={} contacto={}", adoptanteId, propietarioId);
								} catch (Exception e3) {
									log.debug("Could not add contacto (contacto->owner): {}", e3.getMessage());
								}
							}
						} catch (Exception exContact) {
							log.debug("Failed to call users-service to add contactos: {}", exContact.getMessage());
						}
						// If frontend supplied an explicit contacto id in request, try to create contacto(s) with that id
						try {
							if (req != null && req.getContacto() != null && !req.getContacto().isBlank()) {
								Long supplied = null;
								try { supplied = Long.valueOf(req.getContacto().trim()); } catch (Exception x) { supplied = null; }
								if (supplied != null && adoptanteId != null) {
									String usersBase = System.getenv().getOrDefault("USERS_API_BASE", "http://localhost:8081");
									// add contacto: adoptante -> supplied
									java.util.Map<String,Object> bodyA = new java.util.HashMap<>();
									bodyA.put("ownerPerfilId", adoptanteId);
									bodyA.put("contactoPerfilId", supplied);
									try {
										restTemplate.postForEntity(usersBase + "/api/contactos", bodyA, java.util.Map.class);
										log.info("Added explicit contacto: owner={} contacto={}", adoptanteId, supplied);
									} catch (Exception e4) {
										log.debug("Could not add explicit contacto (adoptante->supplied): {}", e4.getMessage());
									}
									// also add reverse if propietario unknown: supplied -> adoptante
									java.util.Map<String,Object> bodyB = new java.util.HashMap<>();
									bodyB.put("ownerPerfilId", supplied);
									bodyB.put("contactoPerfilId", adoptanteId);
									try {
										restTemplate.postForEntity(usersBase + "/api/contactos", bodyB, java.util.Map.class);
										log.info("Added explicit contacto: owner={} contacto={}", supplied, adoptanteId);
									} catch (Exception e5) {
										log.debug("Could not add explicit contacto (supplied->adoptante): {}", e5.getMessage());
									}
								}
							}
						} catch (Exception exExplicit) {
							log.debug("Failed to add explicit contacto from request: {}", exExplicit.getMessage());
						}
						if (persisted != null) {
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
				}
			} catch (Exception e) {
				log.warn("Failed to create chat for solicitud {}: {}", saved.getId(), e.getMessage());
			}

			// After creating/reusing chat and participants, attempt to persist contactos in users-service
			try {
				Long adoptanteIdLocal = saved.getAdoptanteId();
				Long propietarioIdLocal = null;
				try {
					Chat created = chatRepo.findBySolicitudAdopcionId(saved.getId());
					if (created != null) {
						var parts = chatParticipanteRepo.findByChatId(created.getId());
						if (parts != null) {
							for (var p : parts) {
								Long pid = p.getPerfilId();
								if (pid != null && adoptanteIdLocal != null && !pid.equals(adoptanteIdLocal)) {
									propietarioIdLocal = pid;
									break;
								}
							}
						}
					}
				} catch (Exception xx) { /* ignore */ }

				String usersBase = System.getenv().getOrDefault("USERS_API_BASE", "http://localhost:8081");
				if (adoptanteIdLocal != null && propietarioIdLocal != null) {
					java.util.Map<String, Object> b1 = new java.util.HashMap<>();
					b1.put("ownerPerfilId", propietarioIdLocal);
					b1.put("contactoPerfilId", adoptanteIdLocal);
					try {
						var resp1 = restTemplate.postForEntity(usersBase + "/api/contactos", b1, java.util.Map.class);
						log.info("Created contacto (owner->contacto) {} -> {} status={}", propietarioIdLocal, adoptanteIdLocal, resp1 != null ? resp1.getStatusCodeValue() : "n/a");
					} catch (Exception ecc) { log.debug("Failed to create contacto owner->adoptante: {}", ecc.getMessage()); }

					java.util.Map<String, Object> b2 = new java.util.HashMap<>();
					b2.put("ownerPerfilId", adoptanteIdLocal);
					b2.put("contactoPerfilId", propietarioIdLocal);
					try {
						var resp2 = restTemplate.postForEntity(usersBase + "/api/contactos", b2, java.util.Map.class);
						log.info("Created contacto (adoptante->owner) {} -> {} status={}", adoptanteIdLocal, propietarioIdLocal, resp2 != null ? resp2.getStatusCodeValue() : "n/a");
					} catch (Exception ecd) { log.debug("Failed to create contacto adoptante->owner: {}", ecd.getMessage()); }
				}

				// If frontend supplied an explicit contacto id, try to use that too
				try {
					if (req != null && req.getContacto() != null && !req.getContacto().isBlank()) {
						Long supplied = null;
						try { supplied = Long.valueOf(req.getContacto().trim()); } catch (Exception x) { supplied = null; }
						if (supplied != null && adoptanteIdLocal != null) {
							java.util.Map<String,Object> bodyA = new java.util.HashMap<>();
							bodyA.put("ownerPerfilId", adoptanteIdLocal);
							bodyA.put("contactoPerfilId", supplied);
							try {
								var rA = restTemplate.postForEntity(usersBase + "/api/contactos", bodyA, java.util.Map.class);
								log.info("Created explicit contacto {} -> {} status={}", adoptanteIdLocal, supplied, rA != null ? rA.getStatusCodeValue() : "n/a");
							} catch (Exception e4) { log.debug("Could not add explicit contacto (adoptante->supplied): {}", e4.getMessage()); }

							java.util.Map<String,Object> bodyB = new java.util.HashMap<>();
							bodyB.put("ownerPerfilId", supplied);
							bodyB.put("contactoPerfilId", adoptanteIdLocal);
							try {
								var rB = restTemplate.postForEntity(usersBase + "/api/contactos", bodyB, java.util.Map.class);
								log.info("Created explicit contacto {} -> {} status={}", supplied, adoptanteIdLocal, rB != null ? rB.getStatusCodeValue() : "n/a");
							} catch (Exception e5) { log.debug("Could not add explicit contacto (supplied->adoptante): {}", e5.getMessage()); }
						}
					}
				} catch (Exception exx) { log.debug("Error while trying explicit contacto: {}", exx.getMessage()); }
			} catch (Exception exAll) { log.debug("Contacts creation overall failed: {}", exAll.getMessage()); }

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
