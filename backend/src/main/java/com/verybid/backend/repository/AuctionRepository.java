package com.verybid.backend.repository;

import com.verybid.backend.model.entity.Auction;
import com.verybid.backend.model.enums.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
