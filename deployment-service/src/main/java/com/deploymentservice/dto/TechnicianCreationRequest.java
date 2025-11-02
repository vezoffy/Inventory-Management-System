package com.deploymentservice.dto;

import lombok.Data;

@Data
public class TechnicianCreationRequest {
    private String name;
    private String contact;
    private String region;
    private String username;
    private String password;
}
