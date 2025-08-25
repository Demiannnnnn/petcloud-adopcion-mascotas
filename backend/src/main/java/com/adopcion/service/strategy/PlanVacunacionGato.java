package com.adopcion.service.strategy;

import com.adopcion.model.mascota.Mascota;
import com.adopcion.model.mascota.Vacuna;
import java.util.ArrayList;
import java.util.List;

public class PlanVacunacionGato implements PlanVacunacion {
    @Override
    public List<Vacuna> generarPlan(Mascota mascota) {
        // Lógica específica para gatos
        return new ArrayList<>();
    }
}
