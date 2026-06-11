# Endfield Calendar — Claude Code Instructions

## 프로젝트 개요
명일방주: 엔드필드 버전 일정 대시보드. React + TypeScript + Vite.

## 이벤트 업데이트하기

버전 번호(예: "1.4", "v1.4", "1.4 버전")가 언급되면 **반드시 다음 절차를 수행**한다:

1. **검색**: 웹에서 해당 버전 정보를 직접 검색한다
   - 검색어 예: `명일방주 엔드필드 1.4 버전 일정`, `Arknights Endfield 1.4 events`
   - endfield.wiki.gg, 공식 사이트, 커뮤니티 등에서 일정·이미지 정보를 수집한다
   - URL이 제공된 경우 페이지도 함께 읽는다
2. **추출**: **모든 카테고리**(헤드헌팅, 신청/무기, 구역, 이벤트, 콘텐츠)의 정보를 빠짐없이 추출한다
   - 특정 카테고리만 처리하고 나머지를 빠뜨리지 않는다
   - 이름·날짜뿐 아니라 **이미지 URL도 반드시 찾아서** `imageUrl`에 등록한다
3. **중복 체크 후 업데이트**: 아래 규칙에 따라 `src/data/events.ts`를 수정한다
4. **확인**: 추가/수정/스킵된 항목을 카테고리별로 요약해서 알려준다

### 중복 처리 규칙

새 이벤트를 추가하기 전에 **반드시 중복 체크**를 수행한다.

**중복 판단 기준 (퍼지 매칭)**:
- `startDate`가 동일하고
- `nameKo`가 동일하거나 한쪽이 다른 쪽을 포함할 때 (예: '그림자 이정표' ⊂ '그림자 이정표 - 적막 속의 외침')

위 조건을 모두 만족하면 **같은 이벤트**로 간주한다.

| 상황 | 처리 |
|------|------|
| 이벤트가 존재하지 않음 | 새로 추가 |
| 중복 이벤트 발견 (퍼지 매칭 포함) | 새 항목은 추가하지 않음. 기존 항목에 빠진 필드(imageUrl, endDate 등)만 채운다 |
| 이벤트가 있지만 `imageUrl`이 없고 새 이미지를 찾음 | `imageUrl`만 추가 |
| 이벤트가 있지만 `endDate`가 null이고 날짜 정보를 찾음 | `endDate` 업데이트 |
| 이벤트가 있지만 `nameKo`가 영어로만 되어 있음 | `nameKo` 업데이트 |
| 버전 정보(`versions` 배열)가 없는 새 버전 | 버전도 추가 |

**절대 덮어쓰지 않는 것**: 이미 값이 있는 필드는 건드리지 않는다.

**중복 체크 예시**:
- 기존: `{ nameKo: '그림자 이정표 - 적막 속의 외침', startDate: '2026-07-02' }`
- 신규: `{ nameKo: '그림자 이정표', startDate: '2026-07-02' }`
- → '그림자 이정표'가 기존 이름에 포함됨 → **중복, 추가하지 않음**

### events.ts 업데이트 규칙

`EventEntry` 타입에 맞게 추가한다:

```ts
{
  id: string,           // 고유 ID (예: 'ev_새이벤트명')
  nameKo: string,       // 한국어 이름
  nameEn: string,       // 영어 이름
  category: 'headhunting' | 'arsenal' | 'zone' | 'event' | 'content',
  version: string,      // 예: '1.4'
  startDate: string,    // 'YYYY-MM-DD'
  endDate: string | null, // null = 상시
  tag: '스토리 이벤트' | '기간 한정 이벤트' | '기간 한정 픽업' | '기간 한정 출석 체크' | '가이드 이벤트' | '도전 이벤트' | '촬영 이벤트' | '콘텐츠 업데이트' | '상시 콘텐츠' | '기념 이벤트' | '작전 훈련' | '상시',
  phase?: 1 | 2,
  imageGradient?: string,
  imageUrl?: string,
}
```

### 카테고리 분류 기준
- `headhunting`: 캐릭터 헤드헌팅 배너
- `arsenal`: 무기/신청 배너
- `zone`: 신규 지역/구역
- `event`: 스토리/기간 한정/출석/도전 이벤트
- `content`: 상시 콘텐츠 업데이트

### 새 버전이 나오면
`versions` 배열에도 추가한다:

```ts
{
  version: '1.4',
  titleKo: '버전 제목',
  titleEn: 'Version Title',
  startDate: 'YYYY-MM-DD',
  endDate: 'YYYY-MM-DD',
  phase1Date: 'YYYY-MM-DD',
  phase2Date: 'YYYY-MM-DD',
}
```

## 개발 서버
```
cd endfield-calendar
npm run dev   # localhost:5173
```
