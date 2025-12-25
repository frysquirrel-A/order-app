# 커피 주문 앱 백엔드 서버

Express.js를 사용한 커피 주문 앱의 백엔드 서버입니다.

## 설치 방법

```bash
npm install
```

## 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 데이터베이스 정보를 입력하세요.

```bash
cp .env.example .env
```

## 실행 방법

### 개발 모드 (자동 재시작)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## API 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /api/menus` - 메뉴 목록 조회
- `POST /api/orders` - 주문 생성
- 기타 API는 PRD.md를 참고하세요.

## 데이터베이스

PostgreSQL을 사용합니다. 데이터베이스 스키마는 `docs/PRD.md`의 6.4 섹션을 참고하세요.

