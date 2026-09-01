# 지환 & 서희 모바일 청첩장

2026년 10월 25일 수원 마이어스에서 열리는 지환과 서희의 결혼식을 위한 모바일 청첩장입니다.

## 주요 기능

- 순차 등장 및 인사 모션이 적용된 커플 인트로
- 스크롤 위치에 따라 제목과 콘텐츠가 순차적으로 나타나는 섹션 모션
- 결혼식 정보, 혼주 소개, 달력과 실시간 D-day
- 버튼·터치 이동과 확대 보기를 지원하는 사진 갤러리
- 카카오맵 SDK 기반 예식장 지도와 외부 지도 링크
- 카카오톡 피드형 청첩장 공유 및 기본 공유·링크 복사 대체 동작
- 안성 출발 전세버스 안내 및 탑승 수요조사
- 계좌번호 접기/펼치기 및 복사
- Supabase에 저장되는 방명록, 참석 여부와 전세버스 수요조사
- 카카오톡 등 링크 공유용 대표 이미지

## 실행

```bash
pnpm install
pnpm dev
```

## 첫 화면 사진

아래 두 파일이 겹쳐진 상태로 재생되며, 정면 사진이 사라지면서 인사 사진이 자연스럽게 나타납니다.

- `intro-1.jpg`
- `intro-2.jpg`

## 환경 설정

로컬에서는 `.env`에, Vercel에서는 프로젝트의 Environment Variables에 아래 값을 등록합니다.

- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`: 카카오맵 JavaScript 앱 키
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SECRET_KEY`: API 라우트에서만 사용하는 Supabase 서버 시크릿 키
- `NEXT_PUBLIC_SITE_URL`: 대표 이미지에 사용할 실제 배포 주소(예: `https://example.com`)

카카오 개발자 콘솔의 웹 플랫폼에는 로컬 주소와 Vercel 배포 주소를 허용 도메인으로 등록해야 지도가 표시됩니다.

## Vercel 배포

GitHub 저장소를 Vercel에 연결하고 Framework Preset을 `Next.js`로 선택합니다. 위 환경 변수를 Production, Preview, Development 환경에 맞게 등록한 뒤 배포하면 됩니다. 별도 Build Command나 Output Directory 설정은 필요하지 않습니다.
