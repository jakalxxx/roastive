package com.roastive.api.domain.roastery.service.mapper;

import com.roastive.api.domain.roastery.dto.RoasteryAddressDto;
import com.roastive.api.domain.roastery.model.RoasteryAddress;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface RoasteryAddressMapper {
    @Mapping(target = "addressTypeLabel", ignore = true)
    RoasteryAddressDto toDto(RoasteryAddress entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(RoasteryAddressDto source, @MappingTarget RoasteryAddress target);
}


