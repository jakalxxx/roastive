package com.roastive.api.domain.product.service;

import com.roastive.api.domain.product.model.*;
import com.roastive.api.domain.product.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class ProductService {
    private final ProductMasterRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final ProductRecipeRepository recipeRepo;
    private final ProductAssetRepository assetRepo;
    private final ProductBasePriceRepository basePriceRepo;
    private final ProductRecipeSetRepository recipeSetRepo;

    public ProductService(ProductMasterRepository productRepo,
                          ProductVariantRepository variantRepo,
                          ProductRecipeRepository recipeRepo,
                          ProductAssetRepository assetRepo,
                          ProductBasePriceRepository basePriceRepo,
                          ProductRecipeSetRepository recipeSetRepo) {
        this.productRepo = productRepo;
        this.variantRepo = variantRepo;
        this.recipeRepo = recipeRepo;
        this.assetRepo = assetRepo;
        this.basePriceRepo = basePriceRepo;
        this.recipeSetRepo = recipeSetRepo;
    }

    // product master
    public List<ProductMaster> findProducts() { return productRepo.findAll(); }
    public List<ProductMaster> findProductsByRoastery(UUID roasteryId) {
        if (roasteryId == null) return findProducts();
        return productRepo.findByRoasteryId(roasteryId);
    }
    public Optional<ProductMaster> findProduct(UUID id) { return productRepo.findById(id); }
    @Transactional public ProductMaster createProduct(ProductMaster m) { return productRepo.save(m); }
    @Transactional public Optional<ProductMaster> updateProduct(UUID id, ProductMaster u) {
        return productRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setProductName(u.getProductName());
            e.setProductType(u.getProductType());
            e.setUnit(u.getUnit());
            e.setAvgLossRate(u.getAvgLossRate());
            e.setDescription(u.getDescription());
            e.setStatus(u.getStatus());
            e.setBasePrice(u.getBasePrice());
            e.setUpdatedAt(u.getUpdatedAt());
            return productRepo.save(e);
        });
    }
    @Transactional public void deleteProduct(UUID id) { productRepo.deleteById(id); }

    // variant
    public List<ProductVariant> findVariants() { return variantRepo.findAll(); }
    public Optional<ProductVariant> findVariant(UUID id) { return variantRepo.findById(id); }
    @Transactional public ProductVariant createVariant(ProductVariant v) { return variantRepo.save(v); }
    @Transactional public Optional<ProductVariant> updateVariant(UUID id, ProductVariant u) {
        return variantRepo.findById(id).map(e -> {
            e.setProductId(u.getProductId());
            e.setUnitSize(u.getUnitSize());
            e.setUnit(u.getUnit());
            e.setSku(u.getSku());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return variantRepo.save(e);
        });
    }
    @Transactional public void deleteVariant(UUID id) { variantRepo.deleteById(id); }

    // recipe
    public List<ProductRecipe> findRecipes() { return recipeRepo.findAll(); }
    public Optional<ProductRecipe> findRecipe(UUID id) { return recipeRepo.findById(id); }
    @Transactional public ProductRecipe createRecipe(ProductRecipe r) { return recipeRepo.save(r); }
    @Transactional public Optional<ProductRecipe> updateRecipe(UUID id, ProductRecipe u) {
        return recipeRepo.findById(id).map(e -> {
            e.setProductId(u.getProductId());
            e.setSiloId(u.getSiloId());
            e.setIngredientName(u.getIngredientName());
            e.setRatio(u.getRatio());
            e.setUpdatedAt(u.getUpdatedAt());
            return recipeRepo.save(e);
        });
    }
    @Transactional public void deleteRecipe(UUID id) { recipeRepo.deleteById(id); }

    // asset
    public List<ProductAsset> findAssets() { return assetRepo.findAll(); }
    public Optional<ProductAsset> findAsset(UUID id) { return assetRepo.findById(id); }
    @Transactional public ProductAsset createAsset(ProductAsset a) { return assetRepo.save(a); }
    @Transactional public Optional<ProductAsset> updateAsset(UUID id, ProductAsset u) {
        return assetRepo.findById(id).map(e -> {
            e.setProductId(u.getProductId());
            e.setKind(u.getKind());
            e.setUrl(u.getUrl());
            e.setTitle(u.getTitle());
            e.setMeta(u.getMeta());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return assetRepo.save(e);
        });
    }
    @Transactional public void deleteAsset(UUID id) { assetRepo.deleteById(id); }

    // base price
    public List<ProductBasePrice> findBasePrices() { return basePriceRepo.findAll(); }
    public Optional<ProductBasePrice> findBasePrice(UUID id) { return basePriceRepo.findById(id); }
    public List<ProductBasePrice> findBasePricesByProduct(UUID productId) { return basePriceRepo.findByProductId(productId); }
    @Transactional public ProductBasePrice createBasePrice(ProductBasePrice p) { return basePriceRepo.save(p); }
    @Transactional public Optional<ProductBasePrice> updateBasePrice(UUID id, ProductBasePrice u) {
        return basePriceRepo.findById(id).map(e -> {
            e.setProductId(u.getProductId());
            e.setCurrency(u.getCurrency());
            e.setAmount(u.getAmount());
            e.setPriceLabel(u.getPriceLabel());
            e.setEffectiveFrom(u.getEffectiveFrom());
            e.setEffectiveTo(u.getEffectiveTo());
            e.setUpdatedAt(u.getUpdatedAt());
            return basePriceRepo.save(e);
        });
    }
    @Transactional public void deleteBasePrice(UUID id) { basePriceRepo.deleteById(id); }

    // recipe set
    public List<ProductRecipeSet> findRecipeSets() { return recipeSetRepo.findAll(); }
    public Optional<ProductRecipeSet> findRecipeSet(UUID id) { return recipeSetRepo.findById(id); }
    public List<ProductRecipeSet> findRecipeSetsByProduct(UUID productId) { return recipeSetRepo.findByProductId(productId); }
    @Transactional public ProductRecipeSet createRecipeSet(ProductRecipeSet set) { return recipeSetRepo.save(set); }
    @Transactional public Optional<ProductRecipeSet> updateRecipeSet(UUID id, ProductRecipeSet u) {
        return recipeSetRepo.findById(id).map(e -> {
            e.setProductId(u.getProductId());
            e.setSetName(u.getSetName());
            e.setDescription(u.getDescription());
            e.setStatus(u.getStatus());
            e.setIngredients(u.getIngredients());
            e.setUpdatedAt(u.getUpdatedAt());
            return recipeSetRepo.save(e);
        });
    }
    @Transactional public void deleteRecipeSet(UUID id) { recipeSetRepo.deleteById(id); }
}


