# Cursor Prompt — Roastery “화면 단위 DTO + 트랜잭션 서비스” 구현

## 목적/컨텍스트
- 한 화면에서 **여러 테이블의 데이터를 한 번에** 생성/업데이트할 수 있도록, **Composite Request/Response**를 정의하고 이를 처리하는 **트랜잭션 서비스 + 단일 엔드포인트**를 구현한다.
- 현재 존재하는 `com.roastive.api.domain.roastery.model.RoasteryAddress` 및 내부 `Request` 모델을 **그대로 재사용**한다.
- JSON 키는 **snake_case**, 서버 내 필드는 **camelCase**로 유지. Jackson의 `@JsonNaming(SnakeCaseStrategy.class)` 사용.

## 변경 범위
- 패키지 기준: `com.roastive.api.domain.roastery`
- 추가/수정 파일
  1) `application`  
     - `controller/RoasterySetupController.java` (신규)
     - `service/RoasterySetupService.java` (신규)
  2) `domain`  
     - `dto/RoasterySetupRequest.java` (Composite Request, 신규)
     - `dto/RoasterySetupResponse.java` (Composite Response/ViewModel, 신규)
  3) `repository`  
     - `RoasteryAddressRepository`, `RoasterySiteRepository`, `RoasteryContactRepository` 존재 가정. 없으면 JPA 리포지토리 생성.
  4) `model`  
     - `RoasterySite`, `RoasteryContact` 엔티티 존재 가정. 없으면 최소 필드로 스켈레톤 생성.

## 규칙/제약
- Spring Boot 3.x, Jakarta Validation (`jakarta.validation.*`), Jackson.
- 모든 Request DTO는 `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)`.
- 컨트롤러는 `@RestController`, `@Validated`, `@RequestBody @Valid` 사용.
- 서비스는 `@Service`, 메서드는 `@Transactional`.
- 오류 응답은 `{ ok:false, message, fieldErrors? }` 형태.
- 성공 응답은 `{ ok:true, data: <CompositeResponse> }`.
- HQ 주소 업서트 규칙: `addressType == HEADQUARTERS`면 존재 시 업데이트, 없으면 생성.
- 기본값: `country` 기본 `"KR"`, `site.type` 기본 `"OFFICE"`.
- 멱등성 옵션: 요청 헤더 `X-Idempotency-Key` 수신 시 중복 방지 로직 훅만 주석으로 남김(구현은 선택).

## 구현 지시 (구체)
1) **Composite Request**
   - 파일: `domain/roastery/dto/RoasterySetupRequest.java`
   - 내용:
     - 최상위 필드:
       - `@Valid public RoasteryAddress.Request headquarters;`  // 이미 존재하는 모델의 Request 재사용
       - `@Valid public RoasterySiteRequest site;`
       - `@Valid public List<ContactRequest> contacts;`
     - `RoasterySiteRequest`(내부 or 별도 public class): `siteName`, `type(기본 OFFICE)`, 필요 시 `siteCode(옵션)`
     - `ContactRequest`: `name(@NotBlank)`, `email(@Email)`, `phone(옵션)`
     - 각 클래스에 `@JsonNaming(SnakeCaseStrategy)` 적용
     - 공백→null 정규화는 서비스단에서 처리 or 필요 시 정적 헬퍼 `n(String)` 사용

2) **Composite Response**
   - 파일: `domain/roastery/dto/RoasterySetupResponse.java`
   - `record` 또는 `class` 사용. 예:
     ```java
     @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
     public record RoasterySetupResponse(
       UUID addressId, String addressType,
       UUID siteId, String siteName, String siteType,
       List<ContactView> contacts
     ) {
       public static RoasterySetupResponse of(RoasteryAddress a, RoasterySite s, List<RoasteryContact> cs) {
         return new RoasterySetupResponse(
           a.getAddressId(), a.getAddressType(),
           s.getSiteId(), s.getSiteName(), s.getType(),
           cs.stream().map(ContactView::from).toList()
         );
       }
     }
     @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
     public record ContactView(UUID contactId, String name, String email, String phone) {
       public static ContactView from(RoasteryContact c) {
         return new ContactView(c.getContactId(), c.getName(), c.getEmail(), c.getPhone());
       }
     }
     ```

3) **Controller**
   - 파일: `application/roastery/controller/RoasterySetupController.java`
   - 단일 엔드포인트:
     - `POST /api/roastery/setup`
     - 헤더: `X-Roastery-Id`(UUID) 필수
     - 바디: `RoasterySetupRequest`
     - 흐름: 서비스 호출 → `{ ok:true, data: RoasterySetupResponse }` 반환
     - 유효성 실패 시 `{ ok:false, message, fieldErrors }` 반환
     - (선택) `X-Idempotency-Key` 헤더 수신 시 로그/주석 남김

4) **Service**
   - 파일: `application/roastery/service/RoasterySetupService.java`
   - 메서드:  
     ```java
     @Transactional
     public RoasterySetupResponse setup(UUID roasteryId, RoasterySetupRequest req)
     ```
   - 로직:
     - `hqReq = req.headquarters`
       - `isDefault = "HEADQUARTERS".equalsIgnoreCase(hqReq.addressType)`
       - `RoasteryAddress` 업서트:
         - 존재 검색: `findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(roasteryId, "HEADQUARTERS")`
         - 있으면 `existing.apply(hqReq)` → save
         - 없으면 `RoasteryAddress.from(hqReq, roasteryId, isDefault)` → save
     - `siteReq = req.site`
       - `site.type` 기본값 `"OFFICE"`
       - 새 `RoasterySite` 생성(또는 규칙에 따라 업서트): `site.addressId = savedAddress.addressId`, `default = isDefault`, `status="ACTIVE"`
     - `contacts`
       - null/빈 리스트 안전 처리
       - `RoasteryContact` 리스트 매핑 후 `saveAll`
     - 최종 `RoasterySetupResponse.of(address, site, contacts)` 반환

5) **Repository/Entity (부족 시 생성)**
   - `RoasteryAddressRepository`에 다음 메서드 확인/추가:
     ```java
     RoasteryAddress findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(UUID roasteryId, String addressType);
     ```
   - `RoasterySite`, `RoasteryContact`가 없을 경우 최소 필드/매핑으로 엔티티와 리포지토리를 생성:
     - `RoasterySite(siteId UUID @Id, roasteryId UUID, siteCode, siteName, type, status, addressId UUID, isDefault, createdAt)`
     - `RoasteryContact(contactId UUID @Id, roasteryId UUID, siteId UUID, name, email, phone, createdAt)`
     - 각 리포지토리: `extends JpaRepository<..., UUID>`

6) **에러 처리 표준화**
   - `@ControllerAdvice`가 이미 있다면 재사용. 없다면 간단한 핸들러 추가:
     - `MethodArgumentNotValidException` → `{ ok:false, message:"validation error", fieldErrors:[{field, reason}] }`
     - 일반 예외 → `{ ok:false, message:"internal error" }` (스택은 로그)

7) **테스트(선택)**
   - `RoasterySetupServiceTest`:  
     - HQ 업서트 동작 (기존/신규)  
     - contacts 여러 건 저장  
     - site.type 기본값 적용  
   - `RoasterySetupControllerTest`: `POST /api/roastery/setup` 200 / 400 케이스

## 수용 기준 (Acceptance)
- `POST /api/roastery/setup` 성공 시 HTTP 200 + `{ ok:true, data: {...} }` 형태로 Address/Site/Contacts가 모두 반환된다.
- `headquarters.address_type=HEADQUARTERS`일 때 기존 HQ가 있으면 업데이트, 없으면 생성한다.
- `site.type` 미지정 시 `"OFFICE"`로 저장된다.
- `headquarters.country` 미지정 시 `"KR"`로 저장된다.
- `contacts`가 비어도 실패하지 않는다.
- 모든 저장은 하나의 `@Transactional` 경계 안에서 원자적으로 처리된다.
- Validation 실패 시 HTTP 400 + `{ ok:false, message, fieldErrors }`.
