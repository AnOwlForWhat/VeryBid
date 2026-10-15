package com.verybid.backend.dto.event;

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
public class BidEvent {

    private String eventType; // "NEW_BID", "AUCTION_EXTENDED", "BUYOUT", "AUCTION_ENDED"
    private UUID auctionId;
    private BigDecimal currentPrice;
    private UUID highestBidderId;
    private String highestBidderName;
    private LocalDateTime endTime;
    private Long totalBids;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
