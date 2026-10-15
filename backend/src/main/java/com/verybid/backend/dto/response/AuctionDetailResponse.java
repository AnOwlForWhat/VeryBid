package com.verybid.backend.dto.response;

import com.verybid.backend.model.entity.Auction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionDetailResponse {

    private AuctionResponse auction;
    @Builder.Default
    private List<BidResponse> bids = new ArrayList<>();

    public static AuctionDetailResponse fromEntity(Auction auction) {
        if (auction == null) return null;

        List<BidResponse> bidList = auction.getBids() != null
                ? auction.getBids().stream()
                    .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                    .map(BidResponse::fromEntity)
                    .collect(Collectors.toList())
                : new ArrayList<>();

        return AuctionDetailResponse.builder()
                .auction(AuctionResponse.fromEntity(auction))
                .bids(bidList)
                .build();
    }
}
