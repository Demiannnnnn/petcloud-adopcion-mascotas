package com.example.adoptions_service.model;
import jakarta.persistence.*;

@Entity
public class Perfil {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    

    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
}