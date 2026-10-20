package com.verybid.backend.service;

import com.verybid.backend.model.entity.Category;
import com.verybid.backend.model.entity.Item;
import com.verybid.backend.model.entity.ItemAIReport;
import com.verybid.backend.model.entity.ItemImage;
import com.verybid.backend.model.enums.ImageAngle;
import com.verybid.backend.repository.ItemAIReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiAppraisalServiceTests {

    @Mock
    private ItemAIReportRepository itemAIReportRepository;

    @InjectMocks
    private AiAppraisalService aiAppraisalService;

    private Item sampleItem;
    private Category category;

    @BeforeEach
    void setUp() {
        category = Category.builder()
                .id(1L)
                .name("Diecast Models")
                .slug("diecast-models")
                .build();

        sampleItem = Item.builder()
                .id(UUID.randomUUID())
                .title("1968 Custom Camaro Hot Wheels Redline")
                .description("Vintage white enamel casting with original redline tires")
                .declaredCondition("Mint 100% Unopened")
                .suggestedStartingPrice(new BigDecimal("250.00"))
                .category(category)
                .images(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("appraiseItem: should generate high trust score and verified flags when multi-angle photos are present")
    void appraiseItem_withCompleteAngles_shouldAwardHighTrustScore() {
        // Arrange
        sampleItem.getImages().addAll(List.of(
                ItemImage.builder().angle(ImageAngle.FRONT).imageUrl("https://example.com/front.jpg").item(sampleItem).build(),
                ItemImage.builder().angle(ImageAngle.BACK).imageUrl("https://example.com/back.jpg").item(sampleItem).build(),
                ItemImage.builder().angle(ImageAngle.SERIAL_NUMBER).imageUrl("https://example.com/serial.jpg").item(sampleItem).build(),
                ItemImage.builder().angle(ImageAngle.PACKAGING).imageUrl("https://example.com/box.jpg").item(sampleItem).build(),
                ItemImage.builder().angle(ImageAngle.SCRATCH_DETAIL).imageUrl("https://example.com/detail.jpg").item(sampleItem).build()
        ));

        when(itemAIReportRepository.findByItemId(sampleItem.getId())).thenReturn(Optional.empty());
        when(itemAIReportRepository.save(any(ItemAIReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ItemAIReport report = aiAppraisalService.appraiseItem(sampleItem);

        // Assert
        assertNotNull(report);
        assertEquals(sampleItem.getTitle(), report.getIdentifiedModel());
        assertTrue(report.getTrustScore() >= 90, "Trust score should be >= 90 for complete angles");
        assertTrue(report.getConditionRate().contains("Mint"), "Condition rate should detect Mint claim");
        assertTrue(report.getRiskFlags().contains("SERIAL_NUMBER_VERIFIED"));
        assertTrue(report.getRiskFlags().contains("ORIGINAL_PACKAGING_VERIFIED"));
        assertTrue(report.getRiskFlags().contains("MULTI_ANGLE_INSPECTION_PASSED"));
        assertTrue(report.getMarketPriceMin().compareTo(sampleItem.getSuggestedStartingPrice()) > 0);
        assertTrue(report.getMarketPriceMax().compareTo(report.getMarketPriceMin()) > 0);
        verify(itemAIReportRepository, times(1)).save(any(ItemAIReport.class));
    }

    @Test
    @DisplayName("appraiseItem: should flag missing serial and reduce trust score when serial photo is omitted")
    void appraiseItem_withoutSerialAngle_shouldFlagRisk() {
        // Arrange
        sampleItem.getImages().add(
                ItemImage.builder().angle(ImageAngle.FRONT).imageUrl("https://example.com/front.jpg").item(sampleItem).build()
        );

        when(itemAIReportRepository.findByItemId(sampleItem.getId())).thenReturn(Optional.empty());
        when(itemAIReportRepository.save(any(ItemAIReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ItemAIReport report = aiAppraisalService.appraiseItem(sampleItem);

        // Assert
        assertNotNull(report);
        assertTrue(report.getRiskFlags().contains("MISSING_SERIAL_ANGLE"));
        assertTrue(report.getRiskFlags().contains("INSUFFICIENT_IMAGE_EVIDENCE"));
        assertTrue(report.getTrustScore() < 80, "Trust score should drop when photos are insufficient");
    }
}
