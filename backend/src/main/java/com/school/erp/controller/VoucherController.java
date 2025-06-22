package com.school.erp.controller;

import com.school.erp.entity.Voucher;
import com.school.erp.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
public class VoucherController {

    @Autowired
    private VoucherRepository voucherRepository;

    @PostMapping
    public ResponseEntity<Voucher> createVoucher(@RequestBody Voucher voucher) {
        voucher.setCreatedAt(LocalDateTime.now());
        Voucher savedVoucher = voucherRepository.save(voucher);
        return ResponseEntity.status(201).body(savedVoucher);
    }

    @GetMapping
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        List<Voucher> vouchers = voucherRepository.findAll();
        return ResponseEntity.ok(vouchers);
    }
}
