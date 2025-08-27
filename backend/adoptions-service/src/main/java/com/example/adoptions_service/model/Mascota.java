package com.example.adoptions_service.model;
import jakarta.persistence.*;



@Entity
@Table(name = "mascota")
public class Mascota {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    public Mascota() {}
    
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
}
