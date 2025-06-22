package com.school.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String name;

    @Column(length = 100, unique = true)
    private String sku;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(length = 20)
    private String unit;

    @Column(length = 255)
    private String specifications;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "warning_stock", precision = 10, scale = 2)
    private Double warningStock;
}
