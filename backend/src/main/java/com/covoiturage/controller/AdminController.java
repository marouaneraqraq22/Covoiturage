package com.covoiturage.controller;

import com.covoiturage.model.User;
import com.covoiturage.model.Role;
import com.covoiturage.repository.TrajetRepository;
import com.covoiturage.repository.UserRepository;
import com.covoiturage.model.Reservation;
import com.covoiturage.model.Trajet;
import com.covoiturage.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final TrajetRepository trajetRepository;
    private final ReservationRepository reservationRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if(user.getRole() == Role.ADMIN) {
             return ResponseEntity.badRequest().body("Impossible de supprimer un administrateur");
        }

        // Nettoyer les réservations du passager
        List<Reservation> userReservations = reservationRepository.findByPassagerId(id);
        if (!userReservations.isEmpty()) {
            reservationRepository.deleteAll(userReservations);
        }

        // Nettoyer les trajets du conducteur ET les réservations associées à ces trajets
        List<Trajet> userTrips = trajetRepository.findByConducteur(user);
        for (Trajet t : userTrips) {
            List<Reservation> tripReservations = reservationRepository.findByTrajetId(t.getId());
            if (!tripReservations.isEmpty()) {
                reservationRepository.deleteAll(tripReservations);
            }
            trajetRepository.delete(t);
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/trajets/{id}")
    @Transactional
    public ResponseEntity<?> deleteTrajet(@PathVariable Long id) {
        Trajet trajet = trajetRepository.findById(id).orElse(null);
        if (trajet == null) return ResponseEntity.ok().build();

        List<Reservation> reservations = reservationRepository.findByTrajetId(id);
        if (!reservations.isEmpty()) {
            reservationRepository.deleteAll(reservations);
        }

        trajetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
