package com.verybid.backend.service;

import com.verybid.backend.dto.request.PlaceBidRequest;
import com.verybid.backend.dto.response.AuctionResponse;
import com.verybid.backend.dto.response.BidResponse;
import com.verybid.backend.exception.BadRequestException;
import com.verybid.backend.exception.ResourceNotFoundException;
import com.verybid.backend.model.entity.Auction;
import com.verybid.backend.model.entity.Bid;
import com.verybid.backend.model.entity.Transaction;
import com.verybid.backend.model.entity.User;
import com.verybid.backend.model.enums.AuctionStatus;
import com.verybid.backend.model.enums.TransactionStatus;
import com.verybid.backend.model.enums.TransactionType;
import com.verybid.backend.repository.AuctionRepository;
import com.verybid.backend.repository.BidRepository;
import com.verybid.backend.repository.TransactionRepository;
import com.verybid.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BidService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    private static final int ANTI_SNIPING_WINDOW_MINUTES = 2;
    private static final int ANTI_SNIPING_EXTENSION_MINUTES = 2;

    @Transactional
    public BidResponse placeBid(UUID auctionId, PlaceBidRequest request, String bidderEmail) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction", "id", auctionId));

        User bidder = userRepository.findByEmail(bidderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", bidderEmail));

        LocalDateTime now = LocalDateTime.now();

        // 1. Verify auction status
        if (auction.getStatus() != AuctionStatus.ACTIVE && auction.getStatus() != AuctionStatus.EXTENDED) {
            throw new BadRequestException("Auction is not active for bidding. Current status: " + auction.getStatus());
        }

        // 2. Verify auction window
        if (now.isBefore(auction.getStartTime()) || now.isAfter(auction.getEndTime())) {
            throw new BadRequestException("Auction is outside the active bidding time window");
        }

        // 3. Prevent self-bidding
        if (auction.getItem().getSeller().getId().equals(bidder.getId())) {
            throw new BadRequestException("Sellers cannot bid on their own auctions");
        }

        // 4. Prevent bidding when already leading
        if (auction.getCurrentWinner() != null && auction.getCurrentWinner().getId().equals(bidder.getId())) {
            throw new BadRequestException("You are already the highest bidder");
        }

        // 5. Verify bid amount meets minimum increment
        BigDecimal minimumRequiredBid;
        if (auction.getCurrentWinner() == null) {
            minimumRequiredBid = auction.getStartPrice();
        } else {
            minimumRequiredBid = auction.getCurrentPrice().add(auction.getStepPrice());
        }

        if (request.getBidAmount().compareTo(minimumRequiredBid) < 0) {
            throw new BadRequestException(String.format(
                    "Bid amount $%.2f is below the minimum required bid of $%.2f",
                    request.getBidAmount(), minimumRequiredBid
            ));
        }

        // 6. Anti-sniping rule (Soft-Close)
        // If a bid is placed within the last 2 minutes, extend the auction by 2 minutes
        LocalDateTime antiSnipingThreshold = auction.getEndTime().minusMinutes(ANTI_SNIPING_WINDOW_MINUTES);
        if (now.isAfter(antiSnipingThreshold)) {
            auction.setEndTime(auction.getEndTime().plusMinutes(ANTI_SNIPING_EXTENSION_MINUTES));
            auction.setStatus(AuctionStatus.EXTENDED);
            log.info("Auction {} anti-sniping triggered. Extended end time to {}", auctionId, auction.getEndTime());
        }

        // 7. Record the bid
        Bid bid = Bid.builder()
                .auction(auction)
                .bidder(bidder)
                .bidAmount(request.getBidAmount())
                .isAutoBid(false)
                .build();

        Bid savedBid = bidRepository.save(bid);

        // 8. Update auction state
        auction.setCurrentPrice(request.getBidAmount());
        auction.setCurrentWinner(bidder);
        auctionRepository.save(auction);

        return BidResponse.fromEntity(savedBid);
    }

    @Transactional
    public AuctionResponse buyNow(UUID auctionId, String buyerEmail) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction", "id", auctionId));

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", buyerEmail));

        if (auction.getBuyNowPrice() == null) {
            throw new BadRequestException("This auction does not have an instant Buy-Now option");
        }

        if (auction.getStatus() == AuctionStatus.ENDED || auction.getStatus() == AuctionStatus.CANCELLED) {
            throw new BadRequestException("Auction has already closed");
        }

        if (auction.getItem().getSeller().getId().equals(buyer.getId())) {
            throw new BadRequestException("Sellers cannot buy out their own auctions");
        }

        LocalDateTime now = LocalDateTime.now();

        // Record instant buy bid
        Bid winningBid = Bid.builder()
                .auction(auction)
                .bidder(buyer)
                .bidAmount(auction.getBuyNowPrice())
                .isAutoBid(false)
                .build();
        bidRepository.save(winningBid);

        // Close auction immediately
        auction.setCurrentPrice(auction.getBuyNowPrice());
        auction.setCurrentWinner(buyer);
        auction.setStatus(AuctionStatus.ENDED);
        auction.setEndTime(now);
        Auction saved = auctionRepository.save(auction);

        // Record buyout transaction
        Transaction transaction = Transaction.builder()
                .user(buyer)
                .auction(auction)
                .type(TransactionType.PAYMENT)
                .amount(auction.getBuyNowPrice())
                .status(TransactionStatus.COMPLETED)
                .build();
        transactionRepository.save(transaction);

        log.info("Auction {} was bought out immediately by {} for ${}", auctionId, buyerEmail, auction.getBuyNowPrice());
        return AuctionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<BidResponse> getAuctionBids(UUID auctionId) {
        return bidRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId).stream()
                .map(BidResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
