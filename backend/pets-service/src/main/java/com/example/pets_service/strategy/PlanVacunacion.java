package com.example.pets_service.strategy;

import com.example.pets_service.model.Vacuna;
import com.example.pets_service.model.Mascota;
import java.util.List;

public interface PlanVacunacion {
    List<Vacuna> generarPlan(Mascota mascota);
}

