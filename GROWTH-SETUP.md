# 검색 노출 및 분석 설정

## 구현 내용

- 검색 제목, 설명, H1 및 정적 이용 안내/FAQ 개선. 기존 canonical, robots.txt, sitemap.xml 유지.
- 공유 형식: `?numbers=12,9,45,30,16,26;30,20,15,8,3,1`. 세미콜론은 게임 구분이며 각 게임은 추첨 순서를 보존합니다. 표시용 영수증만 오름차순으로 정렬합니다.
- 1~45의 중복 없는 정수 6개, 최대 5게임만 허용. 링크 수신 후 재현 버튼으로 3D 연출을 시작합니다. 물리 움직임까지 동일하게 재현하지는 않습니다.
- 빠른 1게임/5게임, 영수증 형태 표시, PNG 저장, 번호 복사, 기본 공유 API 및 링크 복사 대체 동작.
- 공유 URL은 현재 origin/path에서 생성되므로 로컬 테스트 링크는 로컬을, 배포 후 링크는 배포 도메인을 가리킵니다.

## GA4 활성화

`analytics.js`의 `GA_MEASUREMENT_ID`에 실제 웹 스트림의 `G-...` 값을 입력합니다. 빈 값이면 Google Analytics 스크립트를 로드하거나 분석 이벤트를 전송하지 않습니다. 기존 광고 스크립트는 별개입니다.

페이지뷰는 GA4 기본 수집을 사용하며 전달 URL에서 `numbers`와 hash를 제외합니다. UTM은 유지합니다. 자체 이벤트에는 번호를 넣지 않습니다. GA4 향상된 측정의 브라우저 기록 기반 페이지뷰/외부 링크 자동 측정 등 별도 수집 설정은 관리자에서 확인하세요.

| 이벤트 | 목적 |
|---|---|
| draw_start / draw_complete | mode(3d, quick, replay), game_count별 추첨 전환 |
| shared_visit / shared_link_invalid | 공유 유입 및 잘못된 링크 |
| replay_start | 공유 또는 현재 결과 재현 시도 |
| share_click / share_complete | 기본 공유 UI 시도/완료(실제 수신 확인은 아님) |
| share_link_copy / numbers_copy | 복사 성공 |
| ticket_download | PNG 다운로드 시작 |

공유 링크에 `utm_source=lotto_share&utm_medium=referral`을 붙입니다. 배포 후 GA4 실시간 보고서에서 페이지뷰 → 추첨 시작 → 완료 → 공유를 확인합니다. 실제 ID/계정이 없으면 보고서 수집 검증은 불가능합니다.

## 검색엔진 등록 (계정 필요)

1. Google Search Console에서 `https://lotto.sysout.co.kr/` 속성을 추가하거나 기존 속성의 소유권/색인 상태를 확인합니다.
2. 네이버 서치어드바이저에도 동일한 사이트를 확인합니다.
3. 각 서비스가 발급한 실제 인증 메타 태그 또는 DNS 값을 적용합니다. 인증값을 임의로 만들지 않습니다.
4. 두 서비스에 `https://lotto.sysout.co.kr/sitemap.xml`을 제출합니다.
5. 배포된 홈 URL의 수집/색인 상태를 확인하고, Google URL 검사 및 네이버 웹 페이지 수집을 요청합니다. 공유 파라미터 URL은 별도로 제출하지 않습니다.

소유권 인증, 사이트맵 제출 및 색인 확인은 아직 실행하지 않았습니다. 코드 변경만으로 검색 노출을 보장할 수 없습니다.

## 검증

`node --test tests/lotto-core.test.cjs`

브라우저에서는 5게임 생성, 공유 번호 복원/재현, 건너뛰기, 복사, PNG 저장, 잘못된 파라미터 이후 새 추첨, 모바일 폭을 확인합니다.
