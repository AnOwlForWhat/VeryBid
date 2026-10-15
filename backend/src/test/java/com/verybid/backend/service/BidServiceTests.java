package com.verybid.backend.service;

import com.verybid.backend.dto.request.PlaceBidRequest;
import com.verybid.backend.dto.response.AuctionResponse;
import com.verybid.backend.dto.response.BidResponse;
import com.verybid.backend.exception.BadRequestException;
import com.verybid.backend.model.entity.*;
import com.verybid.backend.model.enums.AuctionStatus;
import com.verybid.backend.model.enums.ItemStatus;
import com.verybid.backend.model.enums.Role;
import com.verybid.backend.repository.AuctionRepository;
import com.verybid.backend.repository.BidRepository;
import com.verybid.backend.repository.TransactionRepository;
import com.verybid.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BidServiceTests {

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private BidRepository bidRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private com.verybid.backend.websocket.AuctionEventPublisher auctionEventPublisher;

    @InjectMocks
    private BidService bidService;

    private User seller;
    private User bidder;
    private Item item;
    private Auction auction;
    private UUID auctionId;

    @BeforeEach
    void setup() {
        seller = User.builder()
                .id(UUID.randomUUID())
                .email("seller@verybid.com")
                .fullName("Seller John")
                .role(Role.ROLE_SELLER)
                .build();

        bidder = User.builder()
                .id(UUID.randomUUID())
                .email("bidder@verybid.com")
                .fullName("Bidder Mark")
                .role(Role.ROLE_BIDDER)
                .build();

        item = Item.builder()
                .id(UUID.randomUUID())
                .seller(seller)
                .title("Rare Vintage Watch")
                .description("Chronograph 1970")
                .status(ItemStatus.APPROVED)
                .build();

        auctionId = UUID.randomUUID();
        auction = Auction.builder()
                .id(auctionId)
                .item(item)
                .startPrice(new BigDecimal("100.00"))
                .stepPrice(new BigDecimal("10.00"))
                .buyNowPrice(new BigDecimal("500.00"))
                .currentPrice(new BigDecimal("100.00"))
                .startTime(LocalDateTime.now().minusHours(1))
                .endTime(LocalDateTime.now().plusHours(1))
                .status(AuctionStatus.ACTIVE)
                .version(0L)
                .build();
    }

    @Test
    @DisplayName("Should place valid bid successfully")
    void testPlaceBid_success() {
        PlaceBidRequest request = PlaceBidRequest.builder()
                .bidAmount(new BigDecimal("120.00"))
                .build();

        when(auctionRepository.findById(auctionId)).thenReturn(Optional.of(auction));
        when(userRepository.findByEmail("bidder@verybid.com")).thenReturn(Optional.of(bidder));
        when(bidRepository.save(any(Bid.class))).thenAnswer(invocation -> {
            Bid b = invocation.getArgument(0);
            b.setId(1L);
            b.setCreatedAt(LocalDateTime.now());
            return b;
        });

        BidResponse response = bidService.placeBid(auctionId, request, "bidder@verybid.com");

        assertThat(response).isNotNull();
        assertThat(response.getBidAmount()).isEqualTo(new BigDecimal("120.00"));
        assertThat(auction.getCurrentPrice()).isEqualTo(new BigDecimal("120.00"));
        assertThat(auction.getCurrentWinner()).isEqualTo(bidder);
        verify(auctionRepository).save(auction);
    }

    @Test
    @DisplayName("Should trigger anti-sniping and extend endTime by 2 minutes when bid in final 2 minutes")
    void testAntiSniping_triggered() {
        // Auction ends in 1 minute
        LocalDateTime initialEndTime = LocalDateTime.now().plusMinutes(1);
        auction.setEndTime(initialEndTime);

        PlaceBidRequest request = PlaceBidRequest.builder()
                .bidAmount(new BigDecimal("120.00"))
                .build();

        when(auctionRepository.findById(auctionId)).thenReturn(Optional.of(auction));
        when(userRepository.findByEmail("bidder@verybid.com")).thenReturn(Optional.of(bidder));
        when(bidRepository.save(any(Bid.class))).thenAnswer(invocation -> {
            Bid b = invocation.getArgument(0);
            b.setId(1L);
            b.setCreatedAt(LocalDateTime.now());
            return b;
        });

        bidService.placeBid(auctionId, request, "bidder@verybid.com");

        assertThat(auction.getStatus()).isEqualTo(AuctionStatus.EXTENDED);
        assertThat(auction.getEndTime()).isAfter(initialEndTime);
    }

    @Test
    @DisplayName("Should reject bid if bidder is the auction seller")
    void testPlaceBid_sellerCannotBid() {
        PlaceBidRequest request = PlaceBidRequest.builder()
                .bidAmount(new BigDecimal("150.00"))
                .build();

        when(auctionRepository.findById(auctionId)).thenReturn(Optional.of(auction));
        when(userRepository.findByEmail("seller@verybid.com")).thenReturn(Optional.of(seller));

        assertThatThrownBy(() -> bidService.placeBid(auctionId, request, "seller@verybid.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Sellers cannot bid on their own auctions");
    }

    @Test
    @DisplayName("Should reject bid below minimum increment")
    void testPlaceBid_belowMinimumIncrement() {
        auction.setCurrentWinner(bidder);
        auction.setCurrentPrice(new BigDecimal("100.00"));
        // stepPrice is 10.00, so minimum is 110.00. Bidder attempts 105.00
        PlaceBidRequest request = PlaceBidRequest.builder()
                .bidAmount(new BigDecimal("105.00"))
                .build();

        User anotherBidder = User.builder().id(UUID.randomUUID()).email("another@verybid.com").build();

        when(auctionRepository.findById(auctionId)).thenReturn(Optional.of(auction));
        when(userRepository.findByEmail("another@verybid.com")).thenReturn(Optional.of(anotherBidder));

        assertThatThrownBy(() -> bidService.placeBid(auctionId, request, "another@verybid.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("below the minimum required bid");
    }

    @Test
    @DisplayName("Should buyout auction immediately with buyNow")
    void testBuyNow_success() {
        when(auctionRepository.findById(auctionId)).thenReturn(Optional.of(auction));
        when(userRepository.findByEmail("bidder@verybid.com")).thenReturn(Optional.of(bidder));
        when(auctionRepository.save(any(Auction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuctionResponse response = bidService.buyNow(auctionId, "bidder@verybid.com");

        assertThat(response.getStatus()).isEqualTo(AuctionStatus.ENDED);
        assertThat(response.getCurrentPrice()).isEqualTo(new BigDecimal("500.00"));
        assertThat(response.getCurrentWinnerId()).isEqualTo(bidder.getId());
        verify(transactionRepository).save(any(Transaction.class));
    }
}
