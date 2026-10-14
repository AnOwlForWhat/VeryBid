package com.verybid.backend.repository;

import com.verybid.backend.model.entity.ItemAIReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemAIReportRepository extends JpaRepository<ItemAIReport, Long> {

    Optional<ItemAIReport> findByItemId(UUID itemId);
}
