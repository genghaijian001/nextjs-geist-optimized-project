package com.school.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@Entity
@Table(name = "voucher_entries")
public class VoucherEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Column(length = 500)
    private String summary;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "debit_amount", precision = 18, scale = 2)
    private BigDecimal debitAmount;

    @Column(name = "credit_amount", precision = 18, scale = 2)
    private BigDecimal creditAmount;
}
