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

import com.example.adoptions_service.model.EstadoSolicitud;
import com.example.adoptions_service.model.SolicitudAdopcion;
import com.example.adoptions_service.repository.SolicitudAdopcionRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/adoptions")
public class SolicitudAdopcionController {
	private final SolicitudAdopcionRepository repo;
	private static final Logger log = LoggerFactory.getLogger(SolicitudAdopcionController.class);

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	public SolicitudAdopcionController(SolicitudAdopcionRepository repo, RestTemplate restTemplate) {
		this.repo = repo;
		this.restTemplate = restTemplate;
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
			return ResponseEntity.created(URI.create("/api/adoptions/" + saved.getId())).body(saved);
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
			org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(null);
			restTemplate.exchange(url, org.springframework.http.HttpMethod.PATCH, entity, Void.class);
		} catch (org.springframework.web.client.HttpClientErrorException.Conflict cex) {
			// If pets-service reports conflict (already reserved), revert the saved approval and return 409
			s.setEstado(EstadoSolicitud.PENDING);
			s.setEvaluadorId(null);
			s.setFechaRespuesta(null);
			repo.save(s);
			return ResponseEntity.status(409).build();
		} catch (RestClientException ex) {
			// Leave the saved approval (external error). Proxy a 502 to the client with saved resource
			return ResponseEntity.status(502).body(saved);
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
		return ResponseEntity.ok(repo.save(s));
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
}
