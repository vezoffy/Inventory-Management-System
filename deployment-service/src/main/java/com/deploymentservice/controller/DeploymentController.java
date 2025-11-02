package com.deploymentservice.controller;

import com.deploymentservice.dto.DeactivationRequest;
import com.deploymentservice.dto.TaskCreationRequest;
import com.deploymentservice.dto.TaskUpdateRequest;
import com.deploymentservice.dto.TechnicianCreationRequest;
import com.deploymentservice.entity.AuditLog;
import com.deploymentservice.entity.DeploymentTask;
import com.deploymentservice.entity.Technician;
import com.deploymentservice.repository.AuditLogRepository;
import com.deploymentservice.service.AuditLogService;
import com.deploymentservice.service.DeploymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

@RestController
@RequestMapping("/api/deployments")
public class DeploymentController {

    @Autowired
    private DeploymentService deploymentService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private Mono<String> getAuthenticatedUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> ctx.getAuthentication().getPrincipal().toString());
    }

    @PostMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<Technician>> createTechnician(@RequestBody TechnicianCreationRequest request) {
        return getAuthenticatedUserId()
                .flatMap(adminUserId -> deploymentService.createTechnician(request, adminUserId))
                .map(createdTechnician -> new ResponseEntity<>(createdTechnician, HttpStatus.CREATED));
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLANNER')")
    public Mono<ResponseEntity<DeploymentTask>> createTask(@RequestBody TaskCreationRequest request) {
        return getAuthenticatedUserId()
                .flatMap(userId -> deploymentService.createTask(request, userId))
                .map(task -> new ResponseEntity<>(task, HttpStatus.CREATED));
    }

    @GetMapping("/tasks/technician/{techId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public Flux<DeploymentTask> getTasksByTechnician(@PathVariable Long techId) {
        return deploymentService.getTasksByTechnician(techId);
    }

    @PatchMapping("/tasks/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public Mono<ResponseEntity<DeploymentTask>> completeInstallation(@PathVariable Long id, @RequestBody TaskUpdateRequest request) {
        return getAuthenticatedUserId()
                .flatMap(userId -> deploymentService.completeInstallation(id, request.getNotes(), userId))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/workflow/deactivate/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_AGENT')")
    public Mono<ResponseEntity<Void>> deactivateCustomerWorkflow(@PathVariable Long customerId, @RequestBody DeactivationRequest request) {
        return getAuthenticatedUserId()
                .flatMap(userId -> deploymentService.deactivateCustomerWorkflow(customerId, request.getReason(), userId))
                .then(Mono.just(new ResponseEntity<Void>(HttpStatus.OK)))
                .defaultIfEmpty(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/audit/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<AuditLog> getFilteredAuditLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) Instant startTime,
            @RequestParam(required = false) Instant endTime) {
        return Flux.fromIterable(auditLogService.getFilteredAuditLogs(userId, actionType, startTime, endTime));
    }
}
