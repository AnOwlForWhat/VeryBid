package com.verybid.backend.service;

import com.verybid.backend.dto.request.CreateItemRequest;
import com.verybid.backend.dto.request.ItemImageDTO;
import com.verybid.backend.dto.request.ReviewItemRequest;
import com.verybid.backend.dto.response.ItemResponse;
import com.verybid.backend.model.entity.*;
import com.verybid.backend.model.enums.ImageAngle;
import com.verybid.backend.model.enums.ItemStatus;
import com.verybid.backend.model.enums.Role;
import com.verybid.backend.repository.AuctionRepository;
import com.verybid.backend.repository.CategoryRepository;
import com.verybid.backend.repository.ItemRepository;
import com.verybid.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTests {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private AiAppraisalService aiAppraisalService;

    @InjectMocks
    private ItemService itemService;

    private User seller;
    private Category category;
    private Item item;

    @BeforeEach
    void setUp() {
        seller = User.builder()
                .id(UUID.randomUUID())
                .email("seller@verybid.com")
                .fullName("Collector Seller")
                .role(Role.ROLE_SELLER)
                .build();

        category = Category.builder()
                .id(1L)
                .name("Vintage Electronics")
                .slug("vintage-electronics")
                .build();

        item = Item.builder()
                .id(UUID.randomUUID())
                .seller(seller)
                .category(category)
                .title("1984 Apple Macintosh 128K")
                .description("Iconic personal computer in working condition")
                .declaredCondition("Near Mint")
                .suggestedStartingPrice(new BigDecimal("1200.00"))
                .status(ItemStatus.PENDING_REVIEW)
                .build();
    }

    @Test
    @DisplayName("createItem: should create item, trigger AI appraisal, and return PENDING_REVIEW")
    void createItem_shouldTriggerAppraisalAndSetPendingReview() {
        // Arrange
        CreateItemRequest request = CreateItemRequest.builder()
                .categoryId(1L)
                .title("1984 Apple Macintosh 128K")
                .description("Iconic personal computer in working condition")
                .declaredCondition("Near Mint")
                .suggestedStartingPrice(new BigDecimal("1200.00"))
                .images(List.of(
                        ItemImageDTO.builder().imageUrl("https://example.com/front.jpg").angle(ImageAngle.FRONT).isThumbnail(true).build()
                ))
                .build();

        when(userRepository.findByEmail(seller.getEmail())).thenReturn(Optional.of(seller));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> {
            Item saved = invocation.getArgument(0);
            saved.setId(item.getId());
            return saved;
        });

        // Act
        ItemResponse response = itemService.createItem(request, seller.getEmail());

        // Assert
        assertNotNull(response);
        assertEquals(ItemStatus.PENDING_REVIEW, response.getStatus());
        assertEquals("1984 Apple Macintosh 128K", response.getTitle());
        verify(aiAppraisalService, times(1)).appraiseItem(any(Item.class));
    }

    @Test
    @DisplayName("reviewItem: should approve item and auto-launch auction when requested")
    void reviewItem_approveWithAutoAuction_shouldCreateAuction() {
        // Arrange
        ReviewItemRequest reviewReq = ReviewItemRequest.builder()
                .status(ItemStatus.APPROVED)
                .moderatorNote("Verified authentic model, serial verified")
                .createAuction(true)
                .startPrice(new BigDecimal("1200.00"))
                .stepPrice(new BigDecimal("50.00"))
                .buyNowPrice(new BigDecimal("2500.00"))
                .durationHours(72)
                .build();

        when(itemRepository.findById(item.getId())).thenReturn(Optional.of(item));
        when(auctionRepository.findByItemId(item.getId())).thenReturn(Optional.empty());
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ItemResponse response = itemService.reviewItem(item.getId(), reviewReq, "admin@verybid.com");

        // Assert
        assertNotNull(response);
        assertEquals(ItemStatus.APPROVED, response.getStatus());
        verify(auctionRepository, times(1)).save(any(Auction.class));
    }
}
