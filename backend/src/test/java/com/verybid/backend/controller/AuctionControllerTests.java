package com.verybid.backend.controller;

import com.verybid.backend.dto.response.AuctionDetailResponse;
import com.verybid.backend.dto.response.AuctionResponse;
import com.verybid.backend.dto.response.CategoryResponse;
import com.verybid.backend.dto.response.ItemResponse;
import com.verybid.backend.model.enums.AuctionStatus;
import com.verybid.backend.model.enums.ItemStatus;
import com.verybid.backend.security.JwtService;
import com.verybid.backend.service.AuctionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuctionController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuctionControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuctionService auctionService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private AuctionResponse sampleAuctionResponse(UUID auctionId) {
        return AuctionResponse.builder()
                .id(auctionId)
                .item(ItemResponse.builder()
                        .id(UUID.randomUUID())
                        .title("1967 Shelby GT500 Diecast")
                        .description("Mint condition 1:18 diecast model")
                        .status(ItemStatus.APPROVED)
                        .category(CategoryResponse.builder().id(1L).name("Diecast Models").slug("diecast-models").build())
                        .build())
                .startPrice(new BigDecimal("100.00"))
                .stepPrice(new BigDecimal("10.00"))
                .buyNowPrice(new BigDecimal("500.00"))
                .currentPrice(new BigDecimal("100.00"))
                .startTime(LocalDateTime.now().minusHours(1))
                .endTime(LocalDateTime.now().plusHours(2))
                .status(AuctionStatus.ACTIVE)
                .totalBids(0L)
                .version(0L)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/auctions - should return paginated list of auctions")
    void testGetAuctions_success() throws Exception {
        UUID auctionId = UUID.randomUUID();
        AuctionResponse response = sampleAuctionResponse(auctionId);
        PageImpl<AuctionResponse> page = new PageImpl<>(List.of(response));

        when(auctionService.getAuctions(any(), any(), any(), anyInt(), anyInt())).thenReturn(page);

        mockMvc.perform(get("/api/v1/auctions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(auctionId.toString()))
                .andExpect(jsonPath("$.data.content[0].item.title").value("1967 Shelby GT500 Diecast"));
    }

    @Test
    @DisplayName("GET /api/v1/auctions/{id} - should return auction details")
    void testGetAuctionById_success() throws Exception {
        UUID auctionId = UUID.randomUUID();
        AuctionResponse response = sampleAuctionResponse(auctionId);
        AuctionDetailResponse detail = AuctionDetailResponse.builder()
                .auction(response)
                .bids(Collections.emptyList())
                .build();

        when(auctionService.getAuctionById(auctionId)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/auctions/{id}", auctionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.auction.id").value(auctionId.toString()))
                .andExpect(jsonPath("$.data.auction.currentPrice").value(100.00));
    }
}
