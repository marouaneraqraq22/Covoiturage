package com.covoiturage.controller;

import com.covoiturage.model.User;
import com.covoiturage.model.Role;
import com.covoiturage.repository.TrajetRepository;
import com.covoiturage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final TrajetRepository trajetRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if(user.getRole() == Role.ADMIN) {
             return ResponseEntity.badRequest().body("Impossible de supprimer un administrateur");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/trajets/{id}")
    public ResponseEntity<?> deleteTrajet(@PathVariable Long id) {
        trajetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
