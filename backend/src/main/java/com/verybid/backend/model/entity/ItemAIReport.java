package com.verybid.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_ai_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemAIReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false, unique = true)
    private Item item;

    @Column(length = 255)
    private String identifiedModel;

    @Column(length = 50)
    private String conditionRate;

    @Column(precision = 15, scale = 2)
    private BigDecimal marketPriceMin;

    @Column(precision = 15, scale = 2)
    private BigDecimal marketPriceMax;

    @Column(precision = 15, scale = 2)
    private BigDecimal suggestedStartPrice;

    @Column(columnDefinition = "TEXT")
    private String riskFlags;

    @Column
    private Integer trustScore;

    @Column(columnDefinition = "TEXT")
    private String moderatorNote;

    @Column(columnDefinition = "TEXT")
    private String rawAiResponse;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
