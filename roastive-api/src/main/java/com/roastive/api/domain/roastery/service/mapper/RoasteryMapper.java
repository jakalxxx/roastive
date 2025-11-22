package com.roastive.api.domain.roastery.service.mapper;

import com.roastive.api.domain.roastery.dto.RoasteryRequestDto;
import com.roastive.api.domain.roastery.model.Roastery;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface RoasteryMapper {
    Roastery toEntity(RoasteryRequestDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(RoasteryRequestDto dto, @MappingTarget Roastery entity);
}


