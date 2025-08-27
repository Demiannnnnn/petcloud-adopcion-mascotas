package com.example.users_service.service;



public class SistemaAutenticacion {

    private static SistemaAutenticacion instancia;

    private SistemaAutenticacion() {}

    public static SistemaAutenticacion getInstance() {
        if(instancia == null) instancia = new SistemaAutenticacion();
        return instancia;
    }


}