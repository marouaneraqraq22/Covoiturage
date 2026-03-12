package com.covoiturage.controller;

import com.covoiturage.model.Trajet;
import com.covoiturage.model.User;
import com.covoiturage.repository.TrajetRepository;
import com.covoiturage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trajets")
@RequiredArgsConstructor
public class TrajetController {

    private final TrajetRepository trajetRepository;
    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Trajet>> searchTrajets(
            @RequestParam String depart,
            @RequestParam String arrivee,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        return ResponseEntity.ok(trajetRepository.findByVilleDepartAndVilleArriveeAndDateDepart(depart, arrivee, date));
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
}
