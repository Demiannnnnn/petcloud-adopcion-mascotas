
package com.example.pets_service.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.pets_service.model.Mascota;
import com.example.pets_service.repository.MascotaRepository;

@Service
public class MascotaService {
	private final MascotaRepository mascotaRepository;

	@Autowired
	public MascotaService(MascotaRepository mascotaRepository) {
		this.mascotaRepository = mascotaRepository;
	}

	public List<Mascota> listarMascotas() {
		return mascotaRepository.findAll();
	}
}
