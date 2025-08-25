package com.adopcion.service.strategy;

import com.adopcion.model.mascota.Mascota;
import com.adopcion.model.mascota.Vacuna;
import java.util.List;

public interface PlanVacunacion {
    List<Vacuna> generarPlan(Mascota mascota);
}
