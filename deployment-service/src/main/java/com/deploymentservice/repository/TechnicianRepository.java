package com.deploymentservice.repository;

import com.deploymentservice.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    List<Technician> findByRegionContainingIgnoreCase(String region); // New method for filtering
}
