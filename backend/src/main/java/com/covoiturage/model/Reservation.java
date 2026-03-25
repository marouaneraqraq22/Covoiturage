package com.covoiturage.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant une réservation effectuée par un passager pour un trajet.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "passager_id", nullable = false)
    private User passager;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trajet_id", nullable = false)
    private Trajet trajet;

    @Enumerated(EnumType.STRING)
    private ReservationStatus statut;
}
