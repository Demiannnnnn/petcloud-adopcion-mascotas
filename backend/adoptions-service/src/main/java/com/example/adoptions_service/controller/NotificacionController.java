package com.example.adoptions_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.adoptions_service.model.Notificacion;
import com.example.adoptions_service.repository.NotificacionRepository;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

	private final NotificacionRepository repo;

	@Autowired
	public NotificacionController(NotificacionRepository repo) {
		this.repo = repo;
	}

	@GetMapping
	public List<Notificacion> listByDestinatario(@RequestParam(required = false) Long destinatarioId) {
		if (destinatarioId != null) return repo.findAll().stream().filter(n -> n.getDestinatarioId() != null && n.getDestinatarioId().equals(destinatarioId)).toList();
		return repo.findAll();
	}

	@PostMapping
	public ResponseEntity<Notificacion> create(@RequestBody Notificacion n) {
		if (n == null || n.getDestinatarioId() == null) return ResponseEntity.badRequest().build();
		if (n.getFecha() == null) n.setFecha(new java.util.Date());
		if (n.getLeida() == null) n.setLeida(false);
		return ResponseEntity.ok(repo.save(n));
	}

	@org.springframework.web.bind.annotation.PatchMapping("/{id}/read")
	public ResponseEntity<Notificacion> markRead(@org.springframework.web.bind.annotation.PathVariable Long id) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		Notificacion n = opt.get();
		n.setLeida(true);
		repo.save(n);
		return ResponseEntity.ok(n);
	}

	@org.springframework.web.bind.annotation.DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<Void> delete(@org.springframework.web.bind.annotation.PathVariable Long id) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		repo.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	@org.springframework.web.bind.annotation.DeleteMapping("/clear")
	@Transactional
	public ResponseEntity<String> clearForDestinatario(@org.springframework.web.bind.annotation.RequestParam Long destinatarioId) {
		if (destinatarioId == null) return ResponseEntity.badRequest().body("destinatarioId required");
		long deleted = repo.deleteByDestinatarioId(destinatarioId);
		return ResponseEntity.ok("deleted:" + deleted);
	}

	@org.springframework.web.bind.annotation.PatchMapping("/read-all")
	@Transactional
	public ResponseEntity<String> markAllRead(@org.springframework.web.bind.annotation.RequestParam Long destinatarioId) {
		if (destinatarioId == null) return ResponseEntity.badRequest().body("destinatarioId required");
		int updated = repo.markAllReadByDestinatarioId(destinatarioId);
		// log for debugging: print destinatarioId and number of rows updated
		System.out.println("[NotificacionController] markAllRead destinatarioId=" + destinatarioId + " updated=" + updated);
		return ResponseEntity.ok("updated:" + updated);
	}
}
