package com.covoiturage.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entité représentant une annonce de trajet proposée par un conducteur.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_trajet")
    private TypeTrajet typeTrajet = TypeTrajet.VILLE_A_VILLE;

    @Column(nullable = false)
    private String villeDepart;

    @Column(nullable = false)
    private String villeArrivee;

    @Column(nullable = false)
    private LocalDate dateDepart;

    @Column(nullable = false)
    private LocalTime heureDepart;

    private int placesDisponibles;

    private double prix;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "conducteur_id", nullable = false)
    private User conducteur;
}
