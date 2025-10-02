package com.example.users_service.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.users_service.model.Refugio;
import com.example.users_service.repository.RefugioRepository;

@Service
public class RefugioService {
    @Autowired
    private RefugioRepository refugioRepository;

    public List<Refugio> getRefugiosByEmpresa(Long empresaId) {
        return refugioRepository.findByEmpresaId(empresaId);
    }

    public Refugio registrarRefugio(Refugio refugio) {
        return refugioRepository.save(refugio);
    }
}
