package com.training.customer_service.repositories;


import com.training.customer_service.entities.Customer;
import com.training.customer_service.enums.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByNeighborhoodAndStatus(String neighborhood, CustomerStatus status);
    List<Customer> findByAddressContaining(String address);
    List<Customer> findBySplitterIdAndStatus(Long splitterId, CustomerStatus status); // Modified method
    List<Customer> findByNameContainingIgnoreCase(String name);
}
