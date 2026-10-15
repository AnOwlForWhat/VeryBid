package com.verybid.backend.config;

import com.verybid.backend.model.entity.Category;
import com.verybid.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            log.info("Seeding initial collectible categories...");
            List<Category> categories = List.of(
                    Category.builder()
                            .name("Diecast Models")
                            .slug("diecast-models")
                            .description("Scale model supercars, classics, and limited edition diecasts")
                            .build(),
                    Category.builder()
                            .name("Vintage Electronics")
                            .slug("vintage-electronics")
                            .description("Retro gaming consoles, analog audio gear, and rare vintage tech")
                            .build(),
                    Category.builder()
                            .name("Rare Sneakers")
                            .slug("rare-sneakers")
                            .description("Deadstock kicks, limited collabs, and collector footwear")
                            .build(),
                    Category.builder()
                            .name("Antique & Fine Art")
                            .slug("antiques-art")
                            .description("Authentic historical artifacts, sculptures, and fine art pieces")
                            .build(),
                    Category.builder()
                            .name("Luxury Watches")
                            .slug("luxury-watches")
                            .description("Swiss chronographs, vintage timepieces, and rare horology")
                            .build()
            );

            categoryRepository.saveAll(categories);
            log.info("Successfully seeded {} categories.", categories.size());
        }
    }
}
