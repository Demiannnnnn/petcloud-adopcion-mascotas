package com.example.donations_service.repository;

import com.example.donations_service.model.Donacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {
    List<Donacion> findByDonanteId(Long donanteId);
    List<Donacion> findByReceptorId(Long receptorId);
    List<Donacion> findByDonanteIdOrderByFechaDonacionDesc(Long donanteId);
    List<Donacion> findByReceptorIdOrderByFechaDonacionDesc(Long receptorId);
}
