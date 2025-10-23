package com.example.pets_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.pets_service.model.Mascota;
import com.example.pets_service.repository.MascotaRepository;

@Component
public class MediaBackfillRunner implements CommandLineRunner {

    @Value("${app.backfill-media:false}")
    private boolean enabled;

    private final MascotaRepository repo;

    @Autowired
    public MediaBackfillRunner(MascotaRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!enabled) return;
        System.out.println("[media-backfill] Running mediaJson backfill from imagenUrl...");
        java.util.List<Mascota> all = repo.findAll();
        int updated = 0;
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
        for (Mascota m : all) {
            try {
                String mj = m.getMediaJson();
                String img = m.getImagenUrl();
                if ((mj == null || mj.trim().isEmpty()) && img != null && !img.trim().isEmpty()) {
                    java.util.List<java.util.Map<String,String>> list = new java.util.ArrayList<>();
                    java.util.Map<String,String> it = new java.util.HashMap<>();
                    it.put("url", img);
                    it.put("type", "image/*");
                    list.add(it);
                    m.setMediaJson(om.writeValueAsString(list));
                    repo.save(m);
                    updated++;
                }
            } catch (Exception e) {
                System.err.println("[media-backfill] error on id="+m.getId()+" : "+e.getMessage());
            }
        }
        System.out.println("[media-backfill] Done. Updated="+updated);
    }
}
