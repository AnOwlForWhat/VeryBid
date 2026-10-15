package com.verybid.backend.controller;

import com.verybid.backend.dto.request.CreateItemRequest;
import com.verybid.backend.dto.response.ApiResponse;
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
                .body(ApiResponse.success("Item created successfully", response));
    }

    @GetMapping("/my-items")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getMyItems(Principal principal) {
        List<ItemResponse> items = itemService.getMyItems(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable UUID id) {
        ItemResponse item = itemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }
}
