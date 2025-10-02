package com.example.users_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.users_service.model.Refugio;
import com.example.users_service.service.RefugioService;

@RestController
@RequestMapping("/api/refugios")
public class RefugioController {
    @Autowired
    private RefugioService refugioService;

    @GetMapping("/empresa/{empresaId}")
    public List<Refugio> getRefugiosByEmpresa(@PathVariable Long empresaId) {
        return refugioService.getRefugiosByEmpresa(empresaId);
    }

    @PostMapping
    public Refugio registrarRefugio(@RequestBody Refugio refugio) {
        return refugioService.registrarRefugio(refugio);
    }
}
