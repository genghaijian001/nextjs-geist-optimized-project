package com.school.erp.repository;

import com.school.erp.entity.InventoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRecordRepository extends JpaRepository<InventoryRecord, Long> {
}
