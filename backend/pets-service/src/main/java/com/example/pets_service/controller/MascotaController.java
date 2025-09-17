package com.example.pets_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.pets_service.model.Mascota;
import com.example.pets_service.service.MascotaService;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {
	private final MascotaService mascotaService;

	@Autowired
	public MascotaController(MascotaService mascotaService) {
		this.mascotaService = mascotaService;
	}

	@GetMapping
	public List<Mascota> listarMascotas() {
		return mascotaService.listarMascotas();
	}
}
