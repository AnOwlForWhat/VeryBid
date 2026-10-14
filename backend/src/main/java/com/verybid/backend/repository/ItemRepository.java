package com.verybid.backend.repository;

import com.verybid.backend.model.entity.Item;
import com.verybid.backend.model.enums.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {

    List<Item> findBySellerId(UUID sellerId);

    List<Item> findByCategoryId(Long categoryId);

    List<Item> findByStatus(ItemStatus status);
}
