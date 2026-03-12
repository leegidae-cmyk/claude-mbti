# CLAUDE.md — MBTI TypeFinder 개발 가이드

## 프로젝트 개요

12문항 MBTI 성격 유형 테스트 웹 서비스. 모바일 퍼스트, 결과 카드 공유 최적화.
서비스명: **TypeFinder** | 라우트: `/` → `/test` → `/result/[type]` → `/stats`

---

## 기술 스택

| 레이어 | 기술 | 버전 |
|--------|------|------|
| 프레임워크 | Next.js (App Router) | 15 |
| 언어 | TypeScript | 5 |
| 스타일링 | Tailwind CSS | v4 |
| UI 컴포넌트 | shadcn/ui | latest |
| 상태 관리 | Zustand | latest |
| 애니메이션 | Framer Motion | latest |
| 이미지 캡처 | html2canvas | latest |
| 차트 | Recharts | latest |
| 데이터베이스 | Supabase (PostgreSQL) | latest |
| ORM | Prisma | latest |
| 배포 | Vercel | — |

---

## 디렉토리 구조

```
app/
  (pages)/
    page.tsx          # 홈 (/)
    test/page.tsx     # 테스트 질문 (/test)
    result/[type]/
      page.tsx        # 결과 페이지 (/result/ENFJ 등)
    stats/page.tsx    # 통계 페이지 (/stats)
  api/
    results/route.ts  # POST 결과 저장
    stats/route.ts    # GET 유형 분포 통계
  layout.tsx
components/
  ui/                 # shadcn/ui 기본 컴포넌트
  test/               # 테스트 관련 컴포넌트 (QuestionCard 등)
  result/             # 결과 관련 컴포넌트 (ResultCard, ShareSheet 등)
  stats/              # 통계 관련 컴포넌트
data/
  questions.ts        # 12개 질문 상수
  mbti-types.ts       # 16개 유형 메타데이터 상수
lib/
  mbti-calculator.ts  # 점수 계산 순수 함수
  supabase.ts         # Supabase 클라이언트
store/
  test-store.ts       # Zustand 테스트 진행 상태
types/
  mbti.ts             # MbtiTypeData, Question, TestProgress 등 타입 정의
```

---

## 코드 스타일

### TypeScript

- `any` 사용 금지. 알 수 없는 타입은 `unknown` 사용 후 narrowing.
- MBTI 유형 코드는 `'ENFJ' | 'INFP' | ...` 유니온 타입으로 정의, 문자열 리터럴로 허용하지 않음.
- `interface`와 `type` 혼용 가능하나, 확장 가능성 있는 객체는 `interface` 선호.

```typescript
// 좋음
type MbtiCode = 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP' |
                'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' |
                'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' |
                'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

// 나쁨
const type: string = 'ENFJ';
```

### React / Next.js

- 서버 컴포넌트를 기본으로, 클라이언트 상태가 필요한 경우만 `'use client'`.
- `generateMetadata`로 각 결과 페이지(`/result/[type]`)마다 OG 태그 동적 생성 — 카카오/SNS 공유 미리보기의 핵심.
- 페이지 컴포넌트는 `default export`, 재사용 컴포넌트는 named export.
- `next/image`를 반드시 사용하고 `alt` 속성 항상 명시.

### 상태 관리 (Zustand)

- 테스트 답변 상태(`answers`, `currentQuestion`)는 Zustand store에서 관리.
- 답변 변경 시 `localStorage`에 자동 저장 (중간 이탈 복구).
- localStorage key: `'mbti-test-progress'`, 스키마: `TestProgress` 타입 참조.

### 스타일링 (Tailwind CSS v4)

- 인라인 style 대신 Tailwind 클래스 사용. 동적 색상은 CSS 변수 + Tailwind JIT.
- 16개 유형별 색상은 `data/mbti-types.ts`의 `color` 필드에서 가져옴. 하드코딩 금지.
- 반응형은 모바일 퍼스트: 기본값이 모바일, `md:` `lg:` 로 확장.

---

## 핵심 개발 원칙

### 1. 데이터는 상수로, DB는 최소화

- 질문(12개)과 유형 메타데이터(16개)는 `data/` 폴더의 TypeScript 상수. DB 저장 불필요.
- DB에는 익명 결과 통계만 저장 (`mbti_type`, 각 축 점수, `created_at`). 개인 식별 정보 절대 저장 금지.

### 2. 결과 계산은 클라이언트에서, 즉시

```typescript
// lib/mbti-calculator.ts — 순수 함수로 구현
export function calculateMbti(answers: Record<number, 'A' | 'B'>): MbtiResult {
  // 각 축 점수 집계 후 유형 반환
}
```

실제 계산은 클라이언트에서 즉시 완료. 결과 로딩 화면(1.5초)은 UX 목적의 가짜 딜레이.

### 3. 공유 최적화를 항상 염두

- 결과 카드 캡처 영역은 `id="result-card"` div. html2canvas로 2x 해상도 PNG 저장.
- 파일명 형식: `mbti-result-{TYPE}-{YYYYMMDD}.png`
- OG 이미지 URL 패턴: `/og/{TYPE}.png` (정적 생성)

### 4. Graceful Degradation

- 통계 API 실패 → 통계 영역만 숨김 처리, 테스트 핵심 기능에 영향 없음.
- 이미지 저장 실패 → "화면 캡처를 이용해주세요" 토스트로 대체.
- 카카오 SDK → 부가 기능. 링크 복사가 기본.

### 5. 접근성 (WCAG 2.1 AA)

- 인터랙티브 요소는 Tab 키 도달 가능, `outline` 제거 금지.
- 프로그레스 바: `aria-valuenow`, `aria-valuemax` 필수.
- 오류 메시지: `role="alert"` + `aria-live="polite"`.
- 터치 타겟 최소 44×44px.

---

## API 설계

```
POST /api/results   — 테스트 결과 저장 (Rate limit: IP당 분당 10회)
GET  /api/stats     — 유형 분포 통계 (Cache-Control: 1시간)
```

응답 형식은 JSON. 오류 시 적절한 HTTP 상태 코드 반환.

---

## 애니메이션 규칙

| 인터랙션 | 방식 | 시간 |
|---------|------|------|
| 선택지 카드 hover | border + bg 변화 | 150ms transition |
| 카드 선택 | 체크 + 색상 변화 | 200ms transition |
| 질문 전환 (다음) | slide-left | 300ms |
| 질문 전환 (뒤로) | slide-right | 300ms |
| 결과 페이지 진입 | fade-in | 300ms |
| 결과 로딩 바 | 가짜 진행 | 1500ms |

Framer Motion 사용. 선택 후 자동 진행은 **500ms 대기** 후 전환.

---

## UX 라이팅 원칙

- 존댓말 사용. 친근하되 신뢰감 있는 어조.
- "Error", "Failed" 등 기술 용어 사용자에게 노출 금지.
- 단정적 표현 지양: "당신은 ~입니다" → "~한 경향이 있어요".
- 이모지: 문장당 최대 1개.
- MBTI를 절대적 진실로 표현하는 문구 금지.

---

## 환경 변수

`.env.local` 관리. 코드에 하드코딩 절대 금지.

```
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_KAKAO_APP_KEY=
```

---

## 성능 목표

| 지표 | 목표 |
|------|------|
| LCP | < 2.5초 |
| CLS | < 0.1 |
| Lighthouse | 90점 이상 |
| API 응답 | < 500ms (p95) |

- 유형 데이터 JSON은 빌드 타임 번들 (런타임 API 호출 없음).
- 폰트: Pretendard, `font-display: swap`, 서브셋 적용.
- `next/image` 자동 WebP + lazy loading 활용.

---

## 브라우저 지원

Chrome / Safari(iOS) / Samsung Internet / Firefox — 최신 2개 버전. IE 미지원.
