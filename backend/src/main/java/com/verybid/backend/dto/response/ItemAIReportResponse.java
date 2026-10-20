package com.verybid.backend.dto.response;

import com.verybid.backend.model.entity.ItemAIReport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemAIReportResponse {

    private Long id;
    private UUID itemId;
    private String identifiedModel;
    private String conditionRate;
    private BigDecimal marketPriceMin;
    private BigDecimal marketPriceMax;
    private BigDecimal suggestedStartPrice;
    @Builder.Default
    private List<String> riskFlags = new ArrayList<>();
    private Integer trustScore;
    private String moderatorNote;
    private String rawAiResponse;
    private LocalDateTime createdAt;

    public static ItemAIReportResponse fromEntity(ItemAIReport report) {
        if (report == null) return null;

        List<String> parsedFlags = new ArrayList<>();
        if (report.getRiskFlags() != null && !report.getRiskFlags().isBlank()) {
            String raw = report.getRiskFlags().trim();
            if (raw.startsWith("[") && raw.endsWith("]")) {
                raw = raw.substring(1, raw.length() - 1);
            }
            parsedFlags = Arrays.stream(raw.split("[,;]"))
                    .map(String::trim)
                    .map(s -> s.replace("\"", ""))
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        return ItemAIReportResponse.builder()
                .id(report.getId())
                .itemId(report.getItem() != null ? report.getItem().getId() : null)
                .identifiedModel(report.getIdentifiedModel())
                .conditionRate(report.getConditionRate())
                .marketPriceMin(report.getMarketPriceMin())
                .marketPriceMax(report.getMarketPriceMax())
                .suggestedStartPrice(report.getSuggestedStartPrice())
                .riskFlags(parsedFlags)
                .trustScore(report.getTrustScore())
                .moderatorNote(report.getModeratorNote())
                .rawAiResponse(report.getRawAiResponse())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
