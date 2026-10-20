package com.verybid.backend.service;

import com.verybid.backend.dto.request.CreateItemRequest;
import com.verybid.backend.dto.request.ReviewItemRequest;
import com.verybid.backend.dto.response.ItemAIReportResponse;
import com.verybid.backend.dto.response.ItemResponse;
import com.verybid.backend.exception.ResourceNotFoundException;
import com.verybid.backend.model.entity.*;
import com.verybid.backend.model.enums.AuctionStatus;
import com.verybid.backend.model.enums.ItemStatus;
import com.verybid.backend.repository.AuctionRepository;
import com.verybid.backend.repository.CategoryRepository;
import com.verybid.backend.repository.ItemRepository;
import com.verybid.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AuctionRepository auctionRepository;
    private final AiAppraisalService aiAppraisalService;

    @Transactional
    public ItemResponse createItem(CreateItemRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Item item = Item.builder()
                .seller(seller)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .declaredCondition(request.getDeclaredCondition())
                .suggestedStartingPrice(request.getSuggestedStartingPrice())
                .status(ItemStatus.PENDING_REVIEW)
                .images(new ArrayList<>())
                .build();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (var imgDto : request.getImages()) {
                ItemImage img = ItemImage.builder()
                        .item(item)
                        .imageUrl(imgDto.getImageUrl())
                        .angle(imgDto.getAngle())
                        .isThumbnail(imgDto.getIsThumbnail())
                        .build();
                item.getImages().add(img);
            }
        }

        Item saved = itemRepository.save(item);

        // Run automated AI appraisal on item submission
        try {
            aiAppraisalService.appraiseItem(saved);
        } catch (Exception ex) {
            log.error("Failed to run automated AI appraisal for item {}: {}", saved.getId(), ex.getMessage());
        }

        return ItemResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> getMyItems(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", sellerEmail));

        return itemRepository.findBySellerId(seller.getId()).stream()
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> getPendingItems() {
        return itemRepository.findByStatus(ItemStatus.PENDING_REVIEW).stream()
                .map(ItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ItemResponse getItemById(UUID id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
        return ItemResponse.fromEntity(item);
    }

    @Transactional
    public ItemResponse reviewItem(UUID id, ReviewItemRequest request, String reviewerEmail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));

        item.setStatus(request.getStatus());

        if (item.getAiReport() != null && request.getModeratorNote() != null) {
            item.getAiReport().setModeratorNote(request.getModeratorNote());
        }

        // Auto-launch auction if approved and requested
        if (request.getStatus() == ItemStatus.APPROVED && Boolean.TRUE.equals(request.getCreateAuction())) {
            if (auctionRepository.findByItemId(item.getId()).isEmpty()) {
                BigDecimal startPrice = request.getStartPrice() != null
                        ? request.getStartPrice()
                        : (item.getSuggestedStartingPrice() != null ? item.getSuggestedStartingPrice() : new BigDecimal("100.00"));

                BigDecimal stepPrice = request.getStepPrice() != null
                        ? request.getStepPrice()
                        : startPrice.multiply(new BigDecimal("0.05")).max(new BigDecimal("5.00"));

                int durationHours = (request.getDurationHours() != null && request.getDurationHours() > 0)
                        ? request.getDurationHours()
                        : 48;

                LocalDateTime now = LocalDateTime.now();
                Auction auction = Auction.builder()
                        .item(item)
                        .startPrice(startPrice)
                        .stepPrice(stepPrice)
                        .buyNowPrice(request.getBuyNowPrice())
                        .currentPrice(startPrice)
                        .startTime(now)
                        .endTime(now.plusHours(durationHours))
                        .status(AuctionStatus.ACTIVE)
                        .build();

                auctionRepository.save(auction);
                log.info("Auction automatically created for approved item {} by moderator {}", id, reviewerEmail);
            }
        }

        Item saved = itemRepository.save(item);
        log.info("Item {} reviewed by {}: new status={}", id, reviewerEmail, saved.getStatus());
        return ItemResponse.fromEntity(saved);
    }

    @Transactional
    public ItemResponse reAppraiseItem(UUID id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
        aiAppraisalService.appraiseItem(item);
        return ItemResponse.fromEntity(item);
    }

    @Transactional(readOnly = true)
    public ItemAIReportResponse getItemAiReport(UUID itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));
        if (item.getAiReport() == null) {
            throw new ResourceNotFoundException("ItemAIReport", "itemId", itemId);
        }
        return ItemAIReportResponse.fromEntity(item.getAiReport());
    }
}
