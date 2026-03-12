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
        // Vérification si la table est vide ou si l'admin n'existe pas encore
        if (!userRepository.existsByEmail("admin@covoiturage.ma")) {
            User admin = User.builder()
                    .nom("Super Admin")
                    .email("admin@covoiturage.ma")
                    .password(passwordEncoder.encode("admin123"))
                    .telephone("0600000000")
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
            System.out.println("Compte Administrateur par défaut créé. (admin@covoiturage.ma / admin123)");
        }
    }
}
