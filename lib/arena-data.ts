export type Side = "A" | "B";
export type SortType = "hot" | "new" | "best";
export type ArenaStatus = "main" | "live" | "upcoming" | "closed";
export type ReactionType = "knockout" | "meme" | "stretch" | "fact" | "funny";

export type Arena = {
  id: number;
  title: string;
  optionA: string;
  optionB: string;
  category: string;
  status: ArenaStatus;
  heat: number;
  spectators: number;
  scheduledAt: string;
  openingLine: string;
  editorNote: string;
};

export type ArenaComment = {
  id: number;
  arenaId: number;
  side: Side;
  nickname: string;
  text: string;
  likes: number;
  reactions: Record<ReactionType, number>;
  createdAt: number;
};

export const statusMeta: Record<
  ArenaStatus,
  { label: string; section: string; tone: string; canJoin: boolean }
> = {
  main: {
    label: "메인 경기",
    section: "오늘의 메인",
    tone: "border-amber-300/40 bg-amber-300/10 text-amber-200",
    canJoin: true,
  },
  live: {
    label: "진행 중",
    section: "진행 중",
    tone: "border-cyan-300/40 bg-cyan-300/10 text-cyan-200",
    canJoin: true,
  },
  upcoming: {
    label: "곧 시작",
    section: "곧 시작",
    tone: "border-violet-300/40 bg-violet-300/10 text-violet-200",
    canJoin: false,
  },
  closed: {
    label: "종료",
    section: "명경기 아카이브",
    tone: "border-white/15 bg-white/[0.04] text-zinc-400",
    canJoin: false,
  },
};

export const reactionMeta: Record<
  ReactionType,
  { label: string; badge: string; active: string }
> = {
  knockout: {
    label: "논파",
    badge: "논파각",
    active: "border-rose-300 bg-rose-300 text-black",
  },
  meme: {
    label: "드립",
    badge: "드립왕",
    active: "border-cyan-300 bg-cyan-300 text-black",
  },
  stretch: {
    label: "억지",
    badge: "억지주의보",
    active: "border-violet-300 bg-violet-300 text-black",
  },
  fact: {
    label: "팩트",
    badge: "팩트폭격",
    active: "border-amber-300 bg-amber-300 text-black",
  },
  funny: {
    label: "웃김",
    badge: "터짐",
    active: "border-lime-300 bg-lime-300 text-black",
  },
};

export const reactionOrder: ReactionType[] = [
  "knockout",
  "meme",
  "stretch",
  "fact",
  "funny",
];

export const emptyReactions = (): Record<ReactionType, number> => ({
  knockout: 0,
  meme: 0,
  stretch: 0,
  fact: 0,
  funny: 0,
});

export const arenas: Arena[] = [
  {
    id: 1,
    title: "AI한테 고민 상담 가능하다 vs 그래도 사람한테 해야 한다",
    optionA: "AI 상담 가능",
    optionB: "사람이 답",
    category: "AI",
    status: "live",
    heat: 97,
    spectators: 18420,
    scheduledAt: "오늘 21:00",
    openingLine: "위로는 잘하는데 책임은 안 져주는 존재와 인간의 정면승부",
    editorNote: "요즘 제일 많이 흔들리는 주제. 진지해져도 되고, 들켜도 웃김.",
  },
  {
    id: 2,
    title: "재택근무는 축복이다 vs 회사를 망치는 달콤한 독이다",
    optionA: "축복",
    optionB: "달콤한 독",
    category: "직장",
    status: "live",
    heat: 91,
    spectators: 11280,
    scheduledAt: "진행 중",
    openingLine: "침대 옆 출근과 감시 없는 업무 사이 어딘가",
    editorNote: "직장인이라면 한 마디 안 하고 지나가기 힘든 월급 루틴 배틀.",
  },
  {
    id: 3,
    title: "카톡 답장 느린 건 관심 없음이다 vs 그냥 그런 사람이다",
    optionA: "관심 없음",
    optionB: "그런 사람",
    category: "연애",
    status: "live",
    heat: 96,
    spectators: 20770,
    scheduledAt: "진행 중",
    openingLine: "읽씹, 안읽씹, 바쁨이라는 이름의 미스터리",
    editorNote: "연애 주제인데 모두가 갑자기 탐정이 되는 고전 떡밥.",
  },
  {
    id: 4,
    title: "월급 500 스트레스 지옥 vs 월급 300 마음 평화",
    optionA: "500 지옥",
    optionB: "300 평화",
    category: "돈",
    status: "upcoming",
    heat: 86,
    spectators: 9040,
    scheduledAt: "내일 20:00",
    openingLine: "통장 잔고와 정신 건강이 서로 멱살 잡는 경기",
    editorNote: "댓글 쓰다 보면 본인 인생 상담으로 빠질 가능성 높음.",
  },
  {
    id: 5,
    title: "쇼츠 3시간은 휴식이다 vs 뇌가 녹는 중이다",
    optionA: "휴식",
    optionB: "뇌 녹음",
    category: "생활",
    status: "upcoming",
    heat: 79,
    spectators: 6680,
    scheduledAt: "금요일 22:00",
    openingLine: "잠깐만 보려다 해 뜨는 시대의 국민 스포츠",
    editorNote: "다들 찔리니까 댓글 화력이 묘하게 잘 나오는 자기고발형 경기.",
  },
  {
    id: 6,
    title: "로또 1등 당첨되면 숨긴다 vs 바로 말한다",
    optionA: "무조건 숨김",
    optionB: "바로 말함",
    category: "돈",
    status: "live",
    heat: 90,
    spectators: 15330,
    scheduledAt: "진행 중",
    openingLine: "인간관계와 상상 속 20억이 만나는 순간",
    editorNote: "실제로 당첨 안 됐는데 모두가 이미 당첨자처럼 진지해지는 경기.",
  },
  {
    id: 7,
    title: "배달비 5천원 낸다 vs 그냥 라면 끓인다",
    optionA: "낸다",
    optionB: "라면 간다",
    category: "생활",
    status: "live",
    heat: 74,
    spectators: 7420,
    scheduledAt: "진행 중",
    openingLine: "귀찮음의 가격은 어디까지 인정되는가",
    editorNote: "소소하지만 매일 벌어지는 자존심 싸움. 야식 시간대에 특히 강함.",
  },
  {
    id: 8,
    title: "친구가 AI랑 연애한다면 응원한다 vs 말린다",
    optionA: "응원",
    optionB: "말림",
    category: "AI",
    status: "upcoming",
    heat: 83,
    spectators: 5870,
    scheduledAt: "토요일 21:00",
    openingLine: "외로움, 기술, 과몰입이 한 화면에 뜨는 미래형 떡밥",
    editorNote: "웃긴데 웃고 나면 살짝 무서워지는 쪽으로 잘 굴러갈 주제.",
  },
  {
    id: 9,
    title: "평생 커피 금지 vs 평생 라면 금지",
    optionA: "커피 금지",
    optionB: "라면 금지",
    category: "선택지옥",
    status: "upcoming",
    heat: 68,
    spectators: 4210,
    scheduledAt: "일요일 14:00",
    openingLine: "생존템 두 개를 놓고 벌이는 소박한 잔혹극",
    editorNote: "가볍고 빠르게 참여 가능한 취향형 입문 경기.",
  },
  {
    id: 10,
    title: "소개팅 최악은 사진 사기 vs 대화 노잼",
    optionA: "사진 사기",
    optionB: "대화 노잼",
    category: "연애",
    status: "upcoming",
    heat: 82,
    spectators: 7730,
    scheduledAt: "월요일 22:00",
    openingLine: "첫 만남 5분 만에 집 가고 싶어지는 이유 월드컵",
    editorNote: "경험담이 쏟아질 확률 높음. 너무 실명성 있는 얘기는 컷.",
  },
  {
    id: 11,
    title: "5살 10명과 싸우기 vs 50살 1명과 싸우기",
    optionA: "5살 10명",
    optionB: "50살 1명",
    category: "상상배틀",
    status: "upcoming",
    heat: 93,
    spectators: 11920,
    scheduledAt: "화요일 20:00",
    openingLine: "계산이 되는 듯하다가 갑자기 양심이 등장하는 매치업",
    editorNote: "현실 폭력보다 말도 안 되는 시뮬레이션 맛으로 굴리는 상상 경기.",
  },
  {
    id: 12,
    title: "아침형 인간 vs 새벽형 인간",
    optionA: "아침형",
    optionB: "새벽형",
    category: "생활",
    status: "closed",
    heat: 86,
    spectators: 9820,
    scheduledAt: "어제 종료",
    openingLine: "생산성과 생활 패턴을 건 조용한 자존심 싸움",
    editorNote: "무난한 생활형 주제도 HOT 댓글이 나오면 재방문 포인트가 생긴다는 검증용 경기.",
  },
  {
    id: 13,
    title: "맨손 은가누 vs 방망이 든 오타니",
    optionA: "은가누",
    optionB: "오타니",
    category: "상상배틀",
    status: "main",
    heat: 99,
    spectators: 22880,
    scheduledAt: "진행 중",
    openingLine: "논리보다 장면 상상이 먼저 튀어나오는 레전드 매치업",
    editorNote: "이런 말도 안 되는 매치업이 아레나의 순수 재미 담당. 빠지면 섭섭함.",
  },
  {
    id: 14,
    title: "고양이 크기 호랑이 100마리 vs 호랑이 크기 고양이 1마리",
    optionA: "작은 호랑이 100",
    optionB: "큰 고양이 1",
    category: "상상배틀",
    status: "upcoming",
    heat: 92,
    spectators: 13140,
    scheduledAt: "수요일 21:00",
    openingLine: "귀여움과 공포가 같은 문장에 들어가는 이상한 시뮬레이션",
    editorNote: "과학적 근거 없어도 됨. 상상력과 드립으로 밀어붙이는 경기.",
  },
  {
    id: 15,
    title: "하루 동안 투명인간 vs 하루 동안 시간정지",
    optionA: "투명인간",
    optionB: "시간정지",
    category: "상상배틀",
    status: "upcoming",
    heat: 89,
    spectators: 10220,
    scheduledAt: "목요일 20:00",
    openingLine: "능력보다 인성 검사가 먼저 시작되는 초능력 선택지",
    editorNote: "댓글 쓰는 순간 본인 윤리관이 들킬 수 있는 웃긴 위험 주제.",
  },
  {
    id: 16,
    title: "신은 존재한다 vs 존재하지 않는다",
    optionA: "존재한다",
    optionB: "없다",
    category: "전통논쟁",
    status: "live",
    heat: 95,
    spectators: 17640,
    scheduledAt: "진행 중",
    openingLine: "인류가 수천 년째 놓지 못한 최상위 떡밥",
    editorNote: "믿음, 이성, 경험이 부딪히는 클래식. 조롱보다 논리와 드립의 균형이 핵심.",
  },
  {
    id: 17,
    title: "외계인은 있다 vs 없다",
    optionA: "있다",
    optionB: "없다",
    category: "전통논쟁",
    status: "upcoming",
    heat: 88,
    spectators: 12110,
    scheduledAt: "금요일 20:00",
    openingLine: "우주가 너무 넓다는 말 하나로 매번 다시 불붙는 논쟁",
    editorNote: "과학, 음모론, 낭만이 한 화면에 모이는 안정적인 관전형 주제.",
  },
  {
    id: 18,
    title: "창조론 vs 진화론",
    optionA: "창조론",
    optionB: "진화론",
    category: "전통논쟁",
    status: "upcoming",
    heat: 91,
    spectators: 14260,
    scheduledAt: "토요일 19:00",
    openingLine: "기원에 대한 믿음과 과학 설명이 정면으로 붙는 오래된 링",
    editorNote: "무겁게 갈 수도 있지만, 초반엔 서로 논리 한 방씩 던지는 구조가 잘 맞음.",
  },
  {
    id: 19,
    title: "운명은 정해져 있다 vs 인간은 자유의지가 있다",
    optionA: "운명론",
    optionB: "자유의지",
    category: "철학",
    status: "upcoming",
    heat: 84,
    spectators: 8920,
    scheduledAt: "일요일 22:00",
    openingLine: "내가 늦잠 잔 것도 우주의 계획인지 묻는 철학 경기",
    editorNote: "진지한 철학 주제인데 일상 핑계 드립이 잘 섞일 수 있음.",
  },
  {
    id: 20,
    title: "인간은 본래 선하다 vs 본래 이기적이다",
    optionA: "본래 선함",
    optionB: "본래 이기적",
    category: "철학",
    status: "upcoming",
    heat: 82,
    spectators: 8170,
    scheduledAt: "월요일 21:00",
    openingLine: "성선설과 성악설 사이에서 댓글창 인성 테스트 시작",
    editorNote: "학교에서 한 번쯤 들어본 주제를 현대 댓글 감성으로 다시 굴리는 경기.",
  },
  {
    id: 21,
    title: "결과가 중요하다 vs 과정이 중요하다",
    optionA: "결과",
    optionB: "과정",
    category: "철학",
    status: "upcoming",
    heat: 76,
    spectators: 6380,
    scheduledAt: "화요일 22:00",
    openingLine: "시험, 회사, 인생까지 다 끌려오는 만능 논쟁",
    editorNote: "가볍게 시작해도 자기 경험담이 붙기 쉬운 전통형 주제.",
  },
  {
    id: 22,
    title: "돈으로 행복을 살 수 있다 vs 없다",
    optionA: "살 수 있다",
    optionB: "못 산다",
    category: "전통논쟁",
    status: "upcoming",
    heat: 90,
    spectators: 15920,
    scheduledAt: "수요일 20:00",
    openingLine: "모두가 아니라면서도 잔고를 확인하게 되는 논쟁",
    editorNote: "철학과 현실감이 동시에 있어서 참여 허들이 낮고 댓글 각도가 많음.",
  },
];

const samplePairs: Record<
  number,
  {
    a: [string, string, number, Record<ReactionType, number>];
    b: [string, string, number, Record<ReactionType, number>];
  }
> = {
  1: {
    a: ["새벽상담소", "새벽 2시에 친구 깨우는 것보다 AI한테 먼저 털어놓는 게 예의임. 사람한테 말하면 감정 노동 시키는 느낌인데, AI는 일단 끝까지 들어줌.", 68, { knockout: 6, meme: 13, stretch: 2, fact: 15, funny: 9 }],
    b: ["인간냄새", "맞는 말보다 내 편 들어주는 표정이 필요할 때가 있음. AI는 말은 부드럽게 해도 결국 책임 없는 조언이라 마지막엔 사람이 필요함.", 57, { knockout: 10, meme: 2, stretch: 1, fact: 17, funny: 3 }],
  },
  2: {
    a: ["잠옷팀장", "출근 준비 1시간이 사라지는데 이걸 생산성 하락이라고 부르면 양심 없음. 집중할 사람은 집에서도 하고, 안 할 사람은 사무실에서도 탭 열어둠.", 73, { knockout: 11, meme: 11, stretch: 1, fact: 18, funny: 5 }],
    b: ["슬랙감시자", "재택 3일차부터 회의에서 다들 눈빛이 아니라 아이콘으로만 존재함. 회사는 일만 하는 곳이 아니라 속도 맞추는 공간이기도 함.", 44, { knockout: 5, meme: 14, stretch: 2, fact: 9, funny: 7 }],
  },
  3: {
    a: ["연애탐정", "좋아하면 화장실 가서라도 답장함. 바빠서 못 봤다는 말은 가끔 맞지만, 매번 맞으면 그건 과학이 아니라 판타지임.", 79, { knockout: 18, meme: 16, stretch: 4, fact: 12, funny: 9 }],
    b: ["느린답장러", "답장 느린 사람은 그냥 인생 전체가 로딩 중임. 관심이 없어서는 아니고, 알림 보고 머릿속으로 답장한 뒤 실제로 안 보내는 사람도 있음.", 82, { knockout: 7, meme: 22, stretch: 1, fact: 13, funny: 17 }],
  },
  4: {
    a: ["통장전사", "스트레스도 월급날 잔고 보면 잠깐 조용해짐. 500이면 버틸 명분은 생김. 마음 평화도 결국 월세, 식비, 카드값 앞에서 흔들림.", 54, { knockout: 6, meme: 5, stretch: 2, fact: 14, funny: 3 }],
    b: ["퇴근철학자", "300 받고 잠 잘 자는 게 이기는 거임. 병원비로 200 나가면 500 의미 없음. 오래 버티는 사람은 돈보다 회복 루틴이 있음.", 67, { knockout: 12, meme: 4, stretch: 1, fact: 18, funny: 2 }],
  },
  5: {
    a: ["릴스인질", "누워서 손가락만 움직이는 게 현대인의 명상임. 화면 밝기 낮추고 멍하니 보는 시간도 뇌가 숨 쉬는 시간이라고 봐야 함.", 47, { knockout: 2, meme: 19, stretch: 5, fact: 4, funny: 18 }],
    b: ["뇌절감시단", "3시간 보고 나면 쉬었다는 느낌보다 인생에서 뭐 하나 도난당한 느낌임. 휴식이면 끝나고 개운해야 하는데 보통 죄책감만 남음.", 71, { knockout: 10, meme: 11, stretch: 1, fact: 16, funny: 9 }],
  },
  6: {
    a: ["비밀계좌", "말하는 순간 친척 단톡방에 투자 설명회 열림. 로또 1등은 당첨보다 사후 관리가 본게임이라 무조건 잠수가 맞음.", 91, { knockout: 12, meme: 20, stretch: 1, fact: 19, funny: 16 }],
    b: ["인간불꽃", "1등 됐는데 말 안 하면 그 기쁨을 누구한테 자랑함? 돈보다 자랑이 먼저임. 물론 말하고 나서 번호는 바꿔야 함.", 46, { knockout: 2, meme: 15, stretch: 7, fact: 3, funny: 18 }],
  },
  7: {
    a: ["침대지박령", "라면 끓일 힘 있었으면 애초에 배달앱을 안 켰다. 배달비는 음식값이 아니라 지금 내 몸을 일으키지 않는 비용임.", 62, { knockout: 6, meme: 24, stretch: 1, fact: 8, funny: 21 }],
    b: ["냄비장군", "배달비 5천이면 라면에 계란 두 개 넣고 내가 왕이 됨. 귀찮음도 선이 있지, 배달비가 메뉴 하나 값을 넘으면 정신 차려야 함.", 55, { knockout: 5, meme: 17, stretch: 0, fact: 10, funny: 13 }],
  },
  8: {
    a: ["미래친구", "사람한테 상처받느니 AI랑 행복하면 됨. 행복에 정품 인증서 필요한 것도 아니고, 본인이 덜 외로우면 그게 기능임.", 58, { knockout: 8, meme: 9, stretch: 3, fact: 7, funny: 6 }],
    b: ["현실복귀", "응원은 하는데 결혼식 사회를 챗봇이 보면 그때부터 말릴 거임. 관계는 반응이 아니라 책임까지 포함해야 함.", 64, { knockout: 5, meme: 22, stretch: 2, fact: 5, funny: 17 }],
  },
  9: {
    a: ["카페인해방군", "커피는 대체제가 많음. 라면은 추억, 야식, 비상식량을 다 겸함. 커피는 끊어도 라면 금지는 삶의 보험을 해지하는 느낌임.", 43, { knockout: 6, meme: 4, stretch: 1, fact: 11, funny: 2 }],
    b: ["출근생존자", "라면은 참아도 월요일 아침 커피 금지는 사회 시스템 붕괴임. 커피 없는 오전 회의는 이미 인간 문명에 대한 공격임.", 78, { knockout: 9, meme: 18, stretch: 0, fact: 16, funny: 12 }],
  },
  10: {
    a: ["프로필피해자", "사진 사기는 입장 순간부터 장르가 미스터리로 바뀜. 대화가 재밌어도 첫 신뢰가 깨지면 머릿속에서 계속 보정 전후가 떠다님.", 69, { knockout: 8, meme: 20, stretch: 1, fact: 10, funny: 15 }],
    b: ["침묵공포증", "사진은 적응이라도 하지. 대화 노잼은 2시간 동안 정신이 벽 보고 섬. 소개팅에서 침묵은 시간이 아니라 형벌임.", 74, { knockout: 13, meme: 9, stretch: 1, fact: 15, funny: 8 }],
  },
  11: {
    a: ["계산끝", "5살 10명은 체력전인데 그래도 협상 가능성이 있음. 간식으로 분산 가능. 50살 1명은 인생 경험이 있어서 변수 예측이 안 됨.", 52, { knockout: 4, meme: 21, stretch: 6, fact: 3, funny: 18 }],
    b: ["단판승부", "50살 1명이면 변수 하나임. 10명은 숫자부터 이미 공포 영화임. 작아도 10명이 동시에 울면 정신력부터 무너짐.", 66, { knockout: 9, meme: 10, stretch: 2, fact: 8, funny: 7 }],
  },
  12: {
    a: ["미라클강요단", "아침에 일어나면 하루를 이긴 느낌이 있음. 문제는 전날 밤의 내가 항상 배신함. 그래도 승리감 자체는 아침형이 압도적임.", 58, { knockout: 4, meme: 16, stretch: 1, fact: 10, funny: 13 }],
    b: ["밤샘근무자", "새벽에는 아무도 방해 안 해서 집중력이 다름. 대신 다음날 내가 없음. 그래도 진짜 내 시간이라는 감각은 새벽형만 앎.", 82, { knockout: 6, meme: 11, stretch: 1, fact: 14, funny: 12 }],
  },
  13: {
    a: ["옥타곤주민", "첫 스윙 빗나가면 바로 경기 종료임. 은가누는 튜토리얼이 없음. 방망이가 있어도 접근 허용하는 순간 장르가 스포츠에서 생존으로 바뀜.", 94, { knockout: 18, meme: 24, stretch: 1, fact: 8, funny: 19 }],
    b: ["거리조절러", "방망이는 거리 조절이 된다. 이게 진짜 크다. 맨손은 일단 접근해야 하는데, 오타니가 배트를 든 순간 거리 자체가 무기가 됨.", 88, { knockout: 14, meme: 18, stretch: 2, fact: 11, funny: 13 }],
  },
  14: {
    a: ["미니맹수", "작아도 호랑이는 호랑이임. 100마리가 동시에 오면 귀여움이 아니라 재난임. 작은 발톱 400개는 통계적으로 이미 답이 없음.", 70, { knockout: 7, meme: 15, stretch: 1, fact: 9, funny: 12 }],
    b: ["대왕냥집사", "호랑이 크기 고양이는 일단 기분 나쁘면 도시 하나가 캣타워 됨. 고양이 특유의 변덕이 커지는 순간 협상 불가임.", 83, { knockout: 5, meme: 28, stretch: 2, fact: 4, funny: 24 }],
  },
  15: {
    a: ["투명출근", "투명인간이면 회사 안 가도 아무도 모름. 시간정지는 풀리면 출근해야 됨. 투명은 사회적 책임 회피 능력이라 실전성이 높음.", 59, { knockout: 3, meme: 20, stretch: 4, fact: 4, funny: 17 }],
    b: ["정지버튼", "시간정지는 하루를 1년처럼 쓸 수 있음. 투명인간은 그냥 CCTV 없는 사람임. 효율, 휴식, 도망 전부 시간정지가 상위호환.", 76, { knockout: 12, meme: 6, stretch: 1, fact: 10, funny: 5 }],
  },
  16: {
    a: ["기도메타", "시험 전날엔 다들 무신론자 아니던데? 그 순간만큼은 서버 접속함. 인간이 위기 때 자동으로 찾는 대상이 있다는 게 힌트임.", 69, { knockout: 3, meme: 23, stretch: 2, fact: 4, funny: 20 }],
    b: ["회의주의자", "모르는 걸 신으로 채우면 설명이 아니라 빈칸 꾸미기임. 아직 모른다는 말은 약점이 아니라 정직함에 가까움.", 84, { knockout: 21, meme: 4, stretch: 1, fact: 18, funny: 3 }],
  },
  17: {
    a: ["우주광인", "우주가 이렇게 넓은데 우리만 있으면 그게 더 자원 낭비임. 관측 못 했다는 말과 없다는 말은 완전히 다른 이야기임.", 62, { knockout: 5, meme: 12, stretch: 2, fact: 9, funny: 8 }],
    b: ["증거주의자", "있다는 말은 재밌는데, 아직은 우주 버전 목격담 게시판 수준임. 로망은 인정하지만 증거 없이 확정하면 장르가 바뀜.", 57, { knockout: 10, meme: 6, stretch: 1, fact: 15, funny: 4 }],
  },
  18: {
    a: ["설계도파", "이 정도 복잡도가 우연이면 내 방도 언젠가 자동으로 정리돼야 함. 질서가 계속 나오는데 설계 가능성을 지우는 것도 믿음임.", 51, { knockout: 3, meme: 18, stretch: 4, fact: 5, funny: 13 }],
    b: ["화석수집가", "진화론은 증거가 계속 쌓이는데 창조론은 매번 설명서가 업데이트 안 됨. 설명력이 높은 쪽을 택하는 게 논쟁의 기본임.", 80, { knockout: 19, meme: 5, stretch: 1, fact: 20, funny: 2 }],
  },
  19: {
    a: ["운명론자", "내가 이 댓글을 쓰는 것도 정해져 있었음. 반박도 예정되어 있음. 선택한다고 느끼는 것까지 프로그램이면 자유의지는 착각일 수 있음.", 48, { knockout: 2, meme: 17, stretch: 3, fact: 3, funny: 14 }],
    b: ["선택중독", "운명이라기엔 점심 메뉴 고를 때 내가 너무 오래 고통받음. 인간은 선택 때문에 괴롭고, 그 괴로움이 자유의 증거 같음.", 63, { knockout: 4, meme: 19, stretch: 1, fact: 7, funny: 16 }],
  },
  20: {
    a: ["성선설희망편", "엘리베이터 잡아주는 사람들 보면 인간 아직 괜찮음. 작은 선의가 기본값이고, 이기심은 환경이 사람을 몰아붙일 때 커짐.", 45, { knockout: 3, meme: 2, stretch: 1, fact: 11, funny: 1 }],
    b: ["댓글창목격자", "인간 본성 궁금하면 댓글창 새로고침 한 번이면 됨. 규칙과 처벌이 사라지는 순간 진짜 기본값이 튀어나옴.", 77, { knockout: 10, meme: 25, stretch: 1, fact: 12, funny: 22 }],
  },
  21: {
    a: ["결과주의자", "과정이 아름다워도 제출 안 하면 0점임. 세상은 파일 첨부 여부를 본다. 결국 남는 건 성과와 책임임.", 64, { knockout: 12, meme: 13, stretch: 1, fact: 16, funny: 8 }],
    b: ["과정충", "결과만 보면 운 좋은 사람과 잘한 사람을 구분 못 함. 과정이 실력이고, 다음 결과를 다시 만들 수 있는 근거임.", 53, { knockout: 8, meme: 2, stretch: 1, fact: 14, funny: 1 }],
  },
  22: {
    a: ["행복구매자", "돈으로 행복 못 산다는 말은 배송비 무료 조건을 아직 못 맞춘 사람 말임. 돈은 행복을 직접 사진 않아도 불행을 대량으로 삭제함.", 86, { knockout: 7, meme: 29, stretch: 2, fact: 8, funny: 25 }],
    b: ["잔고철학자", "돈은 불행을 줄여주지 행복을 보장하진 않음. 근데 일단 줄여주는 게 크긴 함. 그래도 관계와 건강은 카드 결제로 끝나지 않음.", 72, { knockout: 9, meme: 6, stretch: 1, fact: 18, funny: 4 }],
  },
};

export const initialComments: ArenaComment[] = Object.entries(samplePairs).flatMap(
  ([arenaId, pair], index) => [
    {
      id: index * 2 + 1,
      arenaId: Number(arenaId),
      side: "A",
      nickname: pair.a[0],
      text: pair.a[1],
      likes: pair.a[2],
      reactions: pair.a[3],
      createdAt: index * 2 + 1,
    },
    {
      id: index * 2 + 2,
      arenaId: Number(arenaId),
      side: "B",
      nickname: pair.b[0],
      text: pair.b[1],
      likes: pair.b[2],
      reactions: pair.b[3],
      createdAt: index * 2 + 2,
    },
  ]
);

export const getReactionTotal = (comment: ArenaComment) =>
  reactionOrder.reduce((total, reaction) => total + comment.reactions[reaction], 0);

export const getCommentScore = (comment: ArenaComment) =>
  comment.likes + getReactionTotal(comment);

export const getTopReaction = (comment: ArenaComment) => {
  const topReaction = reactionOrder.reduce((top, reaction) =>
    comment.reactions[reaction] > comment.reactions[top] ? reaction : top
  );

  return comment.reactions[topReaction] > 0 ? topReaction : null;
};

export const getArenaComments = (
  arenaId: number,
  comments: ArenaComment[] = initialComments
) => comments.filter((comment) => comment.arenaId === arenaId);

export const getArenaHotComment = (
  arenaId: number,
  comments: ArenaComment[] = initialComments
) =>
  [...getArenaComments(arenaId, comments)].sort(
    (a, b) => getCommentScore(b) - getCommentScore(a)
  )[0];

export const getArenaStats = (
  arena: Arena,
  comments: ArenaComment[] = initialComments
) => {
  const targetComments = getArenaComments(arena.id, comments);
  const a = targetComments.filter((comment) => comment.side === "A").length;
  const b = targetComments.filter((comment) => comment.side === "B").length;
  const total = a + b;
  const aPercent = total === 0 ? 50 : Math.round((a / total) * 100);
  const reactionScore = targetComments.reduce(
    (sum, comment) => sum + getCommentScore(comment),
    0
  );
  const heatScore = arena.heat * 2 + arena.spectators / 200 + reactionScore;

  return {
    aPercent,
    bPercent: 100 - aPercent,
    commentCount: targetComments.length,
    heatScore,
    reactionScore,
  };
};

export const getArenaBadge = (
  arena: Arena,
  comments: ArenaComment[] = initialComments
) => {
  const stats = getArenaStats(arena, comments);
  const diff = Math.abs(stats.aPercent - stats.bPercent);

  if (arena.status === "closed") return "명경기 보관";
  if (diff <= 10) return "박빙";
  if (arena.heat >= 98) return "지금 제일 불탐";
  if (stats.commentCount >= 3) return "댓글 과열";
  if (stats.aPercent >= 70) return "A진영 폭주";
  if (stats.bPercent >= 70) return "B진영 반격";
  if (arena.status === "upcoming") return "예열 중";

  return "입 털기 좋음";
};
