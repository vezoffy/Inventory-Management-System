package com.training.customer_service.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CustomerActionException extends RuntimeException {
    public CustomerActionException(String message) {
        super(message);
    }
}
