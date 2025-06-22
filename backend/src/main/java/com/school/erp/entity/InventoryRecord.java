package com.school.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "inventory_records")
public class InventoryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "record_type", length = 20)
    private String recordType;

    @Column(name = "product_id")
    private Long productId;

    @Column(precision = 10, scale = 2)
    private Double quantity;

    @Column(precision = 18, scale = 2)
    private Double price;

    @Column(name = "operator_id")
    private Long operatorId;

    @Column(name = "record_time")
    private LocalDateTime recordTime;

    @Column(name = "related_order_id", length = 50)
    private String relatedOrderId;
}
