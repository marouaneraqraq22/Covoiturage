package com.covoiturage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String nom;
    private String email;
    private String password;
    private String telephone;
    private String cin;
    // Par défaut, tous les inscrits sont des PASSAGER, on peut permettre de spécifier CONDUCTEUR
    private String role; 
}
