package com.verybid.backend.repository;

import com.verybid.backend.model.entity.Auction;
import com.verybid.backend.model.enums.AuctionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, UUID> {

    List<Auction> findByStatus(AuctionStatus status);

    Optional<Auction> findByItemId(UUID itemId);

    List<Auction> findByCurrentWinnerId(UUID currentWinnerId);

    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime dateTime);

    List<Auction> findByStatusAndStartTimeBefore(AuctionStatus status, LocalDateTime dateTime);

    @Query("SELECT a FROM Auction a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:categoryId IS NULL OR a.item.category.id = :categoryId) AND " +
           "(:keyword IS NULL OR LOWER(a.item.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Auction> findWithFilters(
            @Param("status") AuctionStatus status,
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
