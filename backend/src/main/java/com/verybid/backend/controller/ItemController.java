package com.verybid.backend.controller;

import com.verybid.backend.dto.request.CreateItemRequest;
import com.verybid.backend.dto.request.ReviewItemRequest;
import com.verybid.backend.dto.response.ApiResponse;
import com.verybid.backend.dto.response.ItemAIReportResponse;
import com.verybid.backend.dto.response.ItemResponse;
import com.verybid.backend.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(
            @Valid @RequestBody CreateItemRequest request,
            Principal principal
    ) {
        ItemResponse response = itemService.createItem(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item submitted successfully for AI appraisal and review", response));
    }

    @GetMapping("/my-items")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getMyItems(Principal principal) {
        List<ItemResponse> items = itemService.getMyItems(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getPendingItems() {
        List<ItemResponse> items = itemService.getPendingItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable UUID id) {
        ItemResponse item = itemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<ItemResponse>> reviewItem(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewItemRequest request,
            Principal principal
    ) {
        ItemResponse response = itemService.reviewItem(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Item review updated successfully", response));
    }

    @PostMapping("/{id}/appraise")
    public ResponseEntity<ApiResponse<ItemResponse>> appraiseItem(@PathVariable UUID id) {
        ItemResponse response = itemService.reAppraiseItem(id);
        return ResponseEntity.ok(ApiResponse.success("AI appraisal completed successfully", response));
    }

    @GetMapping("/{id}/ai-report")
    public ResponseEntity<ApiResponse<ItemAIReportResponse>> getItemAiReport(@PathVariable UUID id) {
        ItemAIReportResponse report = itemService.getItemAiReport(id);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
