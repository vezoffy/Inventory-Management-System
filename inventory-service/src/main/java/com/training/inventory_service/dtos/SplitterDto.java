package com.training.inventory_service.dtos;

import lombok.Data;

@Data
public class SplitterDto {
    private Long id;
    private Long fdhId;
    private int portCapacity;
    private int usedPorts;
    private String serialNumber;
    private String neighborhood;
    private String model; // Added model field
}
