package com.school.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(precision = 10, scale = 2)
    private Double quantity;

    @Column(name = "average_cost", precision = 18, scale = 4)
    private Double averageCost;

    @Column(name = "last_updated_at")
    private java.time.LocalDateTime lastUpdatedAt;
}
