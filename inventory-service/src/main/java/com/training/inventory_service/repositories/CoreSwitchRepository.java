package com.training.inventory_service.repositories;

import com.training.inventory_service.entities.CoreSwitch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoreSwitchRepository extends JpaRepository<CoreSwitch, Long> {
    List<CoreSwitch> findAllByHeadendId(Long headendId);
    boolean existsByHeadendId(Long headendId);
    Optional<CoreSwitch> findByAssetId(Long assetId);
    void deleteByAssetId(Long assetId);
}
