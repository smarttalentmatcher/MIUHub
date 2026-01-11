# Railway 배포 문제 해결 가이드

## 현재 확인된 설정 ✅

1. **Source**: GitHub 저장소 연결됨 (SAKLAB9/MIUHub, main 브랜치)
2. **Variables**: 
   - SUPABASE_SERVICE_KEY ✅
   - SUPABASE_URL ✅

## 확인해야 할 설정 🔍

### 1. Build 설정 (Settings → Build)
- **Build Command**: 비워두거나 `npm install`
- **Root Directory**: 비워두거나 `.`

### 2. Deploy 설정 (Settings → Deploy)
- **Start Command**: `npm start` 또는 비워두기
- **Restart Policy**: 기본값 유지

### 3. 배포 로그 확인 (Deployments 탭)
다음 메시지들이 보여야 합니다:
```
> miuhub@1.0.0 start
> node server.js

서버가 포트 3002에서 실행 중입니다.
=== 서버 시작 시 환경 변수 확인 ===
SUPABASE_URL: 설정됨
SUPABASE_SERVICE_KEY: 설정됨 (길이: XXX)
supabaseAdmin 초기화: 성공
================================
```

## 일반적인 문제와 해결책

### 문제 1: "No start command found"
**해결**: Settings → Deploy → Start Command에 `npm start` 입력

### 문제 2: "Module not found" 에러
**해결**: 
1. Settings → Build → Build Command에 `npm install` 명시
2. 또는 package.json에 모든 의존성이 있는지 확인

### 문제 3: 배포는 되지만 서버가 응답하지 않음
**해결**: 
1. Settings → Networking → Healthcheck Path를 `/` 또는 `/api/config`로 설정
2. server.js에서 포트가 `0.0.0.0`으로 바인딩되는지 확인 (이미 수정됨)

### 문제 4: "Port already in use"
**해결**: server.js에서 `app.listen(PORT, '0.0.0.0', ...)` 사용 (이미 수정됨)

## 배포 로그에서 확인할 사항

### 성공적인 배포 로그 예시:
```
[INFO] Installing dependencies...
[INFO] npm install completed
[INFO] Starting service...
[INFO] 서버가 포트 3002에서 실행 중입니다.
```

### 실패한 배포 로그에서 찾을 것:
- `Error: Cannot find module` → 의존성 문제
- `EADDRINUSE` → 포트 충돌
- `ENOENT` → 파일/디렉토리 없음
- `SUPABASE_SERVICE_KEY가 설정되지 않았습니다` → 환경 변수 문제

## 다음 단계

1. **Deployments 탭**에서 최근 배포 클릭
2. 로그를 스크롤하여 에러 메시지 찾기
3. 에러 메시지를 복사하여 확인
4. 위의 해결책 중 해당하는 것 적용

