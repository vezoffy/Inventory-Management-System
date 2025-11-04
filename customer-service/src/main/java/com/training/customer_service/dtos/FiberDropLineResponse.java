package com.training.customer_service.dtos;

import com.training.customer_service.enums.FiberStatus;

public class FiberDropLineResponse {

    private Long id;
    private Long customerId;
    private Long fromSplitterId;
    private Double lengthMeters;
    private FiberStatus status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getFromSplitterId() {
        return fromSplitterId;
    }

    public void setFromSplitterId(Long fromSplitterId) {
        this.fromSplitterId = fromSplitterId;
    }

    public Double getLengthMeters() {
        return lengthMeters;
    }

    public void setLengthMeters(Double lengthMeters) {
        this.lengthMeters = lengthMeters;
    }

    public FiberStatus getStatus() {
        return status;
    }

    public void setStatus(FiberStatus status) {
        this.status = status;
    }
}