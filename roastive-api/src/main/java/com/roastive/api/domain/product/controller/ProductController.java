package com.roastive.api.domain.product.controller;

import com.roastive.api.domain.product.model.*;
import com.roastive.api.domain.product.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/products")
@Validated
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) { this.service = service; }

    // product master
    @GetMapping
    public List<ProductMaster> listProducts() { return service.findProducts(); }

    @GetMapping("/{id}")
    public ResponseEntity<ProductMaster> getProduct(@PathVariable UUID id) {
        Optional<ProductMaster> m = service.findProduct(id);
        return m.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record ProductMasterRequest(
            @NotNull Long roasteryId,
            @NotBlank @Size(max = 160) String productName,
            @NotBlank @Size(max = 32) String productType,
            @NotBlank @Size(max = 16) String unit,
            BigDecimal avgLossRate,
            String description,
            @NotBlank @Size(max = 32) String status,
            BigDecimal basePrice
    ) {}

    @PostMapping
    public ResponseEntity<ProductMaster> createProduct(@Valid @RequestBody ProductMasterRequest req) {
        ProductMaster m = new ProductMaster();
        m.setRoasteryId(req.roasteryId());
        m.setProductName(req.productName());
        m.setProductType(req.productType());
        m.setUnit(req.unit());
        m.setAvgLossRate(req.avgLossRate());
        m.setDescription(req.description());
        m.setStatus(req.status());
        m.setBasePrice(req.basePrice());
        m.setCreatedAt(OffsetDateTime.now());
        m.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createProduct(m));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductMaster> updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductMasterRequest req) {
        ProductMaster m = new ProductMaster();
        m.setRoasteryId(req.roasteryId());
        m.setProductName(req.productName());
        m.setProductType(req.productType());
        m.setUnit(req.unit());
        m.setAvgLossRate(req.avgLossRate());
        m.setDescription(req.description());
        m.setStatus(req.status());
        m.setBasePrice(req.basePrice());
        m.setUpdatedAt(OffsetDateTime.now());
        return service.updateProduct(id, m).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        service.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // variant
    public record VariantRequest(@NotNull UUID productId, @NotNull BigDecimal unitSize,
                                 @NotBlank @Size(max = 16) String unit, @Size(max = 64) String sku,
                                 @NotBlank @Size(max = 32) String status) {}

    @GetMapping("/variants")
    public List<ProductVariant> listVariants() { return service.findVariants(); }

    @PostMapping("/variants")
    public ResponseEntity<ProductVariant> createVariant(@Valid @RequestBody VariantRequest req) {
        ProductVariant v = new ProductVariant();
        v.setProductId(req.productId());
        v.setUnitSize(req.unitSize());
        v.setUnit(req.unit());
        v.setSku(req.sku());
        v.setStatus(req.status());
        v.setCreatedAt(OffsetDateTime.now());
        v.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createVariant(v));
    }

    @PutMapping("/variants/{id}")
    public ResponseEntity<ProductVariant> updateVariant(@PathVariable UUID id, @Valid @RequestBody VariantRequest req) {
        ProductVariant v = new ProductVariant();
        v.setProductId(req.productId());
        v.setUnitSize(req.unitSize());
        v.setUnit(req.unit());
        v.setSku(req.sku());
        v.setStatus(req.status());
        v.setUpdatedAt(OffsetDateTime.now());
        return service.updateVariant(id, v).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/variants/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable UUID id) {
        service.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }

    // recipe
    public record RecipeRequest(@NotNull UUID productId, Long siloId,
                                @NotBlank @Size(max = 160) String ingredientName,
                                @NotNull BigDecimal ratio) {}

    @GetMapping("/recipes")
    public List<ProductRecipe> listRecipes() { return service.findRecipes(); }

    @PostMapping("/recipes")
    public ResponseEntity<ProductRecipe> createRecipe(@Valid @RequestBody RecipeRequest req) {
        ProductRecipe r = new ProductRecipe();
        r.setProductId(req.productId());
        r.setSiloId(req.siloId());
        r.setIngredientName(req.ingredientName());
        r.setRatio(req.ratio());
        r.setCreatedAt(OffsetDateTime.now());
        r.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createRecipe(r));
    }

    @PutMapping("/recipes/{id}")
    public ResponseEntity<ProductRecipe> updateRecipe(@PathVariable UUID id, @Valid @RequestBody RecipeRequest req) {
        ProductRecipe r = new ProductRecipe();
        r.setProductId(req.productId());
        r.setSiloId(req.siloId());
        r.setIngredientName(req.ingredientName());
        r.setRatio(req.ratio());
        r.setUpdatedAt(OffsetDateTime.now());
        return service.updateRecipe(id, r).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable UUID id) {
        service.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    // asset
    public record AssetRequest(@NotNull UUID productId, @NotBlank @Size(max = 32) String kind,
                               @NotBlank @Size(max = 512) String url, @Size(max = 160) String title,
                               String meta, @NotBlank @Size(max = 32) String status) {}

    @GetMapping("/assets")
    public List<ProductAsset> listAssets() { return service.findAssets(); }

    @PostMapping("/assets")
    public ResponseEntity<ProductAsset> createAsset(@Valid @RequestBody AssetRequest req) {
        ProductAsset a = new ProductAsset();
        a.setProductId(req.productId());
        a.setKind(req.kind());
        a.setUrl(req.url());
        a.setTitle(req.title());
        a.setMeta(req.meta());
        a.setStatus(req.status());
        a.setCreatedAt(OffsetDateTime.now());
        a.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createAsset(a));
    }

    @PutMapping("/assets/{id}")
    public ResponseEntity<ProductAsset> updateAsset(@PathVariable UUID id, @Valid @RequestBody AssetRequest req) {
        ProductAsset a = new ProductAsset();
        a.setProductId(req.productId());
        a.setKind(req.kind());
        a.setUrl(req.url());
        a.setTitle(req.title());
        a.setMeta(req.meta());
        a.setStatus(req.status());
        a.setUpdatedAt(OffsetDateTime.now());
        return service.updateAsset(id, a).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/assets/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable UUID id) {
        service.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}


