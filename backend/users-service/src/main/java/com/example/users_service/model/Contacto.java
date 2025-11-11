package com.example.users_service.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class Contacto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ownerPerfilId;
    private Long contactoPerfilId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaUnion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerPerfilId() { return ownerPerfilId; }
    public void setOwnerPerfilId(Long ownerPerfilId) { this.ownerPerfilId = ownerPerfilId; }

    public Long getContactoPerfilId() { return contactoPerfilId; }
    public void setContactoPerfilId(Long contactoPerfilId) { this.contactoPerfilId = contactoPerfilId; }

    public Date getFechaUnion() { return fechaUnion; }
    public void setFechaUnion(Date fechaUnion) { this.fechaUnion = fechaUnion; }
}
