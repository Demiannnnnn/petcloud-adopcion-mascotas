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

import com.adopcion.model.Mascota;
import com.adopcion.model.Usuario;
import com.adopcion.repository.MascotaRepository;
import com.adopcion.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/mascotas")
@CrossOrigin(origins = "*")
public class MascotaController {
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private MascotaRepository mascotaRepository;

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
        Usuario usuario = usuarioRepository.findByUsername(username);
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario especificado no existe: " + username);
        }
        mascota.setUsuario(usuario);
        return mascotaRepository.save(mascota);
    }

    @PutMapping("/{id}")
    public Mascota updateMascota(@PathVariable Long id, @RequestBody Mascota mascotaDetails, @RequestHeader("X-User") String username, @RequestHeader("X-Rol") String rol) {
    Mascota mascota = mascotaRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota not found with id " + id));
    // Obtener usuario desde header personalizado (X-User)
    // username y rol ya vienen de los headers
    Usuario currentUser = usuarioRepository.findByUsername(username);
    boolean isAdmin = rol != null && rol.equalsIgnoreCase("ADMIN");
    boolean isOwner = mascota.getUsuario() != null && currentUser != null && mascota.getUsuario().getUsername().equals(currentUser.getUsername());
    if (!isAdmin && !isOwner) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para editar esta mascota");
    }
    mascota.setNombre(mascotaDetails.getNombre());
    mascota.setTipo(mascotaDetails.getTipo()); // Corregido: actualizar tipo
    mascota.setDescripcion(mascotaDetails.getDescripcion());
    mascota.setEdad(mascotaDetails.getEdad());
    mascota.setRaza(mascotaDetails.getRaza());
    // Si tienes setImagen, descomenta la siguiente línea
    // mascota.setImagen(mascotaDetails.getImagen());
    return mascotaRepository.save(mascota);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMascota(@PathVariable Long id, @RequestHeader("X-User") String username, @RequestHeader("X-Rol") String rol) {
    Mascota mascota = mascotaRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota not found with id " + id));
    // Obtener usuario desde header personalizado (X-User)
    // username y rol ya vienen de los headers
    Usuario currentUser = usuarioRepository.findByUsername(username);
    boolean isAdmin = rol != null && rol.equalsIgnoreCase("ADMIN");
    boolean isOwner = mascota.getUsuario() != null && currentUser != null && mascota.getUsuario().getUsername().equals(currentUser.getUsername());
    if (!isAdmin && !isOwner) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar esta mascota");
    }
    mascotaRepository.delete(mascota);
    return ResponseEntity.ok().build();
    }

    // Agregar imágenes adicionales a una mascota existente
    @PostMapping("/{id}/imagenes")
    public ResponseEntity<Mascota> addImagenes(@PathVariable Long id, @RequestBody List<String> nuevasImagenes) {
        Optional<Mascota> optMascota = mascotaRepository.findById(id);
        if (optMascota.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Mascota mascota = optMascota.get();
        List<String> imagenes = mascota.getImagenes();
        imagenes.addAll(nuevasImagenes);
        mascota.setImagenes(imagenes);
        mascotaRepository.save(mascota);
        return ResponseEntity.ok(mascota);
    }

    // Eliminar una imagen de la galería de una mascota
    @DeleteMapping("/{id}/imagenes")
    public ResponseEntity<Mascota> removeImagen(@PathVariable Long id, @RequestParam String url) {
        Optional<Mascota> optMascota = mascotaRepository.findById(id);
        if (optMascota.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Mascota mascota = optMascota.get();
        List<String> imagenes = mascota.getImagenes();
        boolean removed = imagenes.remove(url);
        if (!removed) {
            return ResponseEntity.badRequest().body(mascota);
        }
        mascota.setImagenes(imagenes);
        mascotaRepository.save(mascota);
        return ResponseEntity.ok(mascota);
    }
}
