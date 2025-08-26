package com.adopcion.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.adopcion.model.mascota.Foto;
import com.adopcion.model.mascota.Mascota;
import com.adopcion.model.perfil.Perfil;
import com.adopcion.repository.MascotaRepository;
import com.adopcion.repository.PerfilRepository;

@RestController
@RequestMapping("/api/mascotas")
@CrossOrigin(origins = "*")
public class MascotaController {
    @Autowired
    private PerfilRepository perfilRepository;
    @Autowired
    private MascotaRepository mascotaRepository;

    // Alias para agregar imágenes a la galería (compatibilidad frontend)
    @PostMapping("/{id}/imagenes")
    public ResponseEntity<Mascota> addImagenes(@PathVariable Long id, @RequestBody List<String> nuevasFotos) {
        return addFotos(id, nuevasFotos);
    }

    // Eliminar una imagen de la galería de una mascota por URL
    @DeleteMapping("/{id}/imagenes")
    public ResponseEntity<Mascota> removeImagen(@PathVariable Long id, @RequestParam String url) {
        Optional<Mascota> optMascota = mascotaRepository.findById(id);
        if (optMascota.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Mascota mascota = optMascota.get();
        if (mascota.getImagenes() == null) {
            return ResponseEntity.ok(mascota);
        }
        boolean removed = mascota.getImagenes().removeIf(f -> f.getUrl().equals(url));
        if (!removed) {
            return ResponseEntity.badRequest().body(mascota);
        }
        mascotaRepository.save(mascota);
        return ResponseEntity.ok(mascota);
    }

    @GetMapping
    public List<Mascota> getAll() {
        return mascotaRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Mascota> getById(@PathVariable Long id) {
        return mascotaRepository.findById(id);
    }

    @PostMapping
    public Mascota create(@RequestBody Mascota mascota, @RequestHeader("X-User") String username) {
        Perfil perfil = perfilRepository.findByUsername(username);
        if (perfil == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario especificado no existe: " + username);
        }
        mascota.setPerfil(perfil);
        // Asegurar que todos los campos estén correctamente asignados (por si el frontend omite alguno)
        if (mascota.getNombre() == null) mascota.setNombre("");
        if (mascota.getEspecie() == null) mascota.setEspecie("");
        if (mascota.getTipo() == null) mascota.setTipo("");
        if (mascota.getRaza() == null) mascota.setRaza("");
        if (mascota.getSexo() == null) mascota.setSexo("");
        if (mascota.getUbicacion() == null) mascota.setUbicacion("");
        if (mascota.getDescripcion() == null) mascota.setDescripcion("");
        if (mascota.getFotoUrl() == null) mascota.setFotoUrl("");
        // adoptado por defecto false si no viene
        // historialClinico, imagenes, videos se manejan aparte
        return mascotaRepository.save(mascota);
    }

    @PutMapping("/{id}")
    public Mascota updateMascota(@PathVariable Long id, @RequestBody Mascota mascotaDetails, @RequestHeader("X-User") String username, @RequestHeader("X-Rol") String rol) {
        Mascota mascota = mascotaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota not found with id " + id));
        Perfil currentUser = perfilRepository.findByUsername(username);
        boolean isAdmin = rol != null && rol.equalsIgnoreCase("ADMIN");
        boolean isOwner = mascota.getPerfil() != null && currentUser != null && mascota.getPerfil().getUsername().equals(currentUser.getUsername());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para editar esta mascota");
        }
    mascota.setNombre(mascotaDetails.getNombre());
    mascota.setEspecie(mascotaDetails.getEspecie());
    mascota.setTipo(mascotaDetails.getTipo());
    mascota.setRaza(mascotaDetails.getRaza());
    mascota.setEdad(mascotaDetails.getEdad());
    mascota.setSexo(mascotaDetails.getSexo());
    mascota.setUbicacion(mascotaDetails.getUbicacion());
    mascota.setDescripcion(mascotaDetails.getDescripcion());
    mascota.setFotoUrl(mascotaDetails.getFotoUrl());
    mascota.setAdoptado(mascotaDetails.isAdoptado());
    // historialClinico, imagenes, videos se manejan aparte
    return mascotaRepository.save(mascota);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMascota(@PathVariable Long id, @RequestHeader("X-User") String username, @RequestHeader("X-Rol") String rol) {
        Mascota mascota = mascotaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota not found with id " + id));
        Perfil currentUser = perfilRepository.findByUsername(username);
        boolean isAdmin = rol != null && rol.equalsIgnoreCase("ADMIN");
        boolean isOwner = mascota.getPerfil() != null && currentUser != null && mascota.getPerfil().getUsername().equals(currentUser.getUsername());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar esta mascota");
        }
        mascotaRepository.delete(mascota);
        return ResponseEntity.ok().build();
    }

    // Agregar imágenes adicionales a una mascota existente
    @PostMapping("/{id}/fotos")
    public ResponseEntity<Mascota> addFotos(@PathVariable Long id, @RequestBody List<String> nuevasFotos) {
        Optional<Mascota> optMascota = mascotaRepository.findById(id);
        if (optMascota.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Mascota mascota = optMascota.get();
        if (mascota.getImagenes() == null) {
            mascota.setImagenes(new java.util.ArrayList<>());
        }
        for (String url : nuevasFotos) {
            Foto foto = new Foto();
            foto.setUrl(url);
            foto.setMascota(mascota);
            mascota.getImagenes().add(foto);
        }
        mascotaRepository.save(mascota);
        return ResponseEntity.ok(mascota);
    }
}