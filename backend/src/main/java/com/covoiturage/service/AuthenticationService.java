package com.covoiturage.service;

import com.covoiturage.dto.AuthenticationRequest;
import com.covoiturage.dto.AuthenticationResponse;
import com.covoiturage.dto.RegisterRequest;
import com.covoiturage.model.Role;
import com.covoiturage.model.User;
import com.covoiturage.repository.UserRepository;
import com.covoiturage.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        
        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        Role userRole = Role.PASSAGER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("CONDUCTEUR")) {
            userRole = Role.CONDUCTEUR;
        }

        var user = User.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telephone(request.getTelephone())
                .cin(request.getCin())
                .role(userRole)
                .build();
                
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .nom(user.getNom())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
                
        var jwtToken = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .nom(user.getNom())
                .build();
    }
}
