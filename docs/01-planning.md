# Dev Audio Digest - 전체 기획 정리

## 프로젝트 목표
**"개발 생태계의 중요한 변화를 카테고리별로 매일 자동 요약하여 전달"**

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
  2. 요약: Gemini Flash로 카테고리별 한국어 요약 생성
  3. 전달: 카테고리 output 타입에 따라 분기
     - text → 마크다운 블로그 포스트 (GitHub Pages) + Discord 링크 알림
     - audio → TTS mp3 생성 + Discord 파일 전송
```

## 카테고리 시스템

### 구조
각 카테고리는 독립적인 설정 파일로 관리. 새 카테고리 추가 = 설정 파일 하나 추가.

```
categories/
├── frontend.yaml      # 프론트엔드 (text output)
├── backend.yaml       # 백엔드 (향후)
├── ai-ml.yaml         # AI/ML (향후)
└── ...
```

### output 타입
- **text**: Gemini 요약 → 마크다운 블로그 포스트 → GitHub Pages 배포 → Discord 링크 알림
- **audio**: Gemini 요약 → Edge TTS mp3 → Discord 파일 전송

테크 뉴스처럼 코드/API 이름이 많은 카테고리는 text, 그 외는 audio.

## 수집 소스 전략

### 우선순위 체계
카테고리별로 핵심/보조/옵션 3단계로 소스를 관리.

### 프론트엔드 카테고리 소스

#### 핵심 (매일 수집)
- **Chrome Developers** — Chrome 플랫폼 변경사항, 새 Web API, DevTools 업데이트
- **React / Next.js / TypeScript releases** — GitHub releases API
- **GitHub Trending** — 프론트엔드 관련 trending repos

#### 보조 (매일 수집, 중요도 낮으면 스킵)
- **Hacker News** — 프론트엔드 관련 상위 포스트 (공식 API, 무료)
- **JavaScript Weekly** — 주간 뉴스레터 주요 항목

#### 옵션 (주간 또는 이슈 있을 때만)
- **DevTools / Performance** — Lighthouse, Core Web Vitals 변경사항

### 카테고리 설정 파일 예시 (frontend.yaml)
```yaml
name: frontend
enabled: true
output: text

sources:
  core:
    chrome_developers:
      url: https://developer.chrome.com/blog
      type: rss
    github_releases:
      repos:
        - facebook/react
        - vercel/next.js
        - microsoft/TypeScript
      watch: [releases]
    github_trending:
      language: javascript
      since: daily

  secondary:
    hackernews:
      min_score: 100
      keywords: [javascript, react, nextjs, typescript, css, frontend]
    javascript_weekly:
      url: https://javascriptweekly.com/rss

  optional:
    devtools:
      repos:
        - AugmentedOS/niceshits
      keywords: [devtools, lighthouse, core-web-vitals]

prompt: |
  프론트엔드 개발자 관점에서 블로그 포스트 형식으로 요약해줘.
  코드 변경사항은 코드블록으로, 링크는 원문 포함.
```

## 수집 방법

| 소스 | 방법 | 인증 | 비용 |
|------|------|------|------|
| Chrome Developers | RSS/스크래핑 | 없음 | 무료 |
| GitHub Releases | GitHub API | GITHUB_TOKEN | 무료 |
| GitHub Trending | 스크래핑 or 비공식 API | 없음 | 무료 |
| Hacker News | 공식 API (Firebase) | 없음 | 무료 |
| JavaScript Weekly | RSS | 없음 | 무료 |

## 분석 및 요약 (Gemini Flash)

### 1차: 규칙 기반 자동 필터링 (공통)
- Breaking changes: major version, deprecation, security fix
- 영향 범위: npm 다운로드 수, GitHub stars
- 커뮤니티 반응: upvotes, comments, mentions

### 2차: Gemini Flash로 요약
- 카테고리별 설정의 prompt를 사용해 맞춤 요약
- 필터링된 데이터만 전달 (토큰 절약)
- text output: 블로그 포스트용 마크다운
- audio output: 자연스러운 한국어 대화체 스크립트

### 우선순위 분류 (공통)
```
긴급: Major version, Deprecation, Critical security fix
일간: Minor version with features, 인기 라이브러리 급성장, 트렌딩 급부상
```

## 전달

### Text 카테고리 (테크 뉴스)
- Gemini 요약 → 마크다운 포스트 생성
- GitHub Pages 자동 배포 (블로그)
- Discord webhook으로 새 글 링크 알림

### Audio 카테고리 (향후)
- Gemini 요약 → Edge TTS mp3 생성
- Discord webhook으로 mp3 파일 전송

## 기술 스택

| 영역 | 기술 | 비용 |
|------|------|------|
| 수집 | GitHub API, HN API, RSS | 무료 |
| 자동화 | GitHub Actions (크론) | 무료 (2000분/월) |
| 요약 | Gemini Flash API | 무료 tier |
| 블로그 | GitHub Pages | 무료 |
| TTS | Edge TTS (audio 카테고리) | 무료 |
| 알림 | Discord Webhook | 무료 |
| **총 비용** | | **0원** |

## 구현 로드맵

### Phase 1: 카테고리 시스템 + 기본 수집 ✅
- 카테고리 설정 파일 구조 정의
- GitHub releases 수집기 구현
- 프론트엔드 카테고리로 먼저 구현

### Phase 2: 수집 소스 확장
- Chrome Developers RSS 수집기
- Hacker News API 수집기
- GitHub Trending 수집기

### Phase 3: Gemini 요약 + 블로그 생성
- Gemini Flash 연동
- 마크다운 블로그 포스트 자동 생성
- GitHub Pages 설정

### Phase 4: Discord 알림 + GitHub Actions
- Discord webhook 연동
- GitHub Actions 크론잡 설정
- 전체 파이프라인 자동화

### Phase 5: 확장
- audio output 카테고리 추가
- JavaScript Weekly RSS 수집기
- 주간 종합 요약 생성

## 성공 지표
- **적시성**: 중요한 소식을 며칠 내에 캐치했는가?
- **정확성**: 잘못된 정보나 과장된 소식은 없었는가?
- **습관화**: 매일 아침 읽는 루틴이 만들어졌는가?
- **확장성**: 새 카테고리 추가가 설정 파일 하나로 끝나는가?

## 개발 원칙

- 완벽하게 만들려 하지 말고 빠르게 시작
- 프론트엔드 카테고리 하나로 먼저 완성 후 확장
- 비용 0 유지 (무료 tier 범위 내에서)
