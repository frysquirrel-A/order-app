# Render.com 배포 가이드

## 1. 사전 준비

### 1.1 GitHub 저장소 준비
1. GitHub에 로그인하고 새 저장소를 생성합니다
2. 로컬 프로젝트를 Git으로 초기화하고 푸시합니다:

```bash
# 프로젝트 루트에서
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

## 2. Render.com에서 PostgreSQL 데이터베이스 생성

### 2.1 데이터베이스 생성
1. [Render.com](https://render.com)에 로그인
2. 대시보드에서 **"New +"** 클릭
3. **"PostgreSQL"** 선택
4. 다음 정보 입력:
   - **Name**: `cozy-order-db` (원하는 이름)
   - **Database**: 자동 생성됨
   - **User**: 자동 생성됨
   - **Region**: 가장 가까운 지역 선택
   - **PostgreSQL Version**: 최신 버전 선택
   - **Plan**: Free 플랜 선택 (또는 유료 플랜)
5. **"Create Database"** 클릭

### 2.2 데이터베이스 연결 정보 확인
1. 생성된 데이터베이스 클릭
2. **"Connections"** 탭에서 다음 정보 확인:
   - **Internal Database URL**: 내부 연결용
   - **External Database URL**: 외부 연결용 (로컬 테스트용)
   - **Host**, **Port**, **Database**, **User**, **Password** 정보 확인

## 3. Render.com에서 Web Service 생성

### 3.1 새 Web Service 생성
1. Render 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결:
   - **"Connect account"** 또는 **"Connect repository"** 클릭
   - GitHub 계정 인증
   - 저장소 선택

### 3.2 서비스 설정
다음 정보를 입력합니다:

#### 기본 설정
- **Name**: `cozy-order-server` (원하는 이름)
- **Region**: 데이터베이스와 같은 지역 선택
- **Branch**: `main` (또는 사용하는 브랜치)
- **Root Directory**: `server` ⚠️ **중요!**

#### 빌드 및 실행 설정
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install
  ```
- **Start Command**: 
  ```bash
  node index.js
  ```

#### 환경 변수 설정
**Environment Variables** 섹션에서 다음 변수들을 추가합니다:

```
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=order_app_db_xxxxx
DB_USER=order_app_db_xxxxx_user
DB_PASSWORD=실제_비밀번호
NODE_ENV=production
```

⚠️ **주의**: 
- 데이터베이스의 **Internal Database URL**을 사용하면 자동으로 파싱됩니다
- 또는 각 변수를 개별적으로 입력할 수 있습니다
- `DB_PASSWORD`는 따옴표 없이 입력합니다

### 3.3 고급 설정 (선택사항)
- **Auto-Deploy**: `Yes` (기본값) - GitHub에 푸시하면 자동 배포
- **Health Check Path**: `/` (기본값)

### 3.4 서비스 생성
**"Create Web Service"** 클릭

## 4. 데이터베이스 스키마 생성

### 4.1 로컬에서 스키마 생성 (방법 1)
로컬에서 Render 데이터베이스에 직접 연결하여 스키마를 생성합니다:

```bash
cd server
npm run setup-render
```

이 명령은 `.env` 파일의 설정을 사용하여 Render 데이터베이스에 스키마를 생성합니다.

### 4.2 Render Shell에서 스키마 생성 (방법 2)
1. Render 대시보드에서 Web Service 선택
2. **"Shell"** 탭 클릭
3. 다음 명령 실행:

```bash
npm run setup-render
```

## 5. 배포 확인

### 5.1 배포 상태 확인
1. Render 대시보드에서 Web Service 선택
2. **"Logs"** 탭에서 배포 로그 확인
3. 배포가 완료되면 **"Events"** 탭에서 상태 확인

### 5.2 서비스 테스트
1. Web Service의 URL 확인 (예: `https://cozy-order-server.onrender.com`)
2. 브라우저에서 접속하여 다음 확인:
   - `https://your-service.onrender.com/` - 기본 라우트 테스트
   - `https://your-service.onrender.com/api/menus` - API 테스트

## 6. 문제 해결

### 6.1 배포 실패 시
- **Logs** 탭에서 오류 메시지 확인
- 환경 변수가 올바르게 설정되었는지 확인
- 데이터베이스 연결 정보 확인

### 6.2 데이터베이스 연결 오류
- SSL 연결이 필요합니다 (`db.js`에 이미 설정됨)
- Internal Database URL 사용 확인
- 방화벽 설정 확인

### 6.3 포트 오류
- Render는 자동으로 `PORT` 환경 변수를 설정합니다
- `server.js`의 `process.env.PORT || 3000` 설정이 정상 작동합니다

## 7. 환경 변수 관리

### 7.1 Render에서 환경 변수 추가/수정
1. Web Service 선택
2. **"Environment"** 탭 클릭
3. **"Add Environment Variable"** 클릭
4. 변수 이름과 값 입력
5. **"Save Changes"** 클릭 (자동 재배포됨)

### 7.2 중요한 환경 변수
- `DB_HOST`: 데이터베이스 호스트
- `DB_PORT`: 데이터베이스 포트 (보통 5432)
- `DB_NAME`: 데이터베이스 이름
- `DB_USER`: 데이터베이스 사용자
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `NODE_ENV`: `production` (프로덕션 환경)

## 8. 자동 배포 설정

### 8.1 GitHub 연동
- 기본적으로 GitHub에 푸시하면 자동 배포됩니다
- 특정 브랜치만 배포하도록 설정 가능

### 8.2 수동 배포
- **"Manual Deploy"** → **"Deploy latest commit"** 클릭

## 9. 모니터링

### 9.1 로그 확인
- **"Logs"** 탭에서 실시간 로그 확인
- 오류 발생 시 로그에서 원인 파악

### 9.2 메트릭
- **"Metrics"** 탭에서 CPU, 메모리 사용량 확인

## 10. 프런트엔드 배포 (선택사항)

프런트엔드도 Render에 배포하려면:

1. **"New +"** → **"Static Site"** 선택
2. GitHub 저장소 연결
3. **Root Directory**: `ui` 설정
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist` 설정

---

## 요약 체크리스트

- [ ] GitHub에 코드 푸시 완료
- [ ] Render.com에서 PostgreSQL 데이터베이스 생성
- [ ] 데이터베이스 연결 정보 확인
- [ ] Render.com에서 Web Service 생성
- [ ] Root Directory: `server` 설정
- [ ] Build Command: `npm install` 설정
- [ ] Start Command: `node index.js` 설정
- [ ] 환경 변수 설정 (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- [ ] 데이터베이스 스키마 생성 (`npm run setup-render`)
- [ ] 배포 완료 및 테스트


