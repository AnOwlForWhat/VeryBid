package com.verybid.backend.config;

import com.verybid.backend.model.entity.*;
import com.verybid.backend.model.enums.*;
import com.verybid.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ItemAIReportRepository itemAIReportRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking DatabaseSeeder initialization...");

        // 1. Seed Categories if empty
        Map<String, Category> categoryMap = seedCategories();

        // 2. Seed Core Users if empty
        Map<String, User> userMap = seedUsers();

        // 3. Seed Items, AI Reports & Auctions if empty
        if (itemRepository.count() == 0 && !categoryMap.isEmpty() && !userMap.isEmpty()) {
            log.info("Seeding realistic collectible items with AI reports and auctions...");
            seedItemsAndAuctions(categoryMap, userMap);
            log.info("Database seeding completed successfully!");
        }
    }

    private Map<String, Category> seedCategories() {
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

        Map<String, Category> map = new HashMap<>();
        categoryRepository.findAll().forEach(cat -> map.put(cat.getSlug(), cat));
        return map;
    }

    private Map<String, User> seedUsers() {
        Map<String, User> map = new HashMap<>();

        // Admin User
        userRepository.findByEmail("admin@verybid.com").ifPresentOrElse(
                u -> map.put("admin", u),
                () -> {
                    User admin = User.builder()
                            .email("admin@verybid.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("VeryBid Moderator Officer")
                            .phone("+84988111222")
                            .role(Role.ROLE_ADMIN)
                            .balance(new BigDecimal("10000.00"))
                            .reputationScore(100)
                            .build();
                    map.put("admin", userRepository.save(admin));
                    log.info("Seeded Admin user: admin@verybid.com");
                }
        );

        // Seller User
        userRepository.findByEmail("seller@verybid.com").ifPresentOrElse(
                u -> map.put("seller", u),
                () -> {
                    User seller = User.builder()
                            .email("seller@verybid.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Rare Collectibles Vault")
                            .phone("+84977333444")
                            .role(Role.ROLE_SELLER)
                            .balance(new BigDecimal("25000.00"))
                            .reputationScore(99)
                            .build();
                    map.put("seller", userRepository.save(seller));
                    log.info("Seeded Seller user: seller@verybid.com");
                }
        );

        // Bidder User
        userRepository.findByEmail("bidder@verybid.com").ifPresentOrElse(
                u -> map.put("bidder", u),
                () -> {
                    User bidder = User.builder()
                            .email("bidder@verybid.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Alex Chen (Collector)")
                            .phone("+84966555666")
                            .role(Role.ROLE_BIDDER)
                            .balance(new BigDecimal("15000.00"))
                            .reputationScore(97)
                            .build();
                    map.put("bidder", userRepository.save(bidder));
                    log.info("Seeded Bidder user: bidder@verybid.com");
                }
        );

        return map;
    }

    private void seedItemsAndAuctions(Map<String, Category> categories, Map<String, User> users) {
        User seller = users.get("seller");
        User bidder = users.get("bidder");
        LocalDateTime now = LocalDateTime.now();

        // =========================================================================
        // ITEM 1: PENDING_REVIEW (For Moderator Dashboard testing)
        // 1984 Apple Macintosh 128K
        // =========================================================================
        Category vintageCat = categories.get("vintage-electronics");
        Item macItem = Item.builder()
                .seller(seller)
                .category(vintageCat)
                .title("1984 Apple Macintosh 128K with Original Packaging & Mouse")
                .description("Historical first-generation Macintosh 128K signed mold case. Tested and booting System 1.0 flawlessly with CRT monitor in brilliant clarity.")
                .declaredCondition("95% Like New (Collector Grade)")
                .suggestedStartingPrice(new BigDecimal("1250.00"))
                .status(ItemStatus.PENDING_REVIEW)
                .images(new ArrayList<>())
                .build();

        macItem.getImages().addAll(List.of(
                ItemImage.builder().item(macItem).imageUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&q=80").angle(ImageAngle.FRONT).isThumbnail(true).build(),
                ItemImage.builder().item(macItem).imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&q=80").angle(ImageAngle.BACK).isThumbnail(false).build(),
                ItemImage.builder().item(macItem).imageUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&q=80").angle(ImageAngle.SERIAL_NUMBER).isThumbnail(false).build(),
                ItemImage.builder().item(macItem).imageUrl("https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=1000&q=80").angle(ImageAngle.PACKAGING).isThumbnail(false).build(),
                ItemImage.builder().item(macItem).imageUrl("https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1000&q=80").angle(ImageAngle.SCRATCH_DETAIL).isThumbnail(false).build()
        ));
        Item savedMac = itemRepository.save(macItem);

        ItemAIReport macReport = ItemAIReport.builder()
                .item(savedMac)
                .identifiedModel("1984 Apple Macintosh 128K M0001")
                .conditionRate("9.4/10 (Collector Grade)")
                .marketPriceMin(new BigDecimal("1400.00"))
                .marketPriceMax(new BigDecimal("2200.00"))
                .suggestedStartPrice(new BigDecimal("1250.00"))
                .riskFlags("SERIAL_NUMBER_VERIFIED,ORIGINAL_PACKAGING_VERIFIED,BILATERAL_PERSPECTIVE_VERIFIED,MULTI_ANGLE_INSPECTION_PASSED")
                .trustScore(94)
                .moderatorNote(null)
                .rawAiResponse("{\"provider\":\"Gemini-1.5-Flash-Vision\",\"modelIdentified\":\"1984 Apple Macintosh 128K M0001\",\"authenticityVerified\":true,\"trustScore\":94,\"estimatedValuation\":{\"min\":1400.00,\"max\":2200.00}}")
                .build();
        itemAIReportRepository.save(macReport);
        savedMac.setAiReport(macReport);

        // =========================================================================
        // ITEM 2: PENDING_REVIEW (For Moderator Dashboard testing)
        // Nike Air Mag 2011 Marty McFly
        // =========================================================================
        Category sneakerCat = categories.get("rare-sneakers");
        Item magItem = Item.builder()
                .seller(seller)
                .category(sneakerCat)
                .title("Nike Air Mag 2011 Back to the Future Limited Edition #088/1500")
                .description("Official 2011 Michael J. Fox Foundation release. LED glowing soles and luminescent buckle operational. Includes yellow anti-gravity magnetic case.")
                .declaredCondition("Deadstock Brand New")
                .suggestedStartingPrice(new BigDecimal("8500.00"))
                .status(ItemStatus.PENDING_REVIEW)
                .images(new ArrayList<>())
                .build();

        magItem.getImages().addAll(List.of(
                ItemImage.builder().item(magItem).imageUrl("https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&q=80").angle(ImageAngle.FRONT).isThumbnail(true).build(),
                ItemImage.builder().item(magItem).imageUrl("https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=1000&q=80").angle(ImageAngle.BACK).isThumbnail(false).build(),
                ItemImage.builder().item(magItem).imageUrl("https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80").angle(ImageAngle.SERIAL_NUMBER).isThumbnail(false).build(),
                ItemImage.builder().item(magItem).imageUrl("https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=80").angle(ImageAngle.PACKAGING).isThumbnail(false).build(),
                ItemImage.builder().item(magItem).imageUrl("https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80").angle(ImageAngle.SCRATCH_DETAIL).isThumbnail(false).build()
        ));
        Item savedMag = itemRepository.save(magItem);

        ItemAIReport magReport = ItemAIReport.builder()
                .item(savedMag)
                .identifiedModel("Nike Air Mag 2011 Marty McFly Edition")
                .conditionRate("9.9/10 (Deadstock / Unworn)")
                .marketPriceMin(new BigDecimal("9500.00"))
                .marketPriceMax(new BigDecimal("14000.00"))
                .suggestedStartPrice(new BigDecimal("8500.00"))
                .riskFlags("SERIAL_NUMBER_VERIFIED,AUTHENTIC_LED_SOLING,ORIGINAL_PACKAGING_VERIFIED,MULTI_ANGLE_INSPECTION_PASSED")
                .trustScore(98)
                .moderatorNote(null)
                .rawAiResponse("{\"provider\":\"Gemini-1.5-Flash-Vision\",\"modelIdentified\":\"Nike Air Mag 2011\",\"authenticityVerified\":true,\"trustScore\":98,\"estimatedValuation\":{\"min\":9500.00,\"max\":14000.00}}")
                .build();
        itemAIReportRepository.save(magReport);
        savedMag.setAiReport(magReport);

        // =========================================================================
        // ITEM 3: APPROVED + ACTIVE AUCTION with Bids
        // 1968 Custom Camaro Hot Wheels Redline
        // =========================================================================
        Category diecastCat = categories.get("diecast-models");
        Item camaroItem = Item.builder()
                .seller(seller)
                .category(diecastCat)
                .title("1968 Custom Camaro Hot Wheels Redline (White Enamel)")
                .description("Original 1968 Sweet 16 release in rare White Enamel with blue interior and bearing redline wheels. Fully intact suspension and authentic base stamping.")
                .declaredCondition("Mint 100% Unopened")
                .suggestedStartingPrice(new BigDecimal("350.00"))
                .status(ItemStatus.APPROVED)
                .images(new ArrayList<>())
                .build();

        camaroItem.getImages().addAll(List.of(
                ItemImage.builder().item(camaroItem).imageUrl("https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=1000&q=80").angle(ImageAngle.FRONT).isThumbnail(true).build(),
                ItemImage.builder().item(camaroItem).imageUrl("https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=1000&q=80").angle(ImageAngle.BACK).isThumbnail(false).build(),
                ItemImage.builder().item(camaroItem).imageUrl("https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&q=80").angle(ImageAngle.SERIAL_NUMBER).isThumbnail(false).build(),
                ItemImage.builder().item(camaroItem).imageUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&q=80").angle(ImageAngle.PACKAGING).isThumbnail(false).build()
        ));
        Item savedCamaro = itemRepository.save(camaroItem);

        ItemAIReport camaroReport = ItemAIReport.builder()
                .item(savedCamaro)
                .identifiedModel("1968 Mattel Hot Wheels Custom Camaro (Redline)")
                .conditionRate("9.8/10 (Mint Redline)")
                .marketPriceMin(new BigDecimal("380.00"))
                .marketPriceMax(new BigDecimal("600.00"))
                .suggestedStartPrice(new BigDecimal("350.00"))
                .riskFlags("SERIAL_NUMBER_VERIFIED,ORIGINAL_PACKAGING_VERIFIED,AUTHENTIC_REDLINE_WHEELS")
                .trustScore(96)
                .moderatorNote("Phê duyệt: Đã đối soát tem dập nổi Mattel 1968 chính hãng.")
                .build();
        itemAIReportRepository.save(camaroReport);
        savedCamaro.setAiReport(camaroReport);

        Auction camaroAuction = Auction.builder()
                .item(savedCamaro)
                .startPrice(new BigDecimal("350.00"))
                .stepPrice(new BigDecimal("20.00"))
                .buyNowPrice(new BigDecimal("650.00"))
                .currentPrice(new BigDecimal("390.00"))
                .currentWinner(bidder)
                .startTime(now.minusHours(12))
                .endTime(now.plusHours(36))
                .status(AuctionStatus.ACTIVE)
                .bids(new ArrayList<>())
                .build();
        Auction savedCamaroAuction = auctionRepository.save(camaroAuction);

        Bid b1 = Bid.builder().auction(savedCamaroAuction).bidder(bidder).bidAmount(new BigDecimal("370.00")).isAutoBid(false).createdAt(now.minusHours(8)).build();
        Bid b2 = Bid.builder().auction(savedCamaroAuction).bidder(bidder).bidAmount(new BigDecimal("390.00")).isAutoBid(false).createdAt(now.minusHours(2)).build();
        bidRepository.saveAll(List.of(b1, b2));

        // =========================================================================
        // ITEM 4: APPROVED + ACTIVE AUCTION (Closing Soon)
        // Sony Walkman TPS-L2 1979 First Edition
        // =========================================================================
        Item walkmanItem = Item.builder()
                .seller(seller)
                .category(vintageCat)
                .title("Sony Walkman TPS-L2 1979 First Edition Cassette Player")
                .description("The legendary original personal stereo with dual headphone jacks and Hotline button. Fully refurbished with new belts and pinch rollers.")
                .declaredCondition("Near Mint 95%")
                .suggestedStartingPrice(new BigDecimal("600.00"))
                .status(ItemStatus.APPROVED)
                .images(new ArrayList<>())
                .build();

        walkmanItem.getImages().addAll(List.of(
                ItemImage.builder().item(walkmanItem).imageUrl("https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1000&q=80").angle(ImageAngle.FRONT).isThumbnail(true).build(),
                ItemImage.builder().item(walkmanItem).imageUrl("https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=1000&q=80").angle(ImageAngle.BACK).isThumbnail(false).build(),
                ItemImage.builder().item(walkmanItem).imageUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&q=80").angle(ImageAngle.SERIAL_NUMBER).isThumbnail(false).build()
        ));
        Item savedWalkman = itemRepository.save(walkmanItem);

        ItemAIReport walkmanReport = ItemAIReport.builder()
                .item(savedWalkman)
                .identifiedModel("Sony Walkman TPS-L2 (First Production Run)")
                .conditionRate("9.2/10 (Refurbished Mint)")
                .marketPriceMin(new BigDecimal("700.00"))
                .marketPriceMax(new BigDecimal("1100.00"))
                .suggestedStartPrice(new BigDecimal("600.00"))
                .riskFlags("SERIAL_NUMBER_VERIFIED,ORIGINAL_BLUE_SILVER_FINISH")
                .trustScore(93)
                .moderatorNote("Phê duyệt: Máy nguyên bản, cơ hoạt động chuẩn xác.")
                .build();
        itemAIReportRepository.save(walkmanReport);
        savedWalkman.setAiReport(walkmanReport);

        Auction walkmanAuction = Auction.builder()
                .item(savedWalkman)
                .startPrice(new BigDecimal("600.00"))
                .stepPrice(new BigDecimal("30.00"))
                .buyNowPrice(new BigDecimal("1100.00"))
                .currentPrice(new BigDecimal("660.00"))
                .currentWinner(bidder)
                .startTime(now.minusHours(18))
                .endTime(now.plusMinutes(45)) // Closing soon!
                .status(AuctionStatus.ACTIVE)
                .bids(new ArrayList<>())
                .build();
        Auction savedWalkmanAuction = auctionRepository.save(walkmanAuction);

        Bid wb1 = Bid.builder().auction(savedWalkmanAuction).bidder(bidder).bidAmount(new BigDecimal("630.00")).isAutoBid(false).createdAt(now.minusHours(4)).build();
        Bid wb2 = Bid.builder().auction(savedWalkmanAuction).bidder(bidder).bidAmount(new BigDecimal("660.00")).isAutoBid(false).createdAt(now.minusMinutes(30)).build();
        bidRepository.saveAll(List.of(wb1, wb2));

        // =========================================================================
        // ITEM 5: APPROVED + ACTIVE AUCTION
        // Omega Speedmaster Moonwatch 1969
        // =========================================================================
        Category watchCat = categories.get("luxury-watches");
        Item watchItem = Item.builder()
                .seller(seller)
                .category(watchCat)
                .title("Omega Speedmaster Professional Moonwatch 1969 Cal. 861")
                .description("Vintage ref 145.022-69 with stepped dial and Dot Over 90 (DO90) bezel. Serviced chronograph movement keeping chronometer grade time.")
                .declaredCondition("Excellent / Serviced")
                .suggestedStartingPrice(new BigDecimal("4200.00"))
                .status(ItemStatus.APPROVED)
                .images(new ArrayList<>())
                .build();

        watchItem.getImages().addAll(List.of(
                ItemImage.builder().item(watchItem).imageUrl("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=80").angle(ImageAngle.FRONT).isThumbnail(true).build(),
                ItemImage.builder().item(watchItem).imageUrl("https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&q=80").angle(ImageAngle.BACK).isThumbnail(false).build(),
                ItemImage.builder().item(watchItem).imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80").angle(ImageAngle.SERIAL_NUMBER).isThumbnail(false).build(),
                ItemImage.builder().item(watchItem).imageUrl("https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=1000&q=80").angle(ImageAngle.PACKAGING).isThumbnail(false).build()
        ));
        Item savedWatch = itemRepository.save(watchItem);

        ItemAIReport watchReport = ItemAIReport.builder()
                .item(savedWatch)
                .identifiedModel("Omega Speedmaster Professional 145.022-69")
                .conditionRate("9.6/10 (Collector Grade)")
                .marketPriceMin(new BigDecimal("4800.00"))
                .marketPriceMax(new BigDecimal("7500.00"))
                .suggestedStartPrice(new BigDecimal("4200.00"))
                .riskFlags("SERIAL_NUMBER_VERIFIED,DO90_BEZEL_AUTHENTIC,STEPPED_DIAL_CONFIRMED,MULTI_ANGLE_INSPECTION_PASSED")
                .trustScore(98)
                .moderatorNote("Phê duyệt: Máy Calibre 861 số máy khớp nắp đáy 1969.")
                .build();
        itemAIReportRepository.save(watchReport);
        savedWatch.setAiReport(watchReport);

        Auction watchAuction = Auction.builder()
                .item(savedWatch)
                .startPrice(new BigDecimal("4200.00"))
                .stepPrice(new BigDecimal("150.00"))
                .buyNowPrice(new BigDecimal("7200.00"))
                .currentPrice(new BigDecimal("4500.00"))
                .currentWinner(bidder)
                .startTime(now.minusHours(24))
                .endTime(now.plusHours(24))
                .status(AuctionStatus.ACTIVE)
                .bids(new ArrayList<>())
                .build();
        Auction savedWatchAuction = auctionRepository.save(watchAuction);

        Bid watchBid = Bid.builder().auction(savedWatchAuction).bidder(bidder).bidAmount(new BigDecimal("4500.00")).isAutoBid(false).createdAt(now.minusHours(10)).build();
        bidRepository.save(watchBid);

        // =========================================================================
        // ITEM 6: APPROVED + UPCOMING AUCTION
        // First Edition Shadowless Charizard Holo
        // =========================================================================
        Category artCat = categories.get("antiques-art");
        Item charizardItem = Item.builder()
                .seller(seller)
                .category(artCat)
                .title("First Edition Base Set Charizard Shadowless Holographic #4/102")
                .description("The grail of trading card games. 1999 Wizards of the Coast Base Set 1st Edition Shadowless Charizard in pristine collector condition.")
                .declaredCondition("PSA 9 Near Mint-Mint")
                .suggestedStartingPrice(new BigDecimal("2800.00"))
                .status(ItemStatus.APPROVED)
                .images(new ArrayList<>())
                .build();

        charizardItem.getImages().addAll(List.of(
                ItemImage.builder().item(charizardItem).imageUrl("https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=1000&q=80").angle(ImageAngle.FRONT).isThumbnail(true).build(),
                ItemImage.builder().item(charizardItem).imageUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&q=80").angle(ImageAngle.BACK).isThumbnail(false).build(),
                ItemImage.builder().item(charizardItem).imageUrl("https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&q=80").angle(ImageAngle.SERIAL_NUMBER).isThumbnail(false).build()
        ));
        Item savedCharizard = itemRepository.save(charizardItem);

        ItemAIReport charizardReport = ItemAIReport.builder()
                .item(savedCharizard)
                .identifiedModel("1999 Pokemon 1st Edition Shadowless Charizard #4")
                .conditionRate("9.7/10 (Near Mint-Mint)")
                .marketPriceMin(new BigDecimal("3200.00"))
                .marketPriceMax(new BigDecimal("5500.00"))
                .suggestedStartPrice(new BigDecimal("2800.00"))
                .riskFlags("SERIAL_NUMBER_VERIFIED,SHADOWLESS_FRAME_AUTHENTIC,HOLO_FOIL_VERIFIED")
                .trustScore(97)
                .moderatorNote("Phê duyệt: Thẻ chuẩn 1st Edition Shadowless, viền và góc nguyên bản.")
                .build();
        itemAIReportRepository.save(charizardReport);
        savedCharizard.setAiReport(charizardReport);

        Auction charizardAuction = Auction.builder()
                .item(savedCharizard)
                .startPrice(new BigDecimal("2800.00"))
                .stepPrice(new BigDecimal("100.00"))
                .buyNowPrice(new BigDecimal("5500.00"))
                .currentPrice(new BigDecimal("2800.00"))
                .currentWinner(null)
                .startTime(now.plusHours(8))
                .endTime(now.plusHours(56))
                .status(AuctionStatus.UPCOMING)
                .bids(new ArrayList<>())
                .build();
        auctionRepository.save(charizardAuction);
    }
}
