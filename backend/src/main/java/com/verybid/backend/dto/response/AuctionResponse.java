package com.verybid.backend.dto.response;

import com.verybid.backend.model.entity.Auction;
import com.verybid.backend.model.enums.AuctionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionResponse {

    private UUID id;
    private ItemResponse item;
    private BigDecimal startPrice;
    private BigDecimal stepPrice;
    private BigDecimal buyNowPrice;
    private BigDecimal currentPrice;
    private UUID currentWinnerId;
    private String currentWinnerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AuctionStatus status;
    private Long totalBids;
    private Long version;
    private LocalDateTime createdAt;

    public static AuctionResponse fromEntity(Auction auction) {
        if (auction == null) return null;

        long bidCount = auction.getBids() != null ? auction.getBids().size() : 0L;

        return AuctionResponse.builder()
                .id(auction.getId())
                .item(ItemResponse.fromEntity(auction.getItem()))
                .startPrice(auction.getStartPrice())
                .stepPrice(auction.getStepPrice())
                .buyNowPrice(auction.getBuyNowPrice())
                .currentPrice(auction.getCurrentPrice())
                .currentWinnerId(auction.getCurrentWinner() != null ? auction.getCurrentWinner().getId() : null)
                .currentWinnerName(auction.getCurrentWinner() != null ? auction.getCurrentWinner().getFullName() : null)
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .status(auction.getStatus())
                .totalBids(bidCount)
                .version(auction.getVersion())
                .createdAt(auction.getCreatedAt())
                .build();
    }
}
