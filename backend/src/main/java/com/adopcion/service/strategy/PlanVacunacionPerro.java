package com.adopcion.service.strategy;

import com.adopcion.model.mascota.Mascota;
import com.adopcion.model.mascota.Vacuna;
import java.util.ArrayList;
import java.util.List;

public class PlanVacunacionPerro implements PlanVacunacion {
    @Override
    public List<Vacuna> generarPlan(Mascota mascota) {
        // Lógica específica para perros
        return new ArrayList<>();
    }
}
