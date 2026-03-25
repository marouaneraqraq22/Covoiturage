package com.covoiturage.controller;

import com.covoiturage.model.Trajet;
import com.covoiturage.model.TypeTrajet;
import com.covoiturage.model.User;
import com.covoiturage.model.Reservation;
import com.covoiturage.repository.TrajetRepository;
import com.covoiturage.repository.UserRepository;
import com.covoiturage.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trajets")
@RequiredArgsConstructor
public class TrajetController {

    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Trajet>> searchTrajets(
            @RequestParam TypeTrajet type,
            @RequestParam String depart,
            @RequestParam String arrivee,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        return ResponseEntity.ok(trajetRepository.findByTypeTrajetAndVilleDepartAndVilleArriveeAndDateDepart(type, depart, arrivee, date));
    }

    @PostMapping
    public ResponseEntity<Trajet> addTrajet(@RequestBody Trajet trajet) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        
        trajet.setConducteur(currentUser);
        return ResponseEntity.ok(trajetRepository.save(trajet));
    }

    @GetMapping
    public ResponseEntity<List<Trajet>> getAllTrajets() {
        return ResponseEntity.ok(trajetRepository.findAll());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Trajet>> getMyTrajets() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(trajetRepository.findByConducteur(currentUser));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteTrajet(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            Trajet trajet = trajetRepository.findById(id).orElse(null);
            if (trajet == null) {
                return ResponseEntity.badRequest().body("Le trajet est introuvable ou a déjà été supprimé.");
            }
            
            if (!trajet.getConducteur().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body("Non autorisé");
            }
            
            // Suppression en cascade manuelle des réservations liées au trajet
            List<Reservation> reservations = reservationRepository.findByTrajetId(id);
            if (!reservations.isEmpty()) {
                reservationRepository.deleteAll(reservations);
            }
            
            trajetRepository.delete(trajet);
            return ResponseEntity.ok("Trajet supprimé avec succès.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur 500: " + e.getMessage());
        }
    }
}
