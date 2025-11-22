# Cursor Prompt — Roastive (domain/roastery/controller 구조 반영, 100% 일치판)

> 현재 프로젝트에서 **컨트롤러가 `domain/roastery/controller`** 하위에 위치하는 구조를 반영한 지시서입니다. 그대로 Cursor에 붙여넣어 실행하세요.

---

## 전제(이미 존재)
- `com.roastive.api.domain.roastery.model.RoasteryAddress`
  - `public static class Request`
  - `public static RoasteryAddress from(Request, java.util.UUID roasteryId, boolean isDefault)`
  - `public RoasteryAddress apply(Request)`
  - 주요 필드: `addressId`, `roasteryId`, `addressType`, `postalCode`, `addressLine1`, `addressLine2`, `city`, `state`, `country`, `default`, `createdAt`

- **패키지 컨벤션 (이 프롬프트에서 사용할 실제 경로)**
  - Controller: `com.roastive.api.domain.roastery.controller`
  - Service:   `com.roastive.api.domain.roastery.service`
  - DTO:       `com.roastive.api.domain.roastery.dto`
  - Model:     `com.roastive.api.domain.roastery.model`
  - Repository:`com.roastive.api.domain.roastery.repository`

> 위 전제와 다를 경우, 해당 이름만 바꾸지 말고 일관되게 전체 검색/치환 규칙을 명시하여 일괄 변경하세요.

---

## 목표
- 한 화면의 폼에서 들어오는 **복합 데이터**를 한 번에 처리하기 위한 **Composite Request/Response**, **트랜잭션 서비스**, **단일 REST 엔드포인트** 구현.
- JSON 키는 **snake_case**, 서버 내부 필드는 **camelCase**. `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)` 사용.
- `addressType=HEADQUARTERS`는 **업서트**(존재 시 수정, 없으면 생성).

---

## 생성·수정 대상 (패키지/경로 고정)
1) **Controller (신규)**
   - `com.roastive.api.domain.roastery.controller.RoasteryController`

2) **Service (신규)**
   - `com.roastive.api.domain.roastery.service.RoasteryService`

3) **DTO (신규)**
   - `com.roastive.api.domain.roastery.dto.RoasteryRequest`
   - `com.roastive.api.domain.roastery.dto.RoasteryResponse`

4) **Repository (존재 가정, 없으면 생성)**
   - `com.roastive.api.domain.roastery.repository.RoasteryRepository`
   - `com.roastive.api.domain.roastery.repository.RoasteryAddressRepository`
   - `com.roastive.api.domain.roastery.repository.RoasterySiteRepository`
   - `com.roastive.api.domain.roastery.repository.RoasteryContactRepository`

5) **Model (존재 가정, 없으면 스켈레톤 생성)**
   - `com.roastive.api.domain.roastery.model.Roastery`
   - `com.roastive.api.domain.roastery.model.RoasterySite`
   - `com.roastive.api.domain.roastery.model.RoasteryContact`
   - `com.roastive.api.domain.roastery.model.RoasteryAddress`

---

## 구체 구현 지시

### A. Composite Request
**파일**: `com.roastive.api.domain.roastery.dto.RoasteryRequest`

- 구조
  - 최상위 필드
    - `@jakarta.validation.Valid public com.roastive.api.domain.roastery.model.RoasteryAddress.Request headquarters;`
    - `@jakarta.validation.Valid public RoasterySetupRequest.RoasterySiteRequest site;`
    - `@jakarta.validation.Valid public java.util.List<RoasterySetupRequest.ContactRequest> contacts;`
  - 내부 정적 클래스(같은 파일 내부 선언)
    - `RoasterySiteRequest`: `siteName`, `type`(기본 OFFICE), `siteCode`(옵션)
    - `ContactRequest`: `name(@NotBlank)`, `email(@Email)`, `phone(옵션)`
- 각 클래스에 `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)` 적용

### B. Composite Response
**파일**: `com.roastive.api.domain.roastery.dto.RoasteryResponse`

- `record` 또는 일반 `class`
- 뷰모델 필드
  - `addressId(java.util.UUID)`, `addressType(java.lang.String)`
  - `siteId(java.util.UUID)`, `siteName(java.lang.String)`, `siteType(java.lang.String)`
  - `contacts(java.util.List<ContactView>)`
- 정적 팩토리
  - `public static RoasteryResponse of(com.roastive.api.domain.roastery.model.RoasteryAddress a, com.roastive.api.domain.roastery.model.RoasterySite s, java.util.List<com.roastive.api.domain.roastery.model.RoasteryContact> cs)`
- 내부 `record ContactView(java.util.UUID contactId, String name, String email, String phone)` + `static ContactView from(RoasteryContact c)`
- 응답에도 `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)` 적용

### C. Controller (domain/roastery/controller 경로)
**파일**: `com.roastive.api.domain.roastery.controller.RoasterySetupController`

- 애너테이션: `@org.springframework.web.bind.annotation.RestController`, `@org.springframework.web.bind.annotation.RequestMapping("/api/roastery")`, `@org.springframework.validation.annotation.Validated`
- 엔드포인트: `POST /api/roastery/setup`
- 시그니처:
  ```java
  public org.springframework.http.ResponseEntity<?> setup(
      @org.springframework.web.bind.annotation.RequestHeader("X-Roastery-Id") java.util.UUID roasteryId,
      @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.roastive.api.domain.roastery.dto.RoasterySetupRequest req,
      @org.springframework.web.bind.annotation.RequestHeader(value = "X-Idempotency-Key", required = false) String idemKey
  )
  ```
- 응답 규격
  - 성공: `200` + `java.util.Map.of("ok", true, "data", <RoasterySetupResponse>)`
  - 검증 실패: `400` + `java.util.Map.of("ok", false, "message", "validation error", "fieldErrors", [...])`

### D. Service (domain/roastery/service 경로)
**파일**: `com.roastive.api.domain.roastery.service.RoasterySetupService`

- 애너테이션: `@org.springframework.stereotype.Service`
- 메서드:
  ```java
  @org.springframework.transaction.annotation.Transactional
  public com.roastive.api.domain.roastery.dto.RoasterySetupResponse setup(
      java.util.UUID roasteryId,
      com.roastive.api.domain.roastery.dto.RoasterySetupRequest req
  )
  ```
- 로직(정확 매칭)
  1) **HQ 업서트**
     - `var hqReq = req.headquarters;`
     - `boolean isDefault = (hqReq != null && "HEADQUARTERS".equalsIgnoreCase(hqReq.addressType));`
     - 조회: `addressRepository.findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(roasteryId, "HEADQUARTERS")`
     - 분기: 존재 시 `existing.apply(hqReq)` 후 save, 없으면 `RoasteryAddress.from(hqReq, roasteryId, isDefault)` 후 save
  2) **사이트 생성**
     - `var siteReq = req.site;`
     - `String siteType = (siteReq != null && siteReq.type != null && !siteReq.type.isBlank()) ? siteReq.type : "OFFICE";`
     - 엔티티 필드(정확 명칭 가정): `siteId`, `roasteryId`, `siteCode`, `siteName`, `type`, `status`, `addressId`, `default`, `createdAt`
     - 기본값: `status="ACTIVE"`, `default=isDefault`
     - `addressId = savedAddress.getAddressId()`
  3) **담당자 저장**
     - 입력: `req.contacts` null-safe
     - 엔티티 필드(정확 명칭 가정): `contactId`, `roasteryId`, `siteId`, `name`, `email`, `phone`, `createdAt`
     - `saveAll` 후 반환 목록 획득
  4) **최종 응답**
     - `RoasterySetupResponse.of(savedAddress, savedSite, savedContacts)`

### E. Repository
- `com.roastive.api.domain.roastery.repository.RoasteryAddressRepository`
  ```java
  com.roastive.api.domain.roastery.model.RoasteryAddress findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(java.util.UUID roasteryId, String addressType);
  ```
- `RoasterySiteRepository`, `RoasteryContactRepository`: `extends org.springframework.data.jpa.repository.JpaRepository<..., java.util.UUID>`

### F. Model (스켈레톤이 필요한 경우)
- `com.roastive.api.domain.roastery.model.RoasterySite`
  - 필드: `siteId`, `roasteryId`, `siteCode`, `siteName`, `type`, `status`, `addressId`, `default`, `createdAt`
- `com.roastive.api.domain.roastery.model.RoasteryContact`
  - 필드: `contactId`, `roasteryId`, `siteId`, `name`, `email`, `phone`, `createdAt`

### G. 에러 처리
- 전역 `@org.springframework.web.bind.annotation.ControllerAdvice`가 없으면 추가
  - `org.springframework.web.bind.MethodArgumentNotValidException` → `{ ok:false, message:"validation error", fieldErrors:[{field, reason}] }`
  - 기타 예외 → `{ ok:false, message:"internal error" }` (로그 기록)

### H. 테스트(권장)
- `RoasterySetupServiceTest`: HQ 업서트(기존/신규), contacts 다건 저장, site.type 기본값 적용
- `RoasterySetupControllerTest`: 200/400 케이스, `X-Roastery-Id` 헤더 필수 검사

---

## 수용 기준 (Acceptance)
- `POST /api/roastery/setup` 성공 시 `200 + { ok:true, data: {...} }`로 Address/Site/Contacts 반환.
- `headquarters.address_type=HEADQUARTERS`이면 기존 HQ 존재 시 업데이트, 없으면 생성.
- `site.type` 미지정 시 `"OFFICE"` 저장.
- `headquarters.country` 미지정 시 `"KR"` 저장.
- `contacts` 비어도 실패하지 않음.
- 전체 저장은 **단일 @Transactional** 경계 안에서 원자적으로 처리.
- Validation 실패 시 `400 + { ok:false, message, fieldErrors }`.
