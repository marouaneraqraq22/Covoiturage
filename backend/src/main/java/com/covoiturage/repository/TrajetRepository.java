package com.covoiturage.repository;

import com.covoiturage.model.Trajet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TrajetRepository extends JpaRepository<Trajet, Long> {
    List<Trajet> findByVilleDepartAndVilleArriveeAndDateDepart(String villeDepart, String villeArrivee, LocalDate dateDepart);
}
