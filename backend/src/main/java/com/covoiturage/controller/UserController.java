package com.covoiturage.controller;

import com.covoiturage.model.User;
import com.covoiturage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.covoiturage.security.JwtService;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal, Authentication authentication) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = principal.getName();
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Principal principal, @RequestBody User updatedUser) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        User currentUser = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
        // Vérification de conflit d'email
        if (!currentUser.getEmail().equals(updatedUser.getEmail()) && 
            userRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Cet email est déjà utilisé par un autre compte.");
        }
        
        boolean emailChanged = !currentUser.getEmail().equals(updatedUser.getEmail());
        
        currentUser.setNom(updatedUser.getNom());
        currentUser.setEmail(updatedUser.getEmail());
        currentUser.setTelephone(updatedUser.getTelephone());
        
        userRepository.save(currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("user", currentUser); // les données mises à jour
        
        if (emailChanged) {
            String newToken = jwtService.generateToken(currentUser);
            response.put("token", newToken);
        }
        
        return ResponseEntity.ok(response);
    }
}
