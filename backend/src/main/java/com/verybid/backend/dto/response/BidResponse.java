package com.verybid.backend.dto.response;

import com.verybid.backend.model.entity.Bid;
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
public class BidResponse {

    private Long id;
    private UUID auctionId;
    private UUID bidderId;
    private String bidderName;
    private BigDecimal bidAmount;
    private Boolean isAutoBid;
    private LocalDateTime createdAt;

    public static BidResponse fromEntity(Bid bid) {
        if (bid == null) return null;
        return BidResponse.builder()
                .id(bid.getId())
                .auctionId(bid.getAuction() != null ? bid.getAuction().getId() : null)
                .bidderId(bid.getBidder() != null ? bid.getBidder().getId() : null)
                .bidderName(bid.getBidder() != null ? bid.getBidder().getFullName() : null)
                .bidAmount(bid.getBidAmount())
                .isAutoBid(bid.getIsAutoBid())
                .createdAt(bid.getCreatedAt())
                .build();
    }
}
