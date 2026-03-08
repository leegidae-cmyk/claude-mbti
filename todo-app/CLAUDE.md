# CLAUDE.md

## 프로젝트 개요

간단한 투두리스트 웹앱. React 19 + TypeScript 5 기반의 SPA.

## 기술 스택

| 항목 | 버전/도구 |
|------|-----------|
| 프레임워크 | React 19 |
| 언어 | TypeScript 5 |
| 빌드 도구 | Vite 6 |
| 패키지 매니저 | npm |
| 린터 | ESLint (flat config) |
| 포매터 | Prettier |
| 테스트 | Vitest + React Testing Library |

## 프로젝트 초기 설정

```bash
npm create vite@latest todo-app -- --template react-ts
cd todo-app
npm install
```

## 개발 서버 실행

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (tsc && vite build)
npm run lint     # ESLint 검사
npm run format   # Prettier 포매팅
npm run test     # Vitest 실행
```

## 코드 작성 규칙

### React 19 적용 사항

- `forwardRef` 대신 ref를 일반 prop으로 전달 (React 19부터 지원)
- `defaultProps` 대신 ES6 기본 파라미터 사용
- `propTypes` 사용 금지 → TypeScript 타입으로 대체
- 파일 상단에 `import React from 'react'` 불필요 (JSX Transform 적용)
- 비동기 폼 처리 시 `useFormStatus`, `useActionState` 활용
- 낙관적 업데이트에 `useOptimistic` 훅 활용

### TypeScript 규칙

- `any` 타입 사용 금지 → `unknown` 또는 명시적 타입 사용
- Props 타입은 `type` 키워드로 정의 (예: `type TodoItemProps = { ... }`)
- 전역 상태나 공유 모델은 `interface` 사용 가능
- 이벤트 핸들러에 정확한 이벤트 타입 명시 (예: `React.ChangeEvent<HTMLInputElement>`)
- 타입 단언(`as`) 최소화, 불가피할 경우 주석으로 이유 명시

### 컴포넌트 작성

- 함수형 컴포넌트만 사용 (클래스 컴포넌트 금지)
- 컴포넌트 파일명은 PascalCase (예: `TodoItem.tsx`)
- 커스텀 훅은 `use` 접두사 + camelCase (예: `useTodoList.ts`)
- 유틸리티 함수는 camelCase (예: `formatDate.ts`)
- 컴포넌트당 하나의 파일 원칙

### 파일 구조

```
src/
├── components/   # 재사용 가능한 UI 컴포넌트
├── hooks/        # 커스텀 훅
├── types/        # 공유 타입 정의
├── utils/        # 순수 유틸리티 함수
└── App.tsx
```

## 커밋 규칙

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 형식을 따르며, **메시지는 한글로 작성**.

### 형식

```
<type>[optional scope]: <한글 설명>

[optional body]

[optional footer]
```

### 타입 목록

| 타입 | 사용 시점 |
|------|-----------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `style` | 포매팅, 세미콜론 등 코드 의미 변경 없는 수정 |
| `test` | 테스트 추가 또는 수정 |
| `docs` | 문서 수정 |
| `chore` | 빌드, 패키지 설정 등 기타 변경 |
| `perf` | 성능 개선 |

### 예시

```
feat: 할 일 완료 토글 기능 추가
fix: 빈 문자열 입력 시 할 일 추가되는 버그 수정
refactor(TodoItem): 컴포넌트 로직을 커스텀 훅으로 분리
chore: ESLint flat config로 마이그레이션
```

### 커밋 작성 원칙

- 제목은 50자 이내
- 하나의 커밋에 하나의 관심사만 포함
- 본문이 필요하면 "왜" 변경했는지 설명 (어떻게는 코드로 확인 가능)

## 문제 해결 우선순위

1. **실제 동작하는 해결책** — 완벽한 설계보다 동작하는 코드 먼저
2. **기존 코드 패턴 분석 및 일관성 유지** — 새 코드가 기존 스타일과 충돌하지 않도록
3. **타입 안전성 보장** — `any` 없이 명시적 타입으로 컴파일 타임 오류 방지
4. **재사용 가능한 구조 설계** — 단, 현재 필요한 수준 이상의 추상화는 지양

## 주의 사항

- 불필요한 `useEffect` 지양 → 이벤트 핸들러나 서버 컴포넌트로 대체 가능한지 먼저 검토
- 성능 최적화(`useMemo`, `useCallback`)는 실제 측정 후 적용 (React Compiler가 많은 부분 자동 처리)
- 스타일은 CSS Modules 또는 Tailwind CSS 중 프로젝트 초기에 통일하여 혼용 금지
