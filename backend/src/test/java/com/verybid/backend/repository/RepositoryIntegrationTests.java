package com.verybid.backend.repository;

import com.verybid.backend.model.entity.Category;
import com.verybid.backend.model.entity.User;
import com.verybid.backend.model.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class RepositoryIntegrationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    @DisplayName("Should save user and find by email")
    void testSaveAndFindByEmail() {
        User user = User.builder()
                .email("collector@verybid.com")
                .passwordHash("hashed_password_sample")
                .fullName("Collector John")
                .phone("+84901234567")
                .role(Role.ROLE_BIDDER)
                .balance(new BigDecimal("1000.00"))
                .build();

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(userRepository.existsByEmail("collector@verybid.com")).isTrue();

        Optional<User> found = userRepository.findByEmail("collector@verybid.com");
        assertThat(found).isPresent();
        assertThat(found.get().getFullName()).isEqualTo("Collector John");
        assertThat(found.get().getReputationScore()).isEqualTo(100);
    }

    @Test
    @DisplayName("Should save category and find by slug")
    void testSaveAndFindBySlug() {
        Category category = Category.builder()
                .name("Diecast Cars")
                .slug("diecast-cars")
                .description("Model scale collectible cars")
                .build();

        categoryRepository.save(category);

        assertThat(categoryRepository.existsBySlug("diecast-cars")).isTrue();
        assertThat(categoryRepository.existsByName("Diecast Cars")).isTrue();

        Optional<Category> found = categoryRepository.findBySlug("diecast-cars");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Diecast Cars");
    }
}
