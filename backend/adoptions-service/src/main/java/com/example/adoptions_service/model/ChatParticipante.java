package com.example.adoptions_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class ChatParticipante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long chatId;
    private Long perfilId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaUnion;
}
