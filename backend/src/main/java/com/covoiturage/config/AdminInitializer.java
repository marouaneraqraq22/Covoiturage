package com.covoiturage.config;

import com.covoiturage.model.Role;
import com.covoiturage.model.User;
import com.covoiturage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Forcer la création ou la réinitialisation de l'administrateur
        User admin = userRepository.findByEmail("admin@covoiturage.ma").orElse(null);
        
        if (admin == null) {
            admin = User.builder()
                    .nom("Super Admin")
                    .email("admin@covoiturage.ma")
                    .password(passwordEncoder.encode("admin123"))
                    .telephone("0600000000")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Compte Administrateur par défaut créé. (admin@covoiturage.ma / admin123)");
        } else {
            // L'administrateur existe déjà, on force la réinitialisation de son mot de passe
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Mot de passe de l'administrateur (admin@covoiturage.ma) RÉINITIALISÉ à 'admin123'.");
        }
    }
}
