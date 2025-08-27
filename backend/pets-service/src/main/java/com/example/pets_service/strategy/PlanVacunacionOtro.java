package com.example.pets_service.strategy;

import com.example.pets_service.model.Vacuna;
import com.example.pets_service.model.Mascota;
import java.util.List;

public class PlanVacunacionOtro implements PlanVacunacion {
    @Override
    public List<Vacuna> generarPlan(Mascota mascota) { return null; }
}
