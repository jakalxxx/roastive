# Cursor Prompt — Roastive 패키지/필드 실명 반영판 (100% 일치 버전)

> 아래 프롬프트는 현재 코드베이스 구조와 우리가 이미 반영한 엔티티/패키지 네임을 기준으로 **정확히 매칭**시켜 작성되었습니다. 그대로 Cursor에 붙여넣어 실행 지시하면 됩니다.

---

## 전제(이미 존재)
- `com.roastive.api.domain.roastery.model.RoasteryAddress`
  - 내부 정적 모델: `public static class Request`  (이미 추가됨)
  - 팩토리/업데이트: `public static RoasteryAddress from(Request, UUID roasteryId, boolean isDefault)`, `public RoasteryAddress apply(Request)`  (이미 추가됨)
  - 주요 필드: `addressId`, `roasteryId`, `addressType`, `postalCode`, `addressLine1`, `addressLine2`, `city`, `state`, `country`, `default`, `createdAt`
- 컨트롤러/서비스 패키지 컨벤션
  - Controller: `com.roastive.api.application.roastery.controller`
  - Service: `com.roastive.api.application.roastery.service`
- Domain/DTO/Repository 패키지 컨벤션
  - DTO: `com.roastive.api.domain.roastery.dto`
  - Model: `com.roastive.api.domain.roastery.model`
  - Repository: `com.roastive.api.domain.roastery.repository`

> 위 전제와 다르면 **해당 네임만 바꾸지 말고** 전체 검색/치환 규칙을 명시해 패키지를 일괄 교정하세요.

---

## 목표
- 한 화면에서 **여러 테이블 데이터를 한 번에** 처리하기 위한 **Composite Request/Response**와 **트랜잭션 서비스 + 단일 REST 엔드포인트** 구현.
- JSON 키는 **snake_case**, 서버 내부는 **camelCase**. `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)` 적용.
- HQ 주소(`addressType=HEADQUARTERS`)는 **업서트**: 있으면 수정, 없으면 생성.

---

## 생성·수정 대상 (패키지/경로 고정)
1) **Controller**
   - `com.roastive.api.application.roastery.controller.RoasterySetupController` (신규)

2) **Service**
   - `com.roastive.api.application.roastery.service.RoasterySetupService` (신규, `@Service`)

3) **DTO**
   - `com.roastive.api.domain.roastery.dto.RoasterySetupRequest` (신규, Composite Request)
   - `com.roastive.api.domain.roastery.dto.RoasterySetupResponse` (신규, Composite Response/ViewModel)

4) **Repository (존재 가정, 없으면 생성)**
   - `com.roastive.api.domain.roastery.repository.RoasteryAddressRepository`
   - `com.roastive.api.domain.roastery.repository.RoasterySiteRepository`
   - `com.roastive.api.domain.roastery.repository.RoasteryContactRepository`

5) **Model (존재 가정, 없으면 최소 스켈레톤 생성)**
   - `com.roastive.api.domain.roastery.model.RoasterySite`
   - `com.roastive.api.domain.roastery.model.RoasteryContact`

---

## 구체 지시

### A. Composite Request
**파일**: `com.roastive.api.domain.roastery.dto.RoasterySetupRequest`

- 구조
  - 최상위 필드
    - `@Valid public RoasteryAddress.Request headquarters;`  
      *(이미 존재하는 모델의 Request 재사용 — snake_case 매핑 포함)*
    - `@Valid public RoasterySetupRequest.RoasterySiteRequest site;`
    - `@Valid public java.util.List<RoasterySetupRequest.ContactRequest> contacts;`
  - 내부 정적 클래스(같은 파일 내부에 선언)
    - `RoasterySiteRequest`: `siteName`, `type`(기본값 OFFICE), `siteCode`(옵션)
    - `ContactRequest`: `name(@NotBlank)`, `email(@Email)`, `phone(옵션)`
- 모든 클래스에 `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)` 적용
- Bean Validation 사용(`jakarta.validation.*`)

### B. Composite Response
**파일**: `com.roastive.api.domain.roastery.dto.RoasterySetupResponse`

- `record` 혹은 일반 `class`
- 필드 (ViewModel)
  - `addressId(UUID)`, `addressType(String)`
  - `siteId(UUID)`, `siteName(String)`, `siteType(String)`
  - `contacts(List<ContactView>)`
- 정적 팩토리
  - `public static RoasterySetupResponse of(RoasteryAddress a, RoasterySite s, List<RoasteryContact> cs)`
- 내부 `record ContactView(UUID contactId, String name, String email, String phone)` + `static ContactView from(RoasteryContact c)`
- 응답도 `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)` 적용

### C. Controller
**파일**: `com.roastive.api.application.roastery.controller.RoasterySetupController`

- 클래스 애너테이션: `@RestController`, `@RequestMapping("/api/roastery")`, `@Validated`
- 엔드포인트: `POST /api/roastery/setup`
- 시그니처:
  ```java
  public org.springframework.http.ResponseEntity<?> setup(
      @RequestHeader("X-Roastery-Id") java.util.UUID roasteryId,
      @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.roastive.api.domain.roastery.dto.RoasterySetupRequest req,
      @RequestHeader(value = "X-Idempotency-Key", required = false) String idemKey
  )
  ```
- 응답 규격
  - 성공: `200 OK` + `Map.of("ok", true, "data", <RoasterySetupResponse>)`
  - 실패(검증): `400` + `Map.of("ok", false, "message", "validation error", "fieldErrors", [...])`

### D. Service
**파일**: `com.roastive.api.application.roastery.service.RoasterySetupService`

- 애너테이션: `@Service`
- 메서드: 
  ```java
  @org.springframework.transaction.annotation.Transactional
  public com.roastive.api.domain.roastery.dto.RoasterySetupResponse setup(
      java.util.UUID roasteryId,
      com.roastive.api.domain.roastery.dto.RoasterySetupRequest req
  )
  ```
- 로직(필드/메서드명 **정확 매칭**)
  1. **HQ 주소 업서트**
     - 입력: `req.headquarters` (타입: `RoasteryAddress.Request`)
     - `boolean isDefault = (hqReq != null && "HEADQUARTERS".equalsIgnoreCase(hqReq.addressType));`
     - 조회: `addressRepository.findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(roasteryId, "HEADQUARTERS")`
     - 분기:
       - 존재: `existing.apply(hqReq)` 후 `save`
       - 없음: `RoasteryAddress.from(hqReq, roasteryId, isDefault)` 후 `save`
  2. **사이트 생성**
     - 입력: `req.site`
     - `String siteType = (siteReq != null && siteReq.type != null && !siteReq.type.isBlank()) ? siteReq.type : "OFFICE";`
     - 엔티티 필드 매핑 (정확 명칭):
       - `siteId(UUID)`, `roasteryId(UUID)`, `siteCode(String)`, `siteName(String)`, `type(String)`, `status(String)`, `addressId(UUID)`, `default(boolean)`, `createdAt(OffsetDateTime)`
     - 기본값: `status="ACTIVE"`, `default=isDefault`
     - `addressId = savedAddress.getAddressId()`
  3. **담당자 저장**
     - 입력: `req.contacts` (null-safe)
     - 엔티티 필드 (정확 명칭):
       - `contactId(UUID)`, `roasteryId(UUID)`, `siteId(UUID)`, `name(String)`, `email(String)`, `phone(String)`, `createdAt(OffsetDateTime)`
     - `saveAll` 후 목록 반환
  4. **최종 응답**
     - `RoasterySetupResponse.of(savedAddress, savedSite, savedContacts)` 반환

### E. Repository
- `com.roastive.api.domain.roastery.repository.RoasteryAddressRepository`
  ```java
  RoasteryAddress findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(java.util.UUID roasteryId, String addressType);
  ```
- `RoasterySiteRepository`, `RoasteryContactRepository`
  - `extends org.springframework.data.jpa.repository.JpaRepository<..., java.util.UUID>`

### F. Model (스켈레톤이 필요한 경우에만 정확 명칭으로 생성)
- `RoasterySite`
  - 필드: `siteId(UUID @Id)`, `roasteryId(UUID)`, `siteCode(String)`, `siteName(String)`, `type(String)`, `status(String)`, `addressId(UUID)`, `default(boolean)`, `createdAt(OffsetDateTime)`
- `RoasteryContact`
  - 필드: `contactId(UUID @Id)`, `roasteryId(UUID)`, `siteId(UUID)`, `name(String)`, `email(String)`, `phone(String)`, `createdAt(OffsetDateTime)`

### G. 에러 처리
- 전역 예외 처리기가 없으면 간단히 `@ControllerAdvice` 추가
  - `MethodArgumentNotValidException` → `{ ok:false, message:"validation error", fieldErrors:[{field, reason}] }`
  - 기타 예외 → `{ ok:false, message:"internal error" }` (로그 기록)

### H. 테스트(권장)
- `RoasterySetupServiceTest`
  - HQ 업서트(기존/신규), contacts 다건 저장, site.type 기본값 적용 확인
- `RoasterySetupControllerTest`
  - 200/400 케이스, 헤더(`X-Roastery-Id`) 필수 검사

---

## 수용 기준 (Acceptance)
- `POST /api/roastery/setup` 성공 시 `200 + { ok:true, data: {...} }`로 Address/Site/Contacts 반환.
- `headquarters.address_type=HEADQUARTERS`이면 기존 HQ 존재 시 업데이트, 없으면 생성.
- `site.type` 미지정 시 `"OFFICE"` 저장.
- `headquarters.country` 미지정 시 `"KR"` 저장.
- `contacts` 비어도 실패하지 않음.
- 전체 저장은 **단일 @Transactional** 경계 안에서 원자적으로 처리.
- Validation 실패 시 `400 + { ok:false, message, fieldErrors }`.
