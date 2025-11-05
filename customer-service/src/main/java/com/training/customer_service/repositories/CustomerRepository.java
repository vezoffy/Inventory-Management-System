package com.training.customer_service.repositories;

import com.training.customer_service.entities.Customer;
import com.training.customer_service.enums.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> { // Added JpaSpecificationExecutor
    // The old methods are no longer needed as Specification handles them
    List<Customer> findBySplitterIdAndStatus(Long splitterId, CustomerStatus status);
}
