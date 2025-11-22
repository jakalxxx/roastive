package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.Roastery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * 로스터리 저장소 인터페이스입니다.
 * 로스터리 엔티티의 데이터 접근을 관리합니다.
 */
public interface RoasteryRepository extends JpaRepository<Roastery, UUID> {
    /**
     * 사업자 등록 번호로 로스터리 존재 여부를 확인합니다.
     * 
     * @param businessRegNo 사업자 등록 번호
     * @return 해당 사업자 등록 번호를 가진 로스터리가 존재하면 true, 그렇지 않으면 false
     */
    boolean existsByBusinessRegNo(String businessRegNo);
}