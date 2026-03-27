# Dev News Audio Briefing - 전체 기획 정리

## 프로젝트 목표
**"개발 생태계의 중요한 변화를 카테고리별로 매일 오디오 브리핑으로 듣기"**

### 핵심 가치
- **중요도 우선**: 정보 과부하 방지, 정말 필요한 정보만
- **정확성 중심**: 검증된 소스 우선, 잘못된 정보 최소화
- **실무 지향**: 당장 내 프로젝트에 영향주는 정보 우선
- **확장 가능**: 카테고리 추가만으로 새로운 분야 커버
- **비용 0**: 전부 무료 인프라로 운영

### 해결하려는 문제
- styled-components maintenance mode 같은 중요한 소식 놓치기
- 너무 많은 뉴스레터/블로그로 인한 정보 피로
- 트렌드 파악의 어려움 (뭐가 정말 중요한 변화인지)

## 전체 아키텍처

```
GitHub Actions (매일 새벽 크론)
  1. 카테고리별 수집: 설정 파일 기반으로 소스 순회
  2. 요약: Gemini Flash로 카테고리별 한국어 오디오 스크립트 생성
  3. 음성: Edge TTS로 mp3 생성
  4. 전달: Discord webhook으로 카테고리별 채널에 mp3 전송
```

## 카테고리 시스템

### 구조
각 카테고리는 독립적인 설정 파일로 관리. 새 카테고리 추가 = 설정 파일 하나 추가.

```
categories/
├── frontend.yaml      # 프론트엔드
├── backend.yaml       # 백엔드 (향후)
├── ai-ml.yaml         # AI/ML (향후)
├── devops.yaml        # DevOps (향후)
└── security.yaml      # 보안 (향후)
```

### 카테고리 설정 파일 예시 (frontend.yaml)
```yaml
name: 프론트엔드
enabled: true
discord_channel: frontend-news  # 채널별 분리 가능

sources:
  github:
    repos:
      - facebook/react
      - vuejs/core
      - vercel/next.js
      - vitejs/vite
      - angular/angular
      - sveltejs/svelte
      - tailwindlabs/tailwindcss
      - microsoft/TypeScript
    watch: [releases, security]

  npm:
    track_downloads: true
    alert_threshold: 20  # 다운로드 증감률 %

  community:  # 향후
    reddit: [r/javascript, r/reactjs]
    hackernews: true

prompt: |
  프론트엔드 개발자 관점에서 요약해줘.
  React, Next.js 등 주요 프레임워크 변화에 초점.
```

### 첫 번째 카테고리: 프론트엔드
위 예시가 v1으로 먼저 구현할 카테고리.

### 향후 추가 예시
```yaml
# backend.yaml
name: 백엔드
sources:
  github:
    repos:
      - nodejs/node
      - denoland/deno
      - spring-projects/spring-boot
      - nestjs/nest

# ai-ml.yaml
name: AI/ML
sources:
  github:
    repos:
      - pytorch/pytorch
      - huggingface/transformers
      - langchain-ai/langchain
```

## 정보 수집

### 수집 엔진 (카테고리 공통)
카테고리 설정 파일의 sources를 읽어서 동일한 수집 로직으로 처리.

#### GitHub API
- 릴리즈 (new releases, pre-releases)
- Security advisories
- Discussions 주요 이슈

#### npm API
- 주간/월간 다운로드 수
- 다운로드 증감률 추적
- 패키지 메타데이터

#### 커뮤니티 소스 (향후)
- Reddit 상위 포스트
- Hacker News front page

### 수집 결과 저장
```
data/
├── 2026-03-28/
│   ├── frontend.json
│   ├── backend.json    # 카테고리 추가 시
│   └── ai-ml.json
```

## 분석 및 요약 (Gemini Flash)

### 1차: 규칙 기반 자동 필터링 (공통)
- Breaking changes: major version, deprecation, security fix
- 영향 범위: npm 다운로드 수, GitHub stars
- 커뮤니티 반응: upvotes, comments, mentions

### 2차: Gemini Flash로 요약
- 카테고리별 설정의 prompt를 사용해 맞춤 요약
- 필터링된 데이터만 전달 (토큰 절약)
- 한국어 오디오 스크립트 형태로 생성
- 자연스러운 대화체 ("오늘의 프론트엔드 소식입니다...")

### 우선순위 분류 (공통)
```
긴급: Major version, Deprecation, Critical security fix
일간: Minor version with features, 인기 라이브러리 급성장, npm 급변
```

## 음성 변환 (Edge TTS)

- Microsoft Edge TTS (무료, 한국어 지원)
- 카테고리별 2-3분 분량 mp3 생성
- 소식 없는 카테고리는 스킵

## 전달 (Discord Webhook)

- 카테고리별 Discord 채널에 mp3 전송
- 또는 하나의 채널에 카테고리 태그와 함께 전송
- webhook URL로 HTTP POST, 서버 불필요

## 기술 스택

| 영역 | 기술 | 비용 |
|------|------|------|
| 수집 | GitHub API, npm API | 무료 |
| 자동화 | GitHub Actions (크론) | 무료 (2000분/월) |
| 요약 | Gemini Flash API | 무료 tier |
| TTS | Edge TTS | 무료 |
| 전달 | Discord Webhook | 무료 |
| **총 비용** | | **0원** |

## 구현 로드맵

### Phase 1: 카테고리 시스템 + 수집
- 카테고리 설정 파일 구조 정의
- GitHub API 연동 (릴리즈 수집)
- 프론트엔드 카테고리로 먼저 구현

### Phase 2: 요약 + TTS + Discord
- Gemini Flash 연동, 카테고리별 오디오 스크립트 생성
- Edge TTS로 mp3 생성
- Discord webhook 연동
- 로컬에서 전체 파이프라인 테스트

### Phase 3: GitHub Actions 자동화
- 크론잡 설정 (매일 새벽)
- secrets 설정 (Gemini API key, Discord webhook URL)
- 자동 배치 실행

### Phase 4: npm 트렌드 추가
- npm API 연동
- 다운로드 수 변화율 추적

### Phase 5: 카테고리 확장
- 백엔드, AI/ML 등 새 카테고리 추가
- 커뮤니티 소스 (Reddit/HN) 추가
- 주간 종합 요약 생성

## 성공 지표
- **적시성**: 중요한 소식을 며칠 내에 캐치했는가?
- **정확성**: 잘못된 정보나 과장된 소식은 없었는가?
- **습관화**: 매일 아침 듣는 루틴이 만들어졌는가?
- **확장성**: 새 카테고리 추가가 설정 파일 하나로 끝나는가?

## 개발 원칙

- 완벽하게 만들려 하지 말고 빠르게 시작
- 프론트엔드 카테고리 하나로 먼저 완성 후 확장
- 비용 0 유지 (무료 tier 범위 내에서)
