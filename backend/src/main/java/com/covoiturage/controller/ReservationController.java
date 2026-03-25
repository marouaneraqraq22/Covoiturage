package com.covoiturage.controller;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;

import com.covoiturage.model.Reservation;
import com.covoiturage.model.ReservationStatus;
import com.covoiturage.model.Trajet;
import com.covoiturage.model.User;
import com.covoiturage.repository.ReservationRepository;
import com.covoiturage.repository.TrajetRepository;
import com.covoiturage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void autoFixDatabaseConstraint() {
        try {
            jdbcTemplate.execute("ALTER TABLE reservation DROP CONSTRAINT IF EXISTS reservation_statut_check");
            System.out.println("\n✅ [AUTO-FIX] La contrainte PostgreSQL obsolète 'reservation_statut_check' a été supprimée avec succès !\n");
        } catch (Exception e) {
            System.out.println("\nℹ️ [AUTO-FIX] La contrainte check n'existe pas ou a déjà été supprimée.\n");
        }
    }

    @PostMapping("/trajet/{trajetId}")
    @Transactional
    public ResponseEntity<?> reserverTrajet(@PathVariable Long trajetId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User passager = userRepository.findByEmail(auth.getName()).orElseThrow();

        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (trajet.getConducteur().getId().equals(passager.getId())) {
            return ResponseEntity.badRequest().body("Vous ne pouvez pas réserver votre propre trajet");
        }

        boolean alreadyReserved = reservationRepository.existsByPassagerIdAndTrajetId(passager.getId(), trajetId);
        if (alreadyReserved) {
            return ResponseEntity.badRequest().body("Vous avez déjà réservé ce trajet.");
        }

        if (trajet.getPlacesDisponibles() <= 0) {
            return ResponseEntity.badRequest().body("Plus de places disponibles");
        }

        try {
            Reservation reservation = Reservation.builder()
                    .passager(passager)
                    .trajet(trajet)
                    .statut(ReservationStatus.PENDING) // Ou CONFIRMED direct selon la logique métier souhaitée
                    .build();

            return ResponseEntity.ok(reservationRepository.save(reservation));
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("EXCEPTION: " + e.getClass().getName());
            return ResponseEntity.status(500).body("Error 500 Debug: " + e.getClass().getName() + " - " + e.getMessage() + (e.getCause() != null ? " C: " + e.getCause().getMessage() : ""));
        }
    }

    @GetMapping("/mes-reservations")
    public ResponseEntity<List<Reservation>> getMesReservations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(reservationRepository.findByPassagerId(currentUser.getId()));
    }

    // --- Endpoints pour le CONDUCTEUR ---

    @GetMapping("/trajet/{trajetId}/demandes")
    public ResponseEntity<?> getDemandesPourTrajet(@PathVariable Long trajetId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();

        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (!trajet.getConducteur().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Non autorisé");
        }

        return ResponseEntity.ok(reservationRepository.findByTrajetId(trajetId));
    }

    @PutMapping("/{id}/accepter")
    public ResponseEntity<?> accepterReservation(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (!reservation.getTrajet().getConducteur().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Non autorisé");
        }

        if (reservation.getStatut() == ReservationStatus.CONFIRMED) {
            return ResponseEntity.badRequest().body("Réservation déjà acceptée");
        }

        Trajet trajet = reservation.getTrajet();
        if (trajet.getPlacesDisponibles() <= 0) {
            return ResponseEntity.badRequest().body("Le trajet est déjà complet");
        }

        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() - 1);
        trajetRepository.saveAndFlush(trajet);

        reservation.setStatut(ReservationStatus.CONFIRMED);
        reservationRepository.saveAndFlush(reservation);
        return ResponseEntity.ok("Réservation acceptée avec succès.");
    }

    @PutMapping("/{id}/refuser")
    @Transactional
    public ResponseEntity<?> refuserReservation(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (!reservation.getTrajet().getConducteur().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Non autorisé");
        }

        if (reservation.getStatut() == ReservationStatus.REJECTED) {
            return ResponseEntity.badRequest().body("Réservation déjà refusée");
        }

        try {
            reservation.setStatut(ReservationStatus.REJECTED);
            reservationRepository.saveAndFlush(reservation);
            return ResponseEntity.ok("Réservation refusée avec succès.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error 500 Debug: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }

    // --- Endpoints pour le PASSAGER ---

    @PutMapping("/{id}/annuler")
    @Transactional
    public ResponseEntity<?> annulerReservation(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (!reservation.getPassager().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Non autorisé");
        }

        if (reservation.getStatut() == ReservationStatus.CANCELED) {
            return ResponseEntity.badRequest().body("Réservation déjà annulée");
        }

        if (reservation.getStatut() == ReservationStatus.REJECTED) {
            return ResponseEntity.badRequest().body("Réservation refusée, annulation impossible");
        }

        Trajet trajet = reservation.getTrajet();
        LocalDateTime depart = LocalDateTime.of(trajet.getDateDepart(), trajet.getHeureDepart());
        if (LocalDateTime.now().plusHours(1).isAfter(depart)) {
            return ResponseEntity.badRequest().body("Impossible d'annuler moins d'une heure avant le départ");
        }

        if (reservation.getStatut() == ReservationStatus.CONFIRMED) {
            trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() + 1);
            trajetRepository.saveAndFlush(trajet);
        }

        reservation.setStatut(ReservationStatus.CANCELED);
        reservationRepository.saveAndFlush(reservation);
        return ResponseEntity.ok("Réservation annulée avec succès");
    }
}
