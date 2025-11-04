package com.training.customer_service.dto;

import com.training.customer_service.enums.FiberStatus;
import lombok.Data;

@Data
public class FiberDropLineResponse {
    private Long id;
    private Long customerId;
    private Long fromSplitterId;
    private Double lengthMeters;
    private FiberStatus status;
}
