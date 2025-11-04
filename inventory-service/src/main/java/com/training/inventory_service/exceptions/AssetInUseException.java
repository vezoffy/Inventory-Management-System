package com.training.inventory_service.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class AssetInUseException extends RuntimeException {
    public AssetInUseException(String message) {
        super(message);
    }
}
