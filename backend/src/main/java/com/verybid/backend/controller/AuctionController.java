package com.verybid.backend.controller;

import com.verybid.backend.dto.request.CreateAuctionRequest;
import com.verybid.backend.dto.response.ApiResponse;
import com.verybid.backend.dto.response.AuctionDetailResponse;
import com.verybid.backend.dto.response.AuctionResponse;
import com.verybid.backend.model.enums.AuctionStatus;
import com.verybid.backend.service.AuctionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    @PostMapping
    public ResponseEntity<ApiResponse<AuctionResponse>> createAuction(
            @Valid @RequestBody CreateAuctionRequest request,
            Principal principal
    ) {
        AuctionResponse response = auctionService.createAuction(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Auction created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuctionResponse>>> getAuctions(
            @RequestParam(required = false) AuctionStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AuctionResponse> auctions = auctionService.getAuctions(status, categoryId, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(auctions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuctionDetailResponse>> getAuctionById(@PathVariable UUID id) {
        AuctionDetailResponse response = auctionService.getAuctionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
