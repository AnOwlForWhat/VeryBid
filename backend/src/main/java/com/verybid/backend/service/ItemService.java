package com.verybid.backend.service;

import com.verybid.backend.dto.request.CreateItemRequest;
import com.verybid.backend.dto.response.ItemResponse;
import com.verybid.backend.exception.ResourceNotFoundException;
import com.verybid.backend.model.entity.Category;
import com.verybid.backend.model.entity.Item;
import com.verybid.backend.model.entity.ItemImage;
import com.verybid.backend.model.entity.User;
import com.verybid.backend.model.enums.ItemStatus;
import com.verybid.backend.repository.CategoryRepository;
import com.verybid.backend.repository.ItemRepository;
import com.verybid.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

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
                .status(ItemStatus.APPROVED) // Auto-approved for verified auctions
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
    public ItemResponse getItemById(UUID id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
        return ItemResponse.fromEntity(item);
    }
}
