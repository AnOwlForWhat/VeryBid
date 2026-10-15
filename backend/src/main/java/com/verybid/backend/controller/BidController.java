package com.verybid.backend.controller;

import com.verybid.backend.dto.request.PlaceBidRequest;
import com.verybid.backend.dto.response.ApiResponse;
import com.verybid.backend.dto.response.AuctionResponse;
import com.verybid.backend.dto.response.BidResponse;
import com.verybid.backend.service.BidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auctions/{auctionId}")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @PostMapping("/bids")
    public ResponseEntity<ApiResponse<BidResponse>> placeBid(
            @PathVariable UUID auctionId,
            @Valid @RequestBody PlaceBidRequest request,
            Principal principal
    ) {
        BidResponse response = bidService.placeBid(auctionId, request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bid placed successfully", response));
    }

    @PostMapping("/buy-now")
    public ResponseEntity<ApiResponse<AuctionResponse>> buyNow(
            @PathVariable UUID auctionId,
            Principal principal
    ) {
        AuctionResponse response = bidService.buyNow(auctionId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Auction bought out successfully", response));
    }

    @GetMapping("/bids")
    public ResponseEntity<ApiResponse<List<BidResponse>>> getAuctionBids(@PathVariable UUID auctionId) {
        List<BidResponse> bids = bidService.getAuctionBids(auctionId);
        return ResponseEntity.ok(ApiResponse.success(bids));
    }
}
