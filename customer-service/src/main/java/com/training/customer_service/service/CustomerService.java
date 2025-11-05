package com.training.customer_service.service;

import com.training.customer_service.clients.InventoryServiceProxy;
import com.training.customer_service.dtos.*;
import com.training.customer_service.entities.Customer;
import com.training.customer_service.entities.FiberDropLine;
import com.training.customer_service.enums.CustomerStatus;
import com.training.customer_service.enums.FiberStatus;
import com.training.customer_service.exceptions.CustomerActionException;
import com.training.customer_service.exceptions.CustomerNotFoundException;
import com.training.customer_service.exceptions.InvalidPortAssignmentException;
import com.training.customer_service.exceptions.InventoryServiceException;
import com.training.customer_service.repositories.CustomerRepository;
import com.training.customer_service.repositories.CustomerSpecification;
import com.training.customer_service.repositories.FiberDropLineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FiberDropLineRepository fiberDropLineRepository;

    @Autowired
    private InventoryServiceProxy inventoryServiceProxy;

    @Transactional
    public void updateCustomerStatus(Long id, String status) {
        logger.info("Attempting to update status for customer ID {} to {}", id, status);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + id + " not found."));

        CustomerStatus newStatus = CustomerStatus.valueOf(status.toUpperCase());
        CustomerStatus oldStatus = customer.getStatus();

        // Add validation block for activation
        if (newStatus == CustomerStatus.ACTIVE) {
            if (customer.getSplitterId() == null) {
                throw new CustomerActionException("Customer cannot be activated without being assigned to a splitter port.");
            }
            if (fiberDropLineRepository.findByCustomerId(id).isEmpty()) {
                throw new CustomerActionException("Customer cannot be activated without a corresponding Fiber Drop Line entry.");
            }
        }

        // Deactivation logic
        if (oldStatus == CustomerStatus.ACTIVE && newStatus == CustomerStatus.INACTIVE) {
            logger.info("Deactivation workflow triggered for customer ID {}.", id);

            if (customer.getSplitterId() != null) {
                try {
                    logger.info("Decrementing used ports for splitter ID {}.", customer.getSplitterId());
                    SplitterDto splitter = inventoryServiceProxy.getSplitterDetails(customer.getSplitterId());
                    if (splitter.getUsedPorts() > 0) {
                        SplitterUpdateRequest updateRequest = new SplitterUpdateRequest();
                        updateRequest.setUsedPorts(splitter.getUsedPorts() - 1);
                        inventoryServiceProxy.updateSplitterUsedPorts(splitter.getId(), updateRequest);
                        logger.info("Successfully decremented used ports for splitter ID {}.", customer.getSplitterId());
                    }
                } catch (Exception e) {
                    logger.error("Failed to decrement splitter used ports for splitter ID {}: {}", customer.getSplitterId(), e.getMessage());
                }
            }

            logger.info("Nullifying port assignment for customer ID {}.", id);
            customer.setSplitterId(null);
            customer.setSplitterSerialNumber(null);
            customer.setAssignedPort(null);

            fiberDropLineRepository.findByCustomerId(id).ifPresent(line -> {
                logger.info("Setting FiberDropLine status to DISCONNECTED for customer ID {}.", id);
                line.setStatus(FiberStatus.DISCONNECTED);
                fiberDropLineRepository.save(line);
            });
        }

        customer.setStatus(newStatus);
        logger.info("Saving final state for customer ID {}. Status: {}, Splitter ID: {}.", id, customer.getStatus(), customer.getSplitterId());
        customerRepository.save(customer);
    }

    // ... (other existing methods) ...
    @Transactional
    public void deleteInactiveCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + id + " not found."));

        if (customer.getStatus() != CustomerStatus.INACTIVE) {
            throw new CustomerActionException("Cannot delete customer. Status must be INACTIVE before deletion.");
        }

        fiberDropLineRepository.findByCustomerId(id).ifPresent(line -> {
            logger.info("Deleting FiberDropLine for customer ID {}.", id);
            fiberDropLineRepository.delete(line);
        });

        logger.info("Deleting INACTIVE customer with ID {}.", id);
        customerRepository.delete(customer);
    }

    @Transactional
    public CustomerResponse reassignSplitterPort(Long customerId, CustomerAssignmentRequest assignment) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with ID: " + customerId));

        Long oldSplitterId = customer.getSplitterId();
        AssetResponse newSplitterAsset = inventoryServiceProxy.getAssetBySerial(assignment.splitterSerialNumber());

        // 1. Decrement old splitter port count
        if (oldSplitterId != null) {
            try {
                SplitterDto oldSplitter = inventoryServiceProxy.getSplitterDetails(oldSplitterId);
                if (oldSplitter.getUsedPorts() > 0) {
                    SplitterUpdateRequest updateRequest = new SplitterUpdateRequest();
                    updateRequest.setUsedPorts(oldSplitter.getUsedPorts() - 1);
                    inventoryServiceProxy.updateSplitterUsedPorts(oldSplitterId, updateRequest);
                }
            } catch (Exception e) {
                logger.error("Could not decrement port count for old splitter ID {}: {}", oldSplitterId, e.getMessage());
            }
        }

        // 2. Increment new splitter port count
        try {
            SplitterDto newSplitter = inventoryServiceProxy.getSplitterDetails(newSplitterAsset.getId());
            if (newSplitter.getUsedPorts() >= newSplitter.getPortCapacity()) {
                throw new InvalidPortAssignmentException("New splitter " + newSplitter.getSerialNumber() + " is at full capacity.");
            }
            SplitterUpdateRequest updateRequest = new SplitterUpdateRequest();
            updateRequest.setUsedPorts(newSplitter.getUsedPorts() + 1);
            inventoryServiceProxy.updateSplitterUsedPorts(newSplitter.getId(), updateRequest);
        } catch (Exception e) {
            throw new InventoryServiceException("Failed to update new splitter used ports: " + e.getMessage());
        }

        // 3. Update customer's assignment
        customer.setSplitterId(newSplitterAsset.getId());
        customer.setSplitterSerialNumber(assignment.splitterSerialNumber());
        customer.setAssignedPort(assignment.portNumber());
        Customer updatedCustomer = customerRepository.save(customer);

        // 4. Update FiberDropLine
        FiberDropLine fiberLine = fiberDropLineRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new InventoryServiceException("FiberDropLine not found for customer: " + customerId));
        fiberLine.setFromSplitterId(newSplitterAsset.getId());
        fiberDropLineRepository.save(fiberLine);

        return mapToCustomerResponse(updatedCustomer, inventoryServiceProxy.getAssetsByCustomerId(customerId));
    }

    @Transactional
    public CustomerResponse assignSplitterPort(Long customerId, CustomerAssignmentRequest assignment) {
        logger.info("Assigning new port for customer ID: {}", customerId);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with ID: " + customerId));

        if (customer.getSplitterId() != null) {
            throw new CustomerActionException("Customer is already assigned to a port. Use the re-assign endpoint to move them.");
        }

        AssetResponse splitterAsset = inventoryServiceProxy.getAssetBySerial(assignment.splitterSerialNumber());

        // Increment new splitter port count
        try {
            SplitterDto splitter = inventoryServiceProxy.getSplitterDetails(splitterAsset.getId());
            if (splitter.getUsedPorts() >= splitter.getPortCapacity()) {
                throw new InvalidPortAssignmentException("Splitter " + splitter.getSerialNumber() + " is at full capacity.");
            }
            SplitterUpdateRequest updateRequest = new SplitterUpdateRequest();
            updateRequest.setUsedPorts(splitter.getUsedPorts() + 1);
            inventoryServiceProxy.updateSplitterUsedPorts(splitter.getId(), updateRequest);
        } catch (Exception e) {
            throw new InventoryServiceException("Failed to update splitter used ports: " + e.getMessage());
        }

        // Update customer's assignment
        customer.setSplitterId(splitterAsset.getId());
        customer.setSplitterSerialNumber(assignment.splitterSerialNumber());
        customer.setAssignedPort(assignment.portNumber());
        // customer.setStatus(CustomerStatus.ACTIVE); // This line is now removed
        Customer updatedCustomer = customerRepository.save(customer);

        // Create FiberDropLine
        FiberDropLine fiberLine = new FiberDropLine();
        fiberLine.setCustomerId(customerId);
        fiberLine.setFromSplitterId(splitterAsset.getId());
        fiberLine.setLengthMeters(assignment.lengthMeters());
        fiberLine.setStatus(FiberStatus.ACTIVE);
        fiberDropLineRepository.save(fiberLine);

        return mapToCustomerResponse(updatedCustomer, inventoryServiceProxy.getAssetsByCustomerId(customerId));
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customer -> mapToCustomerResponse(customer, inventoryServiceProxy.getAssetsByCustomerId(customer.getId())))
                .collect(Collectors.toList());
    }

    public List<FiberDropLine> getFiberDropLinesBySplitter(Long splitterId) {
        return fiberDropLineRepository.findByFromSplitterId(splitterId);
    }

    public List<FiberDropLineResponse> getAllFiberDropLines() {
        return fiberDropLineRepository.findAll().stream()
                .map(this::toFiberDropLineResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssetResponse assignAssetToCustomer(Long customerId, String assetSerialNumber) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException("Customer with ID " + customerId + " not found.");
        }
        return inventoryServiceProxy.assignAssetToCustomer(assetSerialNumber, customerId);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerCreateRequest request) {
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setAddress(request.getAddress());
        customer.setNeighborhood(request.getNeighborhood());
        customer.setPlan(request.getPlan());
        customer.setConnectionType(request.getConnectionType());
        customer.setStatus(CustomerStatus.PENDING);

        Customer savedCustomer = customerRepository.save(customer);
        return mapToCustomerResponse(savedCustomer, Collections.emptyList());
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + id + " not found."));

        List<AssetResponse> assignedAssets = inventoryServiceProxy.getAssetsByCustomerId(id);

        return mapToCustomerResponse(customer, assignedAssets);
    }

    @Transactional
    public CustomerResponse updateCustomerProfile(Long id, CustomerCreateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + id + " not found."));

        customer.setName(request.getName());
        customer.setAddress(request.getAddress());
        customer.setNeighborhood(request.getNeighborhood());
        customer.setPlan(request.getPlan());
        customer.setConnectionType(request.getConnectionType());

        Customer updatedCustomer = customerRepository.save(customer);
        return mapToCustomerResponse(updatedCustomer, Collections.emptyList());
    }

    public List<CustomerResponse> searchCustomers(String neighborhood, CustomerStatus status, String address, String name) {
        Specification<Customer> spec = CustomerSpecification.isAnything();

        if (name != null && !name.isBlank()) {
            spec = spec.and(CustomerSpecification.hasName(name));
        }
        if (address != null && !address.isBlank()) {
            spec = spec.and(CustomerSpecification.hasAddress(address));
        }
        if (neighborhood != null && !neighborhood.isBlank()) {
            spec = spec.and(CustomerSpecification.hasNeighborhood(neighborhood));
        }
        if (status != null) {
            spec = spec.and(CustomerSpecification.hasStatus(status));
        }

        List<Customer> customers = customerRepository.findAll(spec);
        return customers.stream()
                .map(c -> mapToCustomerResponse(c, Collections.emptyList()))
                .collect(Collectors.toList());
    }

    public CustomerAssignmentDto getCustomerAssignment(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + id + " not found."));
        return toCustomerAssignmentDto(customer);
    }

    public List<CustomerAssignmentDto> getCustomersBySplitter(Long splitterId) {
        return customerRepository.findBySplitterIdAndStatus(splitterId, CustomerStatus.ACTIVE).stream()
                .map(this::toCustomerAssignmentDto)
                .collect(Collectors.toList());
    }

    private FiberDropLineResponse toFiberDropLineResponse(FiberDropLine line) {
        FiberDropLineResponse dto = new FiberDropLineResponse();
        dto.setId(line.getId());
        dto.setCustomerId(line.getCustomerId());
        dto.setFromSplitterId(line.getFromSplitterId());
        if (line.getLengthMeters() != null) {
            dto.setLengthMeters(line.getLengthMeters().doubleValue());
        }
        dto.setStatus(line.getStatus());
        return dto;
    }

    private CustomerAssignmentDto toCustomerAssignmentDto(Customer customer) {
        CustomerAssignmentDto dto = new CustomerAssignmentDto();
        dto.setCustomerId(customer.getId());
        dto.setName(customer.getName());
        dto.setSplitterId(customer.getSplitterId());
        if (customer.getAssignedPort() != null) {
            dto.setAssignedPort(customer.getAssignedPort());
        }
        dto.setStatus(customer.getStatus().name());

        List<AssetResponse> assets = inventoryServiceProxy.getAssetsByCustomerId(customer.getId());
        List<AssetDetailDto> assetDetails = assets.stream().map(asset -> {
            AssetDetailDto detailDto = new AssetDetailDto();
            detailDto.setAssetType(asset.getAssetType());
            detailDto.setSerialNumber(asset.getSerialNumber());
            detailDto.setModel(asset.getModel());
            return detailDto;
        }).collect(Collectors.toList());
        dto.setAssignedAssets(assetDetails);

        return dto;
    }

    private CustomerResponse mapToCustomerResponse(Customer customer, List<AssetResponse> assignedAssets) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setName(customer.getName());
        response.setAddress(customer.getAddress());
        response.setNeighborhood(customer.getNeighborhood());
        response.setPlan(customer.getPlan());
        response.setConnectionType(customer.getConnectionType());
        response.setStatus(customer.getStatus());
        response.setSplitterSerialNumber(customer.getSplitterSerialNumber());
        response.setSplitterId(customer.getSplitterId());
        response.setAssignedPort(customer.getAssignedPort());
        response.setCreatedAt(customer.getCreatedAt());
        response.setAssignedAssets(assignedAssets);
        return response;
    }
}
