package com.verybid.backend.websocket;

import com.verybid.backend.dto.event.BidEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuctionEventPublisherTests {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private AuctionEventPublisher publisher;

    @Test
    @DisplayName("Should convert and send bid event to STOMP destination")
    void testPublishEvent() {
        UUID auctionId = UUID.randomUUID();
        BidEvent event = BidEvent.builder()
                .eventType("NEW_BID")
                .auctionId(auctionId)
                .currentPrice(new BigDecimal("150.00"))
                .build();

        publisher.publishEvent(auctionId, event);

        verify(messagingTemplate).convertAndSend(eq("/topic/auctions/" + auctionId), eq(event));
    }
}
