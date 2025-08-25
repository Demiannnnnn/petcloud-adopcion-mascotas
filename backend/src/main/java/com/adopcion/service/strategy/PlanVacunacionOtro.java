package com.adopcion.service.strategy;

import com.adopcion.model.mascota.Mascota;
import com.adopcion.model.mascota.Vacuna;
import java.util.ArrayList;
import java.util.List;

public class PlanVacunacionOtro implements PlanVacunacion {
    @Override
    public List<Vacuna> generarPlan(Mascota mascota) {
        // Lógica específica para otras especies
        return new ArrayList<>();
    }
}
