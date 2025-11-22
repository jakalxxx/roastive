package com.roastive.api.domain.supplier.service.mapper;

import com.roastive.api.domain.supplier.dto.SupplierDto;
import com.roastive.api.domain.supplier.dto.SupplierRequest;
import com.roastive.api.domain.supplier.model.Supplier;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface SupplierMapper {
    Supplier toEntity(SupplierRequest req);
    SupplierDto toDto(Supplier entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(SupplierRequest req, @MappingTarget Supplier entity);
}


