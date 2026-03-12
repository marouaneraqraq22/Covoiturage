package com.covoiturage.controller;

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

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;

    @PostMapping("/trajet/{trajetId}")
    @Transactional
    public ResponseEntity<?> reserverTrajet(@PathVariable Long trajetId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User passager = userRepository.findByEmail(auth.getName()).orElseThrow();

        Trajet trajet = trajetRepository.findById(trajetId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (trajet.getPlacesDisponibles() <= 0) {
            return ResponseEntity.badRequest().body("Plus de places disponibles");
        }

        // Décrémente le nombre de places
        trajet.setPlacesDisponibles(trajet.getPlacesDisponibles() - 1);
        trajetRepository.save(trajet);

        Reservation reservation = Reservation.builder()
                .passager(passager)
                .trajet(trajet)
                .statut(ReservationStatus.PENDING) // Ou CONFIRMED direct selon la logique métier souhaitée
                .build();

        return ResponseEntity.ok(reservationRepository.save(reservation));
    }

    @GetMapping("/mes-reservations")
    public ResponseEntity<List<Reservation>> getMesReservations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(reservationRepository.findByPassagerId(currentUser.getId()));
    }
}
