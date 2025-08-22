package com.adopcion.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adopcion.model.Adopcion;
import com.adopcion.model.Mascota;
import com.adopcion.repository.AdopcionRepository;
import com.adopcion.repository.MascotaRepository;

@RestController
@RequestMapping("/api/adopciones")
@CrossOrigin(origins = "*")
public class AdopcionController {
    @Autowired
    private AdopcionRepository adopcionRepository;

    @Autowired
    private MascotaRepository mascotaRepository;

    @GetMapping
    public List<Adopcion> getAll() {
        return adopcionRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Adopcion> getById(@PathVariable Long id) {
        return adopcionRepository.findById(id);
    }

    @PostMapping
    public Adopcion create(@RequestBody Adopcion adopcion) {
        // Validar que la mascota no esté ya adoptada
        if (adopcion.getMascota() != null && adopcion.getMascota().getId() != null) {
            Optional<Mascota> optMascota = mascotaRepository.findById(adopcion.getMascota().getId());
            if (optMascota.isPresent()) {
                Mascota mascota = optMascota.get();
                if (mascota.isAdoptado()) {
                    throw new RuntimeException("La mascota ya está adoptada.");
                }
                // También verificar si ya existe una adopción activa para esta mascota
                List<Adopcion> adopciones = adopcionRepository.findAll();
                boolean yaAdoptada = adopciones.stream().anyMatch(a -> a.getMascota() != null && a.getMascota().getId().equals(mascota.getId()) && (a.getEstado() == null || !"Cancelada".equalsIgnoreCase(a.getEstado())));
                if (yaAdoptada) {
                    throw new RuntimeException("La mascota ya está en proceso de adopción o adoptada.");
                }
                mascota.setAdoptado(true);
                mascotaRepository.save(mascota);
            }
        }
        // Estado por defecto
        if (adopcion.getEstado() == null || adopcion.getEstado().isEmpty()) {
            adopcion.setEstado("En proceso");
        }
        return adopcionRepository.save(adopcion);
    }

    @PutMapping("/{id}")
    public Adopcion update(@PathVariable Long id, @RequestBody Adopcion adopcion) {
        adopcion.setId(id);
        return adopcionRepository.save(adopcion);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Optional<Adopcion> optAdopcion = adopcionRepository.findById(id);
        if (optAdopcion.isPresent()) {
            Adopcion adopcion = optAdopcion.get();
            if (adopcion.getMascota() != null && adopcion.getMascota().getId() != null) {
                mascotaRepository.findById(adopcion.getMascota().getId()).ifPresent(mascota -> {
                    mascota.setAdoptado(false);
                    mascotaRepository.save(mascota);
                });
            }
        }
        adopcionRepository.deleteById(id);
    }

    // Aprobar adopción
    @PutMapping("/{id}/aprobar")
    public Adopcion aprobarAdopcion(@PathVariable Long id) {
        Optional<Adopcion> optAdopcion = adopcionRepository.findById(id);
        if (optAdopcion.isPresent()) {
            Adopcion adopcion = optAdopcion.get();
            adopcion.setEstado("APROBADA");
            adopcion.setFechaAdopcion(java.time.LocalDate.now());
            // Marcar mascota como adoptada
            if (adopcion.getMascota() != null && adopcion.getMascota().getId() != null) {
                mascotaRepository.findById(adopcion.getMascota().getId()).ifPresent(mascota -> {
                    mascota.setAdoptado(true);
                    mascotaRepository.save(mascota);
                });
            }
            return adopcionRepository.save(adopcion);
        }
        throw new RuntimeException("Adopción no encontrada");
    }

    // Rechazar adopción
    @PutMapping("/{id}/rechazar")
    public Adopcion rechazarAdopcion(@PathVariable Long id) {
        Optional<Adopcion> optAdopcion = adopcionRepository.findById(id);
        if (optAdopcion.isPresent()) {
            Adopcion adopcion = optAdopcion.get();
            adopcion.setEstado("RECHAZADA");
            // Liberar mascota si corresponde
            if (adopcion.getMascota() != null && adopcion.getMascota().getId() != null) {
                mascotaRepository.findById(adopcion.getMascota().getId()).ifPresent(mascota -> {
                    mascota.setAdoptado(false);
                    mascotaRepository.save(mascota);
                });
            }
            return adopcionRepository.save(adopcion);
        }
        throw new RuntimeException("Adopción no encontrada");
    }
}