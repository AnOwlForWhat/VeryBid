package com.verybid.backend.service;

import com.verybid.backend.dto.request.CreateAuctionRequest;
import com.verybid.backend.dto.response.AuctionDetailResponse;
import com.verybid.backend.dto.response.AuctionResponse;
import com.verybid.backend.exception.BadRequestException;
import com.verybid.backend.exception.DuplicateResourceException;
import com.verybid.backend.exception.ResourceNotFoundException;
import com.verybid.backend.model.entity.Auction;
import com.verybid.backend.model.entity.Item;
import com.verybid.backend.model.entity.User;
import com.verybid.backend.model.enums.AuctionStatus;
import com.verybid.backend.repository.AuctionRepository;
import com.verybid.backend.repository.ItemRepository;
import com.verybid.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    @Transactional
    public AuctionResponse createAuction(CreateAuctionRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", request.getItemId()));

        if (!item.getSeller().getId().equals(seller.getId())) {
            throw new BadRequestException("You can only create an auction for items you own");
        }

        if (auctionRepository.findByItemId(item.getId()).isPresent()) {
            throw new DuplicateResourceException("An auction for this item already exists");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("Auction end time must be after start time");
        }

        LocalDateTime now = LocalDateTime.now();
        AuctionStatus initialStatus = now.isBefore(request.getStartTime())
                ? AuctionStatus.UPCOMING
                : AuctionStatus.ACTIVE;

        Auction auction = Auction.builder()
                .item(item)
                .startPrice(request.getStartPrice())
                .stepPrice(request.getStepPrice())
                .buyNowPrice(request.getBuyNowPrice())
                .currentPrice(request.getStartPrice())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(initialStatus)
                .build();

        Auction saved = auctionRepository.save(auction);
        return AuctionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<AuctionResponse> getAuctions(
            AuctionStatus status,
            Long categoryId,
            String keyword,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Auction> auctions = auctionRepository.findWithFilters(status, categoryId, keyword, pageable);
        return auctions.map(AuctionResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public AuctionDetailResponse getAuctionById(UUID id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction", "id", id));
        return AuctionDetailResponse.fromEntity(auction);
    }
}
