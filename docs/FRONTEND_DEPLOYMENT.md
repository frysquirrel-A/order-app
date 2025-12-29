# 프런트엔드 Render.com 배포 가이드

## 1. 코드 수정 사항

### 1.1 API URL 설정 확인
`ui/src/api.js` 파일에서 이미 환경 변수를 사용하도록 설정되어 있습니다:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
```

### 1.2 빌드 설정 확인
`ui/vite.config.js` 파일이 최적화되어 있습니다.

### 1.3 SPA 라우팅 설정
`ui/public/_redirects` 파일이 생성되어 있습니다 (SPA 라우팅 지원).

## 2. Render.com 배포 방법

### 방법 1: Static Site로 배포 (권장)

#### 2.1 새 Static Site 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"Static Site"** 선택
3. GitHub 저장소 연결

#### 2.2 설정 입력
- **Name**: `cozy-order-ui` (원하는 이름)
- **Branch**: `main` (또는 사용하는 브랜치)
- **Root Directory**: `ui` ⚠️ **중요!**

#### 2.3 빌드 설정
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: 
  ```
  dist
  ```

#### 2.4 환경 변수 설정
**Environment Variables** 섹션에서:
```
VITE_API_URL=https://your-backend-service.onrender.com/api
```

⚠️ **주의**: 
- 백엔드 서비스의 실제 URL을 입력하세요
- `/api`는 포함하지 않아도 됩니다 (api.js에서 자동 추가)
- 예: `https://cozy-order-server.onrender.com`

#### 2.5 생성
**"Create Static Site"** 클릭

### 방법 2: Web Service로 배포 (Node.js 서버 사용)

#### 2.1 서버 파일 생성 필요
Static Site가 더 간단하지만, Node.js 서버를 사용하려면:

1. `ui/server.js` 파일 생성 (Express로 정적 파일 서빙)
2. `package.json`에 start 스크립트 추가

하지만 **Static Site 방식이 더 권장**됩니다.

## 3. 배포 후 확인

### 3.1 배포 상태 확인
1. Render 대시보드에서 Static Site 선택
2. **"Logs"** 탭에서 빌드 로그 확인
3. 배포 완료 후 URL 확인

### 3.2 테스트
1. 배포된 URL로 접속 (예: `https://cozy-order-ui.onrender.com`)
2. 브라우저 개발자 도구 콘솔에서 API 호출 확인
3. 네트워크 탭에서 API 요청이 올바른 백엔드로 가는지 확인

## 4. 환경 변수 관리

### 4.1 Render에서 환경 변수 설정
1. Static Site 선택
2. **"Environment"** 탭 클릭
3. **"Add Environment Variable"** 클릭
4. 변수 이름: `VITE_API_URL`
5. 변수 값: 백엔드 서비스 URL (예: `https://cozy-order-server.onrender.com`)
6. **"Save Changes"** 클릭

### 4.2 환경별 설정
- **개발 환경**: `http://localhost:3000`
- **프로덕션 환경**: `https://your-backend-service.onrender.com`

## 5. CORS 설정 확인

백엔드 서버의 CORS 설정이 프런트엔드 도메인을 허용하는지 확인하세요.

`server/server.js`에서:
```javascript
app.use(cors()) // 모든 도메인 허용 (개발용)
```

프로덕션에서는 특정 도메인만 허용하도록 설정하는 것이 좋습니다:
```javascript
app.use(cors({
  origin: ['https://cozy-order-ui.onrender.com', 'http://localhost:5173']
}))
```

## 6. 문제 해결

### 6.1 빌드 실패
- **Logs** 탭에서 오류 메시지 확인
- 로컬에서 `npm run build` 테스트
- Node 버전 확인

### 6.2 API 연결 실패
- 환경 변수 `VITE_API_URL`이 올바르게 설정되었는지 확인
- 백엔드 서비스가 실행 중인지 확인
- CORS 설정 확인
- 브라우저 콘솔에서 네트워크 오류 확인

### 6.3 404 오류 (라우팅 문제)
- `_redirects` 파일이 `public` 폴더에 있는지 확인
- Static Site 설정 확인

### 6.4 이미지가 표시되지 않음
- 이미지 경로가 `/images/`로 시작하는지 확인
- `public/images/` 폴더에 이미지가 있는지 확인

## 7. 자동 배포 설정

### 7.1 GitHub 연동
- 기본적으로 GitHub에 푸시하면 자동 배포됩니다
- 특정 브랜치만 배포하도록 설정 가능

### 7.2 수동 배포
- **"Manual Deploy"** → **"Deploy latest commit"** 클릭

## 8. 배포 체크리스트

- [ ] GitHub에 코드 푸시 완료
- [ ] 백엔드 서비스가 배포되어 실행 중
- [ ] Render.com에서 Static Site 생성
- [ ] Root Directory: `ui` 설정
- [ ] Build Command: `npm install && npm run build` 설정
- [ ] Publish Directory: `dist` 설정
- [ ] 환경 변수 `VITE_API_URL` 설정 (백엔드 URL)
- [ ] 배포 완료 및 테스트
- [ ] API 연결 확인
- [ ] 이미지 표시 확인

## 9. 프로덕션 최적화 팁

### 9.1 빌드 최적화
- `vite.config.js`에서 이미 최적화 설정이 포함되어 있습니다
- 빌드 후 `dist` 폴더 크기 확인

### 9.2 환경 변수
- 프로덕션과 개발 환경을 분리하여 관리
- 민감한 정보는 환경 변수로 관리

### 9.3 성능 모니터링
- Render 대시보드의 **"Metrics"** 탭에서 성능 확인
- 브라우저 개발자 도구에서 로딩 시간 확인

