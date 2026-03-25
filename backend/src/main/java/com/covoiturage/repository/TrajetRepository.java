package com.covoiturage.repository;

import com.covoiturage.model.Trajet;
import com.covoiturage.model.TypeTrajet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import com.covoiturage.model.User;

@Repository
public interface TrajetRepository extends JpaRepository<Trajet, Long> {
    List<Trajet> findByTypeTrajetAndVilleDepartAndVilleArriveeAndDateDepart(TypeTrajet typeTrajet, String villeDepart, String villeArrivee, LocalDate dateDepart);
    List<Trajet> findByConducteur(User conducteur);
}
