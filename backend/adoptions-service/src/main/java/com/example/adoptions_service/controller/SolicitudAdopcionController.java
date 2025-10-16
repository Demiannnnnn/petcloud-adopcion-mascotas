package com.example.adoptions_service.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.adoptions_service.model.SolicitudAdopcion;
import com.example.adoptions_service.repository.SolicitudAdopcionRepository;

@RestController
@RequestMapping("/api/adoptions")
public class SolicitudAdopcionController {
	private final SolicitudAdopcionRepository repo;

	public SolicitudAdopcionController(SolicitudAdopcionRepository repo) {
		this.repo = repo;
	}

	@PostMapping
	public ResponseEntity<SolicitudAdopcion> create(@RequestBody SolicitudAdopcion s) {
		s.setEstado("PENDING");
		SolicitudAdopcion saved = repo.save(s);
		return ResponseEntity.created(URI.create("/api/adoptions/" + saved.getId())).body(saved);
	}

	@GetMapping
	public List<SolicitudAdopcion> listByAdoptante(@RequestParam(required = false) Long adoptanteId) {
		if (adoptanteId != null) return repo.findByAdoptanteId(adoptanteId);
		return repo.findAll();
	}

	@PatchMapping("/{id}/approve")
	public ResponseEntity<SolicitudAdopcion> approve(@PathVariable Long id) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		SolicitudAdopcion s = opt.get();
		if (!"PENDING".equals(s.getEstado())) return ResponseEntity.badRequest().build();
		s.setEstado("APPROVED");
		return ResponseEntity.ok(repo.save(s));
	}

	@PatchMapping("/{id}/reject")
	public ResponseEntity<SolicitudAdopcion> reject(@PathVariable Long id, @RequestBody(required = false) String motivo) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		SolicitudAdopcion s = opt.get();
		if (!"PENDING".equals(s.getEstado())) return ResponseEntity.badRequest().build();
		s.setEstado("REJECTED");
		s.setMotivoRechazo(motivo);
		return ResponseEntity.ok(repo.save(s));
	}

	@PatchMapping("/{id}/cancel")
	public ResponseEntity<SolicitudAdopcion> cancel(@PathVariable Long id) {
		var opt = repo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		SolicitudAdopcion s = opt.get();
		if (!"PENDING".equals(s.getEstado())) return ResponseEntity.badRequest().build();
		s.setEstado("CANCELLED");
		return ResponseEntity.ok(repo.save(s));
	}
}
