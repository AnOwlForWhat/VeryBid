package com.verybid.backend.scheduler;

import com.verybid.backend.model.entity.Auction;
import com.verybid.backend.model.entity.Transaction;
import com.verybid.backend.model.enums.AuctionStatus;
import com.verybid.backend.model.enums.TransactionStatus;
import com.verybid.backend.model.enums.TransactionType;
import com.verybid.backend.repository.AuctionRepository;
import com.verybid.backend.repository.TransactionRepository;
import com.verybid.backend.dto.event.BidEvent;
import com.verybid.backend.websocket.AuctionEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final TransactionRepository transactionRepository;
    private final AuctionEventPublisher auctionEventPublisher;

    /**
     * Checks and updates auction lifecycle states every 15 seconds.
     * Transitions:
     * 1. UPCOMING -> ACTIVE when startTime has arrived
     * 2. ACTIVE/EXTENDED -> ENDED when endTime has passed (and settles winners)
     */
    @Scheduled(fixedRate = 15000)
    @Transactional
    public void processAuctionLifecycle() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Activate upcoming auctions
        List<Auction> upcomingAuctions = auctionRepository.findByStatusAndStartTimeBefore(AuctionStatus.UPCOMING, now);
        for (Auction auction : upcomingAuctions) {
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
            log.info("Auction {} is now ACTIVE.", auction.getId());
        }

        // 2. End active auctions that reached their end time
        List<Auction> activeAuctions = auctionRepository.findByStatusAndEndTimeBefore(AuctionStatus.ACTIVE, now);
        for (Auction auction : activeAuctions) {
            endAndSettleAuction(auction);
        }

        // 3. End extended auctions that reached their extended end time
        List<Auction> extendedAuctions = auctionRepository.findByStatusAndEndTimeBefore(AuctionStatus.EXTENDED, now);
        for (Auction auction : extendedAuctions) {
            endAndSettleAuction(auction);
        }
    }

    private void endAndSettleAuction(Auction auction) {
        auction.setStatus(AuctionStatus.ENDED);
        auctionRepository.save(auction);

        if (auction.getCurrentWinner() != null) {
            // Settle final transaction for the winning bidder
            Transaction settlement = Transaction.builder()
                    .user(auction.getCurrentWinner())
                    .auction(auction)
                    .type(TransactionType.PAYMENT)
                    .amount(auction.getCurrentPrice())
                    .status(TransactionStatus.COMPLETED)
                    .build();

            transactionRepository.save(settlement);
            log.info("Auction {} ENDED. Winner: {} settled with amount ${}",
                    auction.getId(), auction.getCurrentWinner().getEmail(), auction.getCurrentPrice());
        } else {
            log.info("Auction {} ENDED with no bids.", auction.getId());
        }

        // Broadcast AUCTION_ENDED event
        auctionEventPublisher.publishEvent(auction.getId(), BidEvent.builder()
                .eventType("AUCTION_ENDED")
                .auctionId(auction.getId())
                .currentPrice(auction.getCurrentPrice())
                .highestBidderId(auction.getCurrentWinner() != null ? auction.getCurrentWinner().getId() : null)
                .highestBidderName(auction.getCurrentWinner() != null ? auction.getCurrentWinner().getFullName() : null)
                .endTime(auction.getEndTime())
                .build());
    }
}
