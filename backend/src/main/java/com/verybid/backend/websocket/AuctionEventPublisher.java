package com.verybid.backend.websocket;

import com.verybid.backend.dto.event.BidEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcasts an auction event to all clients subscribed to /topic/auctions/{auctionId}
     */
    public void publishEvent(UUID auctionId, BidEvent event) {
        String destination = "/topic/auctions/" + auctionId;
        log.info("Broadcasting {} event to {}: currentPrice=${}", event.getEventType(), destination, event.getCurrentPrice());
        messagingTemplate.convertAndSend(destination, event);
    }
}
