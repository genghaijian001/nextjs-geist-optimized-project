package com.school.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voucher_word", length = 10)
    private String voucherWord;

    @Column(name = "voucher_number")
    private Integer voucherNumber;

    @Column(name = "period", length = 7)
    private String period;

    @Column(name = "voucher_date")
    private LocalDate voucherDate;

    @Column(name = "total_debit", precision = 18, scale = 2)
    private BigDecimal totalDebit;

    @Column(name = "total_credit", precision = 18, scale = 2)
    private BigDecimal totalCredit;

    @Column(name = "creator_id")
    private Long creatorId;

    @Column(name = "auditor_id")
    private Long auditorId;

    @Column(name = "status")
    private Integer status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VoucherEntry> entries;
}
