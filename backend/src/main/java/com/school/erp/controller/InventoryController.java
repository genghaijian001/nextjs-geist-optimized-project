package com.school.erp.controller;

import com.school.erp.entity.Inventory;
import com.school.erp.entity.InventoryRecord;
import com.school.erp.repository.InventoryRecordRepository;
import com.school.erp.repository.InventoryRepository;
import com.school.erp.repository.ProductRepository;
import com.school.erp.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryRecordRepository inventoryRecordRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @PostMapping("/inbound")
    public ResponseEntity<String> addInboundInventory(@RequestBody InboundRequest request) {
        // For simplicity, just create inventory records and update inventory quantity
        for (InboundItem item : request.getItems()) {
            InventoryRecord record = new InventoryRecord();
            record.setRecordType("inbound");
            record.setProductId(item.getProductId());
            record.setQuantity(item.getQuantity());
            record.setPrice(item.getPrice());
            record.setOperatorId(request.getOperatorId());
            record.setRecordTime(LocalDateTime.now());
            record.setRelatedOrderId(request.getOrderId());
            inventoryRecordRepository.save(record);

            // Update inventory quantity
            List<Inventory> inventories = inventoryRepository.findAll();
            Inventory inventory = inventories.stream()
                    .filter(inv -> inv.getProductId().equals(item.getProductId()) && inv.getWarehouseId().equals(request.getWarehouseId()))
                    .findFirst()
                    .orElse(null);
            if (inventory == null) {
                inventory = new Inventory();
                inventory.setProductId(item.getProductId());
                inventory.setWarehouseId(request.getWarehouseId());
                inventory.setQuantity(item.getQuantity());
                inventory.setAverageCost(item.getPrice());
            } else {
                double totalCost = inventory.getAverageCost() * inventory.getQuantity() + item.getPrice() * item.getQuantity();
                double totalQuantity = inventory.getQuantity() + item.getQuantity();
                inventory.setQuantity(totalQuantity);
                inventory.setAverageCost(totalCost / totalQuantity);
            }
            inventory.setLastUpdatedAt(LocalDateTime.now());
            inventoryRepository.save(inventory);
        }
        return ResponseEntity.status(201).body("Inbound inventory added successfully");
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> listInventory() {
        List<Inventory> inventories = inventoryRepository.findAll();
        return ResponseEntity.ok(inventories);
    }

    // DTO classes for request
    public static class InboundRequest {
        private Long warehouseId;
        private Long operatorId;
        private String orderId;
        private List<InboundItem> items;

        // getters and setters
        public Long getWarehouseId() { return warehouseId; }
        public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
        public Long getOperatorId() { return operatorId; }
        public void setOperatorId(Long operatorId) { this.operatorId = operatorId; }
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public List<InboundItem> getItems() { return items; }
        public void setItems(List<InboundItem> items) { this.items = items; }
    }

    public static class InboundItem {
        private Long productId;
        private Double quantity;
        private Double price;

        // getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Double getQuantity() { return quantity; }
        public void setQuantity(Double quantity) { this.quantity = quantity; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
    }
}
