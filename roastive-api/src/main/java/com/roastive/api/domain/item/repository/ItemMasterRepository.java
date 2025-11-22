package com.roastive.api.domain.item.repository;

import com.roastive.api.domain.item.model.ItemMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ItemMasterRepository extends JpaRepository<ItemMaster, UUID> {}


