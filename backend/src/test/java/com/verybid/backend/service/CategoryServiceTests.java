package com.verybid.backend.service;

import com.verybid.backend.dto.response.CategoryResponse;
import com.verybid.backend.exception.ResourceNotFoundException;
import com.verybid.backend.model.entity.Category;
import com.verybid.backend.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTests {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category diecastCategory;
    private Category techCategory;

    @BeforeEach
    void setUp() {
        diecastCategory = Category.builder()
                .id(1L)
                .name("Diecast Models")
                .slug("diecast-models")
                .description("Collectible scale cars and vehicles")
                .createdAt(LocalDateTime.now())
                .build();

        techCategory = Category.builder()
                .id(2L)
                .name("Vintage Electronics")
                .slug("vintage-electronics")
                .description("Retro gaming and audio equipment")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getAllCategories: should return mapped list of all categories")
    void getAllCategories_shouldReturnMappedList() {
        // Arrange
        when(categoryRepository.findAll()).thenReturn(List.of(diecastCategory, techCategory));

        // Act
        List<CategoryResponse> result = categoryService.getAllCategories();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Diecast Models", result.get(0).getName());
        assertEquals("diecast-models", result.get(0).getSlug());
        assertEquals("Vintage Electronics", result.get(1).getName());
        verify(categoryRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getCategoryBySlug: should return CategoryResponse when slug exists")
    void getCategoryBySlug_whenFound_shouldReturnCategory() {
        // Arrange
        when(categoryRepository.findBySlug("diecast-models")).thenReturn(Optional.of(diecastCategory));

        // Act
        CategoryResponse result = categoryService.getCategoryBySlug("diecast-models");

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Diecast Models", result.getName());
        assertEquals("diecast-models", result.getSlug());
        verify(categoryRepository, times(1)).findBySlug("diecast-models");
    }

    @Test
    @DisplayName("getCategoryBySlug: should throw ResourceNotFoundException when slug does not exist")
    void getCategoryBySlug_whenNotFound_shouldThrowException() {
        // Arrange
        when(categoryRepository.findBySlug("unknown-category")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.getCategoryBySlug("unknown-category")
        );

        assertTrue(exception.getMessage().contains("Category"));
        assertTrue(exception.getMessage().contains("unknown-category"));
        verify(categoryRepository, times(1)).findBySlug("unknown-category");
    }
}
