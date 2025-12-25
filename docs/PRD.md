# 커피 주문 앱

## 1. 프로젝트 개요

### 1.1 프로젝트명
커피 주문 앱

### 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 간단한 풀스택 웹 앱

### 1.3 개발 범위
- 주문하기 화면(메뉴 선택 및 장바구니 기능)
- 관리자 화면(재고 관리 및 주문 상태 관리)
- 데이터를 생성/조회/수정/삭제할 수 있는 기능

## 2. 기술 스텍
- 프런트엔드 : HTML, CSS, 리액트, 자바스크립트
- 백엔드 : Node.js, Express
- 데이터베이스 : PostgreSQL

## 3. 기본 사항
- 프런트엔드와 백엔드를 따로 개발
- 기본적인 웹 기술만 사용
- 학습 목적이므로 사용자 인증이나 결제 기능은 제외
- 메뉴는 커피 메뉴만 있음

## 4. 주문하기 화면 구성

### 4.1 화면 레이아웃
주문하기 화면은 상단 헤더, 중앙 메뉴 아이템 영역, 하단 장바구니 영역으로 구성됩니다.

### 4.2 헤더 영역
- **위치**: 화면 최상단
- **구성 요소**:
  - 좌측: "COZY" 브랜드 로고 (다크 그린 배경의 사각형 박스)
  - 우측: 두 개의 네비게이션 버튼
    - "주문하기" 버튼 (라이트 그레이 배경, 다크 그린 테두리)
    - "관리자" 버튼 (라이트 그레이 배경, 다크 그린 테두리)

### 4.3 메뉴 아이템 영역
- **위치**: 헤더 아래, 장바구니 위
- **레이아웃**: 메뉴 아이템 카드들이 가로로 배치 (반응형 그리드)
- **메뉴 카드 구성 요소**:
  - **이미지 영역**: 상단에 메뉴 이미지 표시 (플레이스홀더: 대각선이 그어진 흰색 사각형)
  - **제품명**: 굵은 글씨로 표시 (예: "아메리카노(ICE)", "아메리카노(HOT)", "카페라떼")
  - **가격**: 한국 원화 형식으로 표시 (예: "4,000원", "5,000원")
  - **설명**: "간단한 설명..." 플레이스홀더 텍스트
  - **옵션 체크박스**:
    - "샷 추가 (+500원)" - 선택 시 추가 금액 표시
    - "시럽 추가 (+0원)" - 추가 금액 없음
  - **담기 버튼**: 라이트 그레이 배경의 사각형 버튼, 클릭 시 선택한 옵션과 함께 장바구니에 추가

### 4.4 장바구니 영역
- **위치**: 화면 하단
- **스타일**: 라이트 그레이 배경, 다크 그레이 테두리의 사각형 박스
- **구성 요소**:
  - **제목**: 좌측 상단에 "장바구니" 텍스트 표시
  - **장바구니 아이템 목록**:
    - 각 아이템은 다음 정보를 포함:
      - 메뉴명과 선택한 옵션 (예: "아메리카노(ICE) (샷 추가)")
      - 수량 (예: "X 1", "X 2")
      - 개별 가격 (예: "4,500원", "8,000원")
    - 여러 아이템이 있을 경우 세로로 나열
  - **총 금액**: 
    - "총 금액" 레이블과 함께 표시
    - 금액은 굵은 글씨로 강조 (예: "총 금액 12,500원")
  - **주문하기 버튼**: 
    - 총 금액 아래에 위치
    - 라이트 그레이 배경, 다크 그레이 테두리
    - 클릭 시 주문 진행

### 4.5 상호작용 규칙
- 메뉴 카드에서 옵션을 선택하고 "담기" 버튼을 클릭하면 장바구니에 추가
- 동일한 메뉴와 옵션 조합이 이미 장바구니에 있으면 수량이 증가
- 장바구니의 총 금액은 모든 아이템의 가격 합계로 자동 계산
- "주문하기" 버튼 클릭 시 주문이 완료되고 장바구니가 초기화됨

## 5. 관리자 화면 구성

### 5.1 화면 레이아웃
관리자 화면은 상단 헤더, 관리자 대시보드 섹션, 재고 현황 섹션, 주문 현황 섹션으로 구성됩니다.

### 5.2 헤더 영역
- **위치**: 화면 최상단
- **구성 요소**:
  - 좌측: "COZY" 브랜드 로고 (다크 테두리의 사각형 박스)
  - 우측: 두 개의 네비게이션 버튼
    - "주문하기" 버튼 (다크 테두리)
    - "관리자" 버튼 (다크 테두리, 현재 활성화 상태로 표시 - 더 진한 테두리 또는 배경색으로 구분)

### 5.3 관리자 대시보드 섹션
- **위치**: 헤더 아래, 최상단
- **스타일**: 라이트 그레이 배경, 둥근 모서리의 사각형 박스
- **구성 요소**:
  - **제목**: "관리자 대시보드" 텍스트
  - **통계 요약**: 한 줄로 표시되는 주문 상태 통계
    - 형식: "총 주문 [N] / 주문 접수 [N] / 제조 중 [N] / 제조 완료 [N]"
    - 각 상태별 주문 수를 실시간으로 표시
    - 예시: "총 주문 1 / 주문 접수 1 / 제조 중 0 / 제조 완료 0"

### 5.4 재고 현황 섹션
- **위치**: 관리자 대시보드 아래
- **스타일**: 라이트 그레이 배경, 둥근 모서리의 사각형 박스
- **구성 요소**:
  - **제목**: "재고 현황" 텍스트
  - **재고 카드**: 각 메뉴 아이템별로 카드 형태로 표시
    - **레이아웃**: 카드들이 가로로 배치 (반응형 그리드)
    - **카드 구성 요소**:
      - **메뉴명**: 카드 상단에 표시 (예: "아메리카노 (ICE)", "아메리카노 (HOT)", "카페라떼")
      - **재고 수량**: 메뉴명 아래에 표시 (예: "10개")
      - **재고 조절 버튼**: 수량 아래에 두 개의 작은 사각형 버튼
        - "+" 버튼 (좌측): 클릭 시 재고 1 증가
        - "-" 버튼 (우측): 클릭 시 재고 1 감소
    - **재고 상태**:
      - 재고가 0이 되면 해당 메뉴는 주문하기 화면에서 '품절' 표시
      - 재고가 0보다 크면 정상적으로 주문 가능

### 5.5 주문 현황 섹션
- **위치**: 재고 현황 아래
- **스타일**: 라이트 그레이 배경, 둥근 모서리의 사각형 박스 (가장 큰 영역)
- **구성 요소**:
  - **제목**: "주문 현황" 텍스트
  - **주문 목록**: 시간 순으로 주문 항목들이 세로로 나열
    - **주문 항목 구성 요소**:
      - **주문 시간**: 좌측 상단에 표시 (예: "7월 31일 13:00")
      - **주문 내용**: 시간 아래에 표시
        - 메뉴명과 수량 (예: "아메리카노(ICE) x 1")
        - 가격 (예: "4,000원")
      - **상태 관리 버튼**: 우측에 위치한 사각형 버튼
        - 현재 상태에 따라 버튼 텍스트가 변경됨
        - "주문 접수" → "제조 중" → "제조 완료" 순서로 진행
        - 버튼 클릭 시 다음 단계로 상태 변경
    - **주문 상태별 표시**:
      - 주문 접수: 새로 들어온 주문, "주문 접수" 버튼 표시
      - 제조 중: 접수된 주문, "제조 중" 버튼 표시
      - 제조 완료: 완료된 주문, "제조 완료" 버튼 표시 (또는 완료 표시만)

### 5.6 상호작용 규칙
- **재고 관리**:
  - "+" 버튼 클릭 시 해당 메뉴의 재고가 1 증가하고 즉시 반영
  - "-" 버튼 클릭 시 해당 메뉴의 재고가 1 감소 (0 이하로는 감소하지 않음)
  - 재고 변경 시 주문하기 화면의 품절 상태가 실시간으로 업데이트됨
- **주문 관리**:
  - 주문 목록은 최신 주문이 위에 오도록 시간 역순으로 표시
  - "주문 접수" 버튼 클릭 시 해당 주문이 "제조 중" 상태로 변경
  - "제조 중" 버튼 클릭 시 해당 주문이 "제조 완료" 상태로 변경
  - 각 상태 변경 시 관리자 대시보드의 통계가 자동으로 업데이트됨
  - 완료된 주문은 목록에서 제거되거나 별도로 표시될 수 있음

## 6. 백엔드 개발

### 6.1 데이터 모델

#### 6.1.1 Menus (메뉴 정보)
메뉴 정보를 저장하는 테이블입니다.

**필드 구성:**
- `id` (Primary Key): 메뉴 고유 식별자
- `name`: 커피 이름 (예: "아메리카노(ICE)", "카페라떼")
- `description`: 메뉴 설명 (예: "시원한 아이스 아메리카노")
- `price`: 메뉴 기본 가격 (정수, 원 단위)
- `image`: 메뉴 이미지 URL
- `stock`: 재고 수량 (정수, 기본값 10)
- `created_at`: 생성 일시
- `updated_at`: 수정 일시

**사용 화면:**
- **주문 화면**: 커피 이름, 설명, 가격, 이미지 표시
- **관리자 화면**: 재고 수량 표시 및 관리

#### 6.1.2 Options (옵션 정보)
메뉴에 추가할 수 있는 옵션 정보를 저장하는 테이블입니다.

**필드 구성:**
- `id` (Primary Key): 옵션 고유 식별자
- `name`: 옵션 이름 (예: "샷 추가", "시럽 추가")
- `price`: 옵션 추가 가격 (정수, 원 단위, 0 이상)
- `menu_id` (Foreign Key): 연결할 메뉴 ID (모든 메뉴에 적용 가능한 경우 NULL)
- `created_at`: 생성 일시
- `updated_at`: 수정 일시

**사용 화면:**
- **주문 화면**: 메뉴 선택 시 옵션 체크박스로 표시

#### 6.1.3 Orders (주문 정보)
주문 정보를 저장하는 테이블입니다.

**필드 구성:**
- `id` (Primary Key): 주문 고유 식별자
- `order_number`: 주문번호 (문자열, 예: "001", "002")
- `order_date`: 주문 일시 (타임스탬프)
- `total_amount`: 주문 총 금액 (정수, 원 단위)
- `status`: 주문 상태 (문자열: 'received', 'preparing', 'completed')
- `created_at`: 생성 일시
- `updated_at`: 수정 일시

**사용 화면:**
- **관리자 화면**: 주문 현황에 표시

#### 6.1.4 OrderItems (주문 상세 정보)
주문에 포함된 각 메뉴 아이템의 상세 정보를 저장하는 테이블입니다.

**필드 구성:**
- `id` (Primary Key): 주문 아이템 고유 식별자
- `order_id` (Foreign Key): 주문 ID
- `menu_id` (Foreign Key): 메뉴 ID
- `quantity`: 수량 (정수)
- `unit_price`: 단가 (정수, 원 단위, 메뉴 가격 + 옵션 가격 합계)
- `status`: 아이템별 제조 상태 (문자열: 'received', 'preparing', 'completed')
- `created_at`: 생성 일시
- `updated_at`: 수정 일시

#### 6.1.5 OrderItemOptions (주문 아이템 옵션)
주문 아이템에 선택된 옵션 정보를 저장하는 테이블입니다.

**필드 구성:**
- `id` (Primary Key): 고유 식별자
- `order_item_id` (Foreign Key): 주문 아이템 ID
- `option_id` (Foreign Key): 옵션 ID
- `created_at`: 생성 일시

### 6.2 데이터 스키마를 위한 사용자 흐름

#### 6.2.1 메뉴 조회 및 표시
1. 사용자가 '주문하기' 화면에 접속합니다.
2. 프런트엔드에서 `GET /api/menus` API를 호출합니다.
3. 백엔드는 Menus 테이블에서 모든 메뉴 정보를 조회합니다.
4. 조회된 메뉴 정보(이름, 설명, 가격, 이미지)를 프런트엔드에 전달합니다.
5. 프런트엔드는 받은 정보를 화면에 표시합니다.
6. 관리자 화면에서는 Menus 테이블의 `stock` 필드를 조회하여 재고 수량을 표시합니다.

#### 6.2.2 장바구니 관리
1. 사용자가 메뉴 카드에서 옵션을 선택하고 "담기" 버튼을 클릭합니다.
2. 선택 정보는 프런트엔드의 장바구니 상태에 저장됩니다.
3. 장바구니에는 메뉴 ID, 옵션 정보, 수량이 포함됩니다.
4. 장바구니 화면에 선택한 메뉴와 옵션, 수량, 가격이 표시됩니다.

#### 6.2.3 주문 생성
1. 사용자가 장바구니에서 "주문하기" 버튼을 클릭합니다.
2. 프런트엔드에서 `POST /api/orders` API를 호출합니다.
3. 요청 본문에 다음 정보를 포함합니다:
   - 주문 일시 (또는 서버에서 생성)
   - 주문 내용 (메뉴 ID, 옵션 ID 배열, 수량, 단가)
   - 총 금액
4. 백엔드는 다음 작업을 수행합니다:
   - Orders 테이블에 주문 정보를 저장합니다.
   - OrderItems 테이블에 각 주문 아이템을 저장합니다.
   - OrderItemOptions 테이블에 선택된 옵션을 저장합니다.
   - Menus 테이블의 해당 메뉴 재고를 주문 수량만큼 차감합니다.
5. 주문이 성공적으로 생성되면 주문 ID와 주문번호를 반환합니다.
6. 프런트엔드는 장바구니를 초기화하고 주문 완료 메시지를 표시합니다.

#### 6.2.4 주문 현황 조회 및 상태 변경
1. 관리자가 관리자 화면의 "주문 현황" 섹션에 접속합니다.
2. 프런트엔드에서 `GET /api/orders` API를 호출합니다.
3. 백엔드는 Orders 테이블과 관련 OrderItems, OrderItemOptions를 조인하여 조회합니다.
4. 주문 목록을 최신순으로 정렬하여 반환합니다.
5. 프런트엔드는 받은 주문 정보를 화면에 표시합니다.
6. 각 주문 아이템의 기본 상태는 'received' (주문 접수)입니다.
7. 관리자가 "주문 접수" 버튼을 클릭하면:
   - 프런트엔드에서 `PATCH /api/orders/:orderId/items/:itemId` API를 호출합니다.
   - 상태를 'preparing' (제조 중)으로 변경합니다.
8. 관리자가 "제조 중" 버튼을 클릭하면:
   - 프런트엔드에서 `PATCH /api/orders/:orderId/items/:itemId` API를 호출합니다.
   - 상태를 'completed' (제조 완료)로 변경합니다.

### 6.3 API 설계

#### 6.3.1 메뉴 관련 API

**GET /api/menus**
- **설명**: 모든 메뉴 목록을 조회합니다.
- **요청**: 없음
- **응답**:
  ```json
  [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "description": "시원한 아이스 아메리카노",
      "price": 4000,
      "image": "https://...",
      "stock": 10
    },
    ...
  ]
  ```
- **사용 시점**: 주문하기 화면 진입 시

**GET /api/menus/:id**
- **설명**: 특정 메뉴의 상세 정보를 조회합니다.
- **요청 파라미터**: `id` (메뉴 ID)
- **응답**:
  ```json
  {
    "id": 1,
    "name": "아메리카노(ICE)",
    "description": "시원한 아이스 아메리카노",
    "price": 4000,
    "image": "https://...",
    "stock": 10
  }
  ```

**PATCH /api/menus/:id/stock**
- **설명**: 특정 메뉴의 재고를 수정합니다.
- **요청 파라미터**: `id` (메뉴 ID)
- **요청 본문**:
  ```json
  {
    "stock": 15
  }
  ```
- **응답**: 수정된 메뉴 정보
- **사용 시점**: 관리자 화면에서 재고 조절 시

#### 6.3.2 옵션 관련 API

**GET /api/options**
- **설명**: 모든 옵션 목록을 조회합니다.
- **요청**: 없음
- **응답**:
  ```json
  [
    {
      "id": 1,
      "name": "샷 추가",
      "price": 500,
      "menu_id": null
    },
    {
      "id": 2,
      "name": "시럽 추가",
      "price": 0,
      "menu_id": null
    }
  ]
  ```

**GET /api/menus/:id/options**
- **설명**: 특정 메뉴에 적용 가능한 옵션 목록을 조회합니다.
- **요청 파라미터**: `id` (메뉴 ID)
- **응답**: 옵션 배열

#### 6.3.3 주문 관련 API

**POST /api/orders**
- **설명**: 새로운 주문을 생성합니다.
- **요청 본문**:
  ```json
  {
    "items": [
      {
        "menu_id": 1,
        "quantity": 2,
        "options": [1],
        "unit_price": 4500
      },
      {
        "menu_id": 3,
        "quantity": 1,
        "options": [],
        "unit_price": 5000
      }
    ],
    "total_amount": 14000
  }
  ```
- **응답**:
  ```json
  {
    "id": 1,
    "order_number": "001",
    "order_date": "2024-01-15T10:30:00Z",
    "total_amount": 14000,
    "status": "received"
  }
  ```
- **사용 시점**: 장바구니에서 "주문하기" 버튼 클릭 시
- **부가 작업**: 주문 생성 시 해당 메뉴의 재고를 자동으로 차감

**GET /api/orders**
- **설명**: 모든 주문 목록을 조회합니다.
- **요청 쿼리 파라미터** (선택):
  - `status`: 주문 상태 필터링 ('received', 'preparing', 'completed')
- **응답**:
  ```json
  [
    {
      "id": 1,
      "order_number": "001",
      "order_date": "2024-01-15T10:30:00Z",
      "total_amount": 14000,
      "status": "received",
      "items": [
        {
          "id": 1,
          "menu_id": 1,
          "menu_name": "아메리카노(ICE)",
          "quantity": 2,
          "unit_price": 4500,
          "status": "received",
          "options": [
            {
              "id": 1,
              "name": "샷 추가",
              "price": 500
            }
          ]
        }
      ]
    }
  ]
  ```
- **사용 시점**: 관리자 화면의 주문 현황 조회 시

**GET /api/orders/:id**
- **설명**: 특정 주문의 상세 정보를 조회합니다.
- **요청 파라미터**: `id` (주문 ID)
- **응답**: 주문 상세 정보 (주문 아이템 및 옵션 포함)
- **사용 시점**: 주문 상세 정보 확인 시

**PATCH /api/orders/:orderId/items/:itemId**
- **설명**: 주문 아이템의 상태를 변경합니다.
- **요청 파라미터**: 
  - `orderId` (주문 ID)
  - `itemId` (주문 아이템 ID)
- **요청 본문**:
  ```json
  {
    "status": "preparing"
  }
  ```
- **응답**: 수정된 주문 아이템 정보
- **사용 시점**: 관리자 화면에서 주문 상태 변경 버튼 클릭 시

**PATCH /api/orders/:id/status**
- **설명**: 주문 전체의 상태를 변경합니다. (선택 사항)
- **요청 파라미터**: `id` (주문 ID)
- **요청 본문**:
  ```json
  {
    "status": "completed"
  }
  ```

### 6.4 데이터베이스 스키마 예시

```sql
-- Menus 테이블
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image VARCHAR(500),
  stock INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options 테이블
CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INTEGER DEFAULT 0,
  menu_id INTEGER REFERENCES menus(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders 테이블
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(10) UNIQUE NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'received',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OrderItems 테이블
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER REFERENCES menus(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'received',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OrderItemOptions 테이블
CREATE TABLE order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  option_id INTEGER REFERENCES options(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.5 에러 처리

모든 API는 다음 에러 상황을 처리해야 합니다:
- **400 Bad Request**: 잘못된 요청 데이터
- **404 Not Found**: 존재하지 않는 리소스
- **500 Internal Server Error**: 서버 내부 오류

에러 응답 형식:
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

