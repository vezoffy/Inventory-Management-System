package com.deploymentservice.repository;

import com.deploymentservice.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdAndActionTypeAndTimestampBetween(String userId, String actionType, Instant startTime, Instant endTime);
    List<AuditLog> findByUserIdAndTimestampBetween(String userId, Instant startTime, Instant endTime);
    List<AuditLog> findByActionTypeAndTimestampBetween(String actionType, Instant startTime, Instant endTime);
    List<AuditLog> findByTimestampBetween(Instant startTime, Instant endTime);
    List<AuditLog> findByUserId(String userId);
    List<AuditLog> findByActionType(String actionType);
}
