
package com.example.pets_service.service;

import com.example.pets_service.model.Mascota;
import com.example.pets_service.repository.MascotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
