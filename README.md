# 음성 카운터 PWA (Voice Counter Progressive Web App)

1초마다 숫자를 증가시키며 음성으로 읽어주는 카운터 앱입니다. PWA(Progressive Web App)로 구성되어 모바일 기기에 앱처럼 설치할 수 있습니다.

## 🚀 주요 기능

- **음성 카운터**: 1초마다 숫자가 증가하며 음성으로 읽어줍니다
- **PWA 지원**: 모바일 기기에 앱처럼 설치 가능
- **오프라인 작동**: 인터넷 연결 없이도 사용 가능
- **반응형 디자인**: 모든 기기에서 최적화된 UI
- **iOS/Android 호환**: 모든 모바일 플랫폼에서 작동

## 📱 PWA 설치 방법

### Android (Chrome)
1. 브라우저에서 앱을 열어주세요
2. 우하단의 "📱 앱 설치" 버튼을 클릭하거나
3. 브라우저 메뉴 → "홈 화면에 추가" 선택

### iOS (Safari)
1. Safari에서 앱을 열어주세요
2. 공유 버튼 (📤) → "홈 화면에 추가" 선택
3. 앱 이름을 확인하고 "추가" 버튼 클릭

### 데스크톱 (Chrome/Edge)
1. 주소창 오른쪽의 설치 아이콘 클릭 또는
2. 브라우저 메뉴 → "앱 설치" 선택

## 🛠️ 개발 및 테스트

### 로컬 서버 실행
```bash
# Python 서버 사용 (권장)
python3 server.py

# 또는 Node.js 서버 사용
npx http-server -p 8000

# 또는 PHP 서버 사용
php -S localhost:8000
```

### PWA 기능 테스트
1. `http://localhost:8000`에서 앱 열기
2. 브라우저 개발자 도구 → Application/애플리케이션 탭
3. Service Workers, Manifest, Storage 확인

### HTTPS 테스트 (PWA 완전 기능)
```bash
# ngrok 사용 (권장)
npx ngrok http 8000

# 또는 로컬 HTTPS 서버
npx http-server -p 8000 -S -C cert.pem -K key.pem
```

## 📁 프로젝트 구조

```
counter/
├── index.html          # 메인 HTML 파일
├── App.jsx            # React 앱 컴포넌트
├── index.css          # 스타일시트
├── manifest.json      # PWA 매니페스트
├── sw.js             # 서비스 워커
├── pwa-install.js    # PWA 설치 스크립트
├── server.py         # 개발용 서버
├── icons/            # PWA 아이콘들
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── README.md         # 이 파일
```

## 🔧 PWA 구성 요소

### 1. Web App Manifest (`manifest.json`)
- 앱 이름, 아이콘, 테마 색상 등 메타데이터
- 설치 가능한 앱으로 만들어주는 핵심 파일

### 2. Service Worker (`sw.js`)
- 오프라인 캐싱 및 백그라운드 동기화
- 푸시 알림 및 앱 업데이트 처리

### 3. PWA 설치 스크립트 (`pwa-install.js`)
- 설치 프롬프트 관리
- 앱 업데이트 알림
- 설치 상태 추적

## 🎨 아이콘 생성

새로운 아이콘이 필요한 경우:

1. **자동 생성**:
   ```bash
   node generate-icons.js
   ```

2. **수동 생성**:
   - `create-icons.html`을 브라우저에서 열기
   - 각 크기별로 PNG 다운로드

3. **ImageMagick 사용**:
   ```bash
   magick icons/icon-512x512.svg icons/icon-512x512.png
   ```

## 📱 지원 기능

- ✅ 앱 설치 (Add to Home Screen)
- ✅ 오프라인 작동
- ✅ 스플래시 스크린
- ✅ 풀스크린 모드
- ✅ 앱 업데이트 알림
- ✅ 백그라운드 동기화
- ✅ 푸시 알림 (준비됨)

## 🌐 브라우저 호환성

| 기능 | Chrome | Safari | Firefox | Edge |
|------|--------|--------|---------|------|
| 기본 PWA | ✅ | ✅ | ✅ | ✅ |
| 설치 | ✅ | ✅ | ⚠️ | ✅ |
| 오프라인 | ✅ | ✅ | ✅ | ✅ |
| 푸시 알림 | ✅ | ✅ | ✅ | ✅ |

## 🚀 배포

### GitHub Pages
1. 저장소를 GitHub에 업로드
2. Settings → Pages → Source를 "Deploy from a branch" 선택
3. Branch를 "main" 선택 후 Save

### Netlify
1. 프로젝트 폴더를 Netlify에 드래그 앤 드롭
2. 자동으로 HTTPS URL 생성됨

### Vercel
```bash
npx vercel --prod
```

## 🔍 PWA 검증

배포 후 PWA 품질 확인:
1. Chrome DevTools → Lighthouse
2. PWA 카테고리에서 점수 확인
3. 모든 PWA 요구사항 충족 확인

## 📞 문제 해결

### 음성이 작동하지 않는 경우
- iOS: 사용자 상호작용 후 음성 기능 활성화됨
- 브라우저 설정에서 음성 권한 확인

### 설치 버튼이 보이지 않는 경우
- HTTPS 연결 필요 (localhost 제외)
- 매니페스트 파일 확인
- 서비스 워커 등록 확인

### 오프라인에서 작동하지 않는 경우
- 서비스 워커 등록 상태 확인
- 캐시된 리소스 확인
- 네트워크 탭에서 캐시 응답 확인

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.