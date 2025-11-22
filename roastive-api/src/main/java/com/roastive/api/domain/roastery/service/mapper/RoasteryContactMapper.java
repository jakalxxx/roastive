package com.roastive.api.domain.roastery.service.mapper;

import com.roastive.api.domain.roastery.dto.RoasteryContactDto;
import com.roastive.api.domain.roastery.model.RoasteryContact;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface RoasteryContactMapper {
    RoasteryContactDto toDto(RoasteryContact entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(RoasteryContactDto dto, @MappingTarget RoasteryContact entity);
}


