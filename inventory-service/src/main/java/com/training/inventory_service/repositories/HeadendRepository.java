package com.training.inventory_service.repositories;

import com.training.inventory_service.entities.Headend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HeadendRepository extends JpaRepository<Headend, Long> {
    Optional<Headend> findByAssetId(Long assetId);
    void deleteByAssetId(Long assetId);
}
