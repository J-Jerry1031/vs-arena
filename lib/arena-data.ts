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
  recentCommentsCount: number;
  recentVotesCount: number;
  leftPercent: number;
  rightPercent: number;
  totalVotes: number;
  scheduledAt: string;
  openingLine: string;
  editorNote: string;
};

type ArenaSeed = Omit<
  Arena,
  | "spectators"
  | "recentCommentsCount"
  | "recentVotesCount"
  | "leftPercent"
  | "rightPercent"
  | "totalVotes"
>;

export type ArenaComment = {
  id: number;
  arenaId: number;
  side: Side;
  nickname: string;
  text: string;
  score: number;
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
    tone: "border-[#E7B933]/40 bg-[#E7B933]/10 text-[#F0D77A]",
    canJoin: true,
  },
  live: {
    label: "진행 중",
    section: "진행 중",
    tone: "border-[#2D6A9F]/40 bg-[#2D6A9F]/10 text-[#8EC6F2]",
    canJoin: true,
  },
  upcoming: {
    label: "곧 시작",
    section: "곧 시작",
    tone: "border-[#A53A4A]/40 bg-[#A53A4A]/10 text-[#F0A0AA]",
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
    label: "반박하기",
    badge: "반박하기",
    active: "border-[#A53A4A] bg-[#A53A4A] text-white",
  },
  meme: {
    label: "논리승",
    badge: "논리승",
    active: "border-[#E7B933] bg-[#E7B933] text-black",
  },
  stretch: {
    label: "반대함",
    badge: "반대함",
    active: "border-[#A53A4A] bg-[#A53A4A] text-white",
  },
  fact: {
    label: "인정",
    badge: "인정",
    active: "border-[#E7B933] bg-[#E7B933] text-black",
  },
  funny: {
    label: "웃김",
    badge: "터짐",
    active: "border-[#2D6A9F] bg-[#2D6A9F] text-white",
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

export const LOCAL_COMMENTS_STORAGE_KEY = "vs_arena_comments";

const baseArenas: ArenaSeed[] = [
  {
    id: 1,
    title: "AI한테 고민 상담 가능하다 vs 그래도 사람한테 해야 한다",
    optionA: "AI 상담 가능",
    optionB: "사람이 답",
    category: "AI",
    status: "live",
    heat: 97,
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
    scheduledAt: "수요일 20:00",
    openingLine: "모두가 아니라면서도 잔고를 확인하게 되는 논쟁",
    editorNote: "철학과 현실감이 동시에 있어서 참여 허들이 낮고 댓글 각도가 많음.",
  },
];

const createArena = (
  id: number,
  title: string,
  optionA: string,
  optionB: string,
  category: string,
  openingLine: string,
  editorNote: string
): ArenaSeed => ({
  id,
  title,
  optionA,
  optionB,
  category,
  status: id % 17 === 0 ? "closed" : id % 5 === 0 ? "live" : "upcoming",
  heat: 62 + ((id * 7) % 38),
  scheduledAt:
    id % 17 === 0 ? "아카이브" : id % 5 === 0 ? "진행 중" : "편성 대기",
  openingLine,
  editorNote,
});

const extraArenas: ArenaSeed[] = [
  createArena(23, "AI가 쓴 자기소개서 허용 vs 부정행위", "허용", "부정행위", "AI", "취업 시장에서 도구와 실력의 경계가 흔들리는 경기", "요즘 가장 현실적인 AI 논쟁. 학생, 취준생, 면접관 모두 한마디씩 나올 각."),
  createArena(24, "AI 그림도 예술이다 vs 그냥 생성물이다", "예술", "생성물", "AI", "창작자의 손맛과 프롬프트 감각이 정면충돌", "저작권, 감성, 노동 가치까지 한 번에 끌려오는 AI 단골 떡밥."),
  createArena(25, "AI 의사 진단 믿는다 vs 인간 의사가 낫다", "AI 진단", "인간 의사", "AI", "정확도와 책임 소재가 동시에 걸린 의료형 논쟁", "고위험 주제라 감정선이 세지만, 사용자 관심도는 확실히 높은 주제."),
  createArena(26, "AI 선생님 시대 온다 vs 교육은 사람이 해야 한다", "AI 선생님", "사람 선생님", "AI", "맞춤 학습과 인간적 지도 사이의 미래 교실 배틀", "부모, 학생, 교사 관점이 모두 갈리는 안정적인 토론 소재."),
  createArena(27, "AI 친구는 진짜 친구다 vs 착각이다", "진짜 친구", "착각", "AI", "외로움을 줄여주면 관계인지 아닌지 묻는 감정형 경기", "웃기게 시작해도 생각보다 깊게 들어가는 AI 감정 떡밥."),
  createArena(28, "AI 면접관 공정하다 vs 더 위험하다", "공정함", "위험함", "AI", "편견을 줄인다는 말과 편견을 숨긴다는 말이 부딪힘", "채용, 감시, 알고리즘 불신이 묶이는 직장형 AI 주제."),
  createArena(29, "AI가 만든 음악 좋으면 된다 vs 사람이 만든 게 낫다", "좋으면 됨", "사람 감성", "AI", "귀가 만족하면 끝인지 창작 배경까지 봐야 하는지", "문화 콘텐츠 쪽으로 확장 가능한 가벼운 AI 논쟁."),
  createArena(30, "AI 규제 강하게 해야 한다 vs 혁신 막지 말아야 한다", "강한 규제", "혁신 우선", "AI", "위험 관리와 속도 경쟁이 맞붙는 정책형 아레나", "서비스가 커지면 뉴스성 주제로도 재편성하기 좋은 큰 축."),
  createArena(31, "AI가 내 일자리 뺏는다 vs 새 일자리 만든다", "일자리 뺏김", "새 일자리", "AI", "불안과 낙관이 동시에 터지는 생계형 논쟁", "직장 카테고리와도 맞물려 댓글 경험담이 붙기 쉬움."),
  createArena(32, "AI에게 법적 책임 물어야 한다 vs 만든 사람이 책임져야 한다", "AI 책임", "인간 책임", "AI", "잘못된 결정의 책임을 어디까지 넘길 수 있는가", "철학, 법, 기술을 엮는 고급 논쟁이지만 참여각은 충분함."),

  createArena(33, "주 4일제 가능하다 vs 회사 망한다", "가능", "망함", "직장", "하루 줄인다고 성과도 줄어드는지 묻는 노동 배틀", "직장인 유입을 가장 쉽게 만드는 대표 논쟁."),
  createArena(34, "야근수당 두둑하면 야근 가능 vs 돈 줘도 싫다", "가능", "싫다", "직장", "돈과 시간의 교환비를 두고 벌어지는 퇴근 전쟁", "댓글에 업계별 현실담이 잘 붙는 주제."),
  createArena(35, "회식은 조직문화다 vs 그냥 업무 연장이다", "조직문화", "업무 연장", "직장", "밥 먹는 자리인지 퇴근 후 노동인지 가르는 경기", "세대 차이와 회사 경험담이 자연스럽게 터짐."),
  createArena(36, "성과급 몰빵 vs 기본급 인상", "성과급", "기본급", "직장", "한 방 보상과 안정적 월급 사이의 계산 싸움", "연봉 협상 시즌마다 다시 살아날 수 있는 돈+직장 떡밥."),
  createArena(37, "좋은 상사 밑 낮은 연봉 vs 나쁜 상사 밑 높은 연봉", "좋은 상사", "높은 연봉", "직장", "사람 스트레스와 통장 스트레스 중 하나를 고르는 경기", "대부분 자기 경험을 끌고 와서 댓글 밀도가 높아짐."),
  createArena(38, "칼퇴 눈치 봐야 한다 vs 일 끝났으면 나간다", "눈치 봄", "나간다", "직장", "정시 퇴근이 권리인지 분위기 파괴인지 맞붙음", "짧고 자극적인 직장인 참여용 주제."),
  createArena(39, "퇴사는 질러야 한다 vs 다음 자리 잡고 해야 한다", "질러야 함", "잡고 나감", "직장", "자유와 생존이 동시에 걸린 이직 떡밥", "실전 조언과 무모한 드립이 섞이는 좋은 주제."),
  createArena(40, "사무실 잡담 필요하다 vs 집중 방해다", "필요", "방해", "직장", "팀워크와 생산성 사이의 작은 소음 전쟁", "재택근무 주제와 연결되는 보조 경기로 좋음."),
  createArena(41, "대기업 안정성 vs 스타트업 성장성", "대기업", "스타트업", "직장", "안정된 배와 빠른 롤러코스터 중 하나를 고르는 커리어 배틀", "취업/이직 커뮤니티에서 늘 재등장하는 소재."),
  createArena(42, "회사 메신저 읽씹 가능 vs 업무 예의 아님", "가능", "예의 아님", "직장", "읽음 표시 하나로 시작되는 사무실 심리전", "카톡 답장 논쟁의 직장 버전이라 반응이 빠름."),

  createArena(43, "친구에서 연인 가능 vs 한번 친구면 끝", "가능", "끝", "연애", "오래 안 사람과 설렘의 가능성을 두고 붙는 경기", "연애 카테고리의 클래식. 경험담이 매우 잘 붙음."),
  createArena(44, "장거리 연애 가능 vs 결국 힘들다", "가능", "힘듦", "연애", "거리와 마음의 체력이 동시에 시험대에 오름", "현실 조언과 감정 싸움이 자연스럽게 섞임."),
  createArena(45, "전 애인과 친구 가능 vs 절대 불가", "가능", "불가", "연애", "쿨함과 미련의 경계를 두고 벌어지는 논쟁", "댓글창이 가장 빠르게 과열될 수 있는 연애 떡밥."),
  createArena(46, "첫눈에 반한다 vs 천천히 스며든다", "첫눈", "스며듦", "연애", "순간의 화학작용과 오래 쌓인 호감의 대결", "가볍지만 각자 연애관이 드러나는 좋은 주제."),
  createArena(47, "연애는 타이밍이다 vs 노력이다", "타이밍", "노력", "연애", "운명처럼 만나느냐 끝까지 맞추느냐의 정면승부", "철학 카테고리와도 이어지는 연애형 전통 논쟁."),
  createArena(48, "연인 휴대폰 공개 가능 vs 사생활 침해", "공개 가능", "사생활", "연애", "신뢰 확인과 통제 사이의 위험한 줄타기", "자극적이지만 많은 사람이 바로 입장할 주제."),
  createArena(49, "소개팅 비용 반반 vs 먼저 제안한 사람이 낸다", "반반", "제안자", "연애", "돈과 매너가 한 테이블에 올라오는 경기", "세대별 반응 차이가 크게 나는 안정적 주제."),
  createArena(50, "연애할 때 연락 빈도 중요 vs 만나서 잘하면 된다", "연락 중요", "만남 중요", "연애", "알림 빈도와 실제 애정 표현의 대결", "카톡 답장 논쟁과 묶어 회전율 좋은 주제."),
  createArena(51, "연상 연하 상관없다 vs 나이 차이 중요하다", "상관없음", "중요함", "연애", "숫자와 생활 단계가 관계에 미치는 영향", "가볍게 시작해도 가치관이 갈리는 소재."),
  createArena(52, "사랑 없는 결혼 가능 vs 불가능", "가능", "불가능", "연애", "현실 조건과 감정의 우선순위가 충돌하는 경기", "돈, 가족, 인생관까지 넓게 번질 수 있음."),

  createArena(53, "집 사야 한다 vs 전월세가 낫다", "매수", "전월세", "돈", "안정과 유동성 사이에서 갈리는 현실형 논쟁", "부동산 이야기는 늘 뜨겁지만 MVP에선 일반론으로 굴리기 좋음."),
  createArena(54, "비트코인 장기투자 vs 위험한 투기", "장투", "투기", "돈", "미래 자산과 롤러코스터 사이의 선택", "시장 상황에 따라 언제든 다시 편성 가능한 돈 떡밥."),
  createArena(55, "저축 먼저 vs 경험 소비 먼저", "저축", "경험", "돈", "통장 잔고와 인생 추억이 맞붙는 경기", "MZ 소비관 논쟁으로 가볍게 붙이기 좋음."),
  createArena(56, "카드 할부 현명하다 vs 미래의 나 괴롭히기", "현명", "괴롭힘", "돈", "지금의 만족을 미래 월급이 갚는 구조", "생활밀착형이라 댓글이 빠르게 쌓이는 주제."),
  createArena(57, "돈 관리는 앱으로 충분 vs 직접 가계부 써야 한다", "앱 충분", "직접 기록", "돈", "자동화와 손맛 가계부의 소비 통제 배틀", "소소하지만 실전 팁 댓글이 붙기 쉬움."),
  createArena(58, "친구에게 돈 빌려준다 vs 관계 망친다", "빌려줌", "안 빌려줌", "돈", "돈보다 관계가 비싸다는 말을 시험하는 경기", "경험담이 강해서 몰입도가 높음."),
  createArena(59, "명품 하나 오래 쓰기 vs 가성비 여러 개", "명품 하나", "가성비 여러 개", "돈", "소비 철학과 자기 만족이 맞붙는 주제", "가볍게 들어와도 취향과 계층감이 드러남."),
  createArena(60, "복권 매주 산다 vs 그 돈 투자한다", "복권", "투자", "돈", "희망 비용과 복리 계산의 대결", "로또 주제와 자연스럽게 연결되는 돈 카테고리 보강."),
  createArena(61, "공동계좌 필요하다 vs 각자 관리가 낫다", "공동계좌", "각자 관리", "돈", "커플과 부부의 재정 신뢰를 묻는 경기", "연애 카테고리와도 잘 이어지는 현실 떡밥."),
  createArena(62, "돈은 빨리 벌어야 한다 vs 천천히 오래 벌어야 한다", "빠르게", "오래", "돈", "한 방과 지속 가능성의 인생 재무 배틀", "성공담, 실패담, 욕망이 같이 붙는 큰 주제."),

  createArena(63, "민초는 음식이다 vs 치약이다", "음식", "치약", "생활", "가벼운데 이상하게 모두가 진심이 되는 맛 논쟁", "커뮤니티 입문용으로 아주 좋은 짧은 떡밥."),
  createArena(64, "부먹 vs 찍먹", "부먹", "찍먹", "생활", "소스 하나로 국민 분열을 일으키는 클래식", "전통 밈 주제로 회전율이 높고 드립도 잘 나옴."),
  createArena(65, "아이스 아메리카노 겨울에도 가능 vs 계절감 없다", "가능", "계절감 없음", "생활", "카페인 신앙과 체온 보존의 충돌", "일상형이라 부담 없이 참여하기 좋음."),
  createArena(66, "샤워 아침에 한다 vs 밤에 한다", "아침", "밤", "생활", "상쾌한 출근과 깨끗한 침대 사이의 루틴 전쟁", "생활습관 얘기는 댓글이 안정적으로 붙음."),
  createArena(67, "약속 10분 전 도착 vs 딱 맞춰 도착", "10분 전", "정시", "생활", "성실함과 효율 사이에서 갈리는 시간관념", "작지만 사람 성향이 확 드러나는 주제."),
  createArena(68, "혼밥 편하다 vs 외롭다", "편함", "외로움", "생활", "자유와 고독을 한 끼 식사에 올리는 경기", "세대별 반응과 경험담이 잘 섞임."),
  createArena(69, "주말은 집콕 vs 무조건 외출", "집콕", "외출", "생활", "회복 방식이 정반대로 갈리는 휴식 논쟁", "가볍고 참여 장벽이 낮은 생활형 주제."),
  createArena(70, "종이책 감성 vs 전자책 편리함", "종이책", "전자책", "생활", "냄새와 무게, 검색과 휴대성이 맞붙는 경기", "문화 취향까지 확장 가능한 잔잔한 논쟁."),
  createArena(71, "알람 여러 개 맞춘다 vs 하나만 믿는다", "여러 개", "하나만", "생활", "아침마다 벌어지는 자기 불신의 기술", "웃긴 자기고발 댓글이 잘 나올 주제."),
  createArena(72, "계획 여행 vs 즉흥 여행", "계획", "즉흥", "생활", "일정표와 현장감이 정면으로 부딪히는 여행 논쟁", "휴가철마다 재활용 가능한 안정적 주제."),

  createArena(73, "평생 인터넷 없음 vs 평생 친구 없음", "인터넷 없음", "친구 없음", "선택지옥", "현대인의 사회성을 잔인하게 시험하는 선택", "would you rather 계열의 강한 딜레마."),
  createArena(74, "하루 3시간만 자기 vs 매일 12시간 자기", "3시간", "12시간", "선택지옥", "시간 확보와 인생 삭제 사이의 극단 배틀", "말도 안 되지만 계산하게 만드는 밸런스게임."),
  createArena(75, "평생 매운 음식 금지 vs 평생 단 음식 금지", "매운맛 금지", "단맛 금지", "선택지옥", "입맛 정체성을 걸고 싸우는 음식 선택지", "가볍게 많이 참여할 수 있는 밸런스형."),
  createArena(76, "과거로 10년 vs 미래로 10년", "과거", "미래", "선택지옥", "후회 수정과 미래 선점을 두고 벌어지는 상상 선택", "철학과 상상배틀 사이에서 잘 굴러감."),
  createArena(77, "평생 거짓말 못함 vs 평생 진심 못 말함", "거짓말 못함", "진심 못 말함", "선택지옥", "사회생활과 인간관계를 동시에 망칠 수 있는 선택", "댓글로 상황극이 많이 나올 수 있음."),
  createArena(78, "매일 같은 옷 vs 매일 같은 음식", "같은 옷", "같은 음식", "선택지옥", "자존심과 식욕 중 무엇을 포기할지 묻는 경기", "밸런스게임 모음에서 자주 보이는 생활형 딜레마 감성."),
  createArena(79, "평생 노래 못 듣기 vs 평생 영화 못 보기", "노래 금지", "영화 금지", "선택지옥", "일상 BGM과 긴 서사의 생존성을 겨룸", "취향 댓글이 빠르게 붙는 문화형 선택지."),
  createArena(80, "모든 생각 공개 vs 모든 과거 공개", "생각 공개", "과거 공개", "선택지옥", "프라이버시를 어디서 잃는 게 덜 치명적인가", "자극적이지만 직접 참여 욕구가 큰 주제."),
  createArena(81, "평생 더위만 느끼기 vs 평생 추위만 느끼기", "더위", "추위", "선택지옥", "계절 고통을 하나만 고르는 원초적 밸런스", "짧은 투표와 드립에 좋은 소재."),
  createArena(82, "내일 10억 받기 vs 10년 뒤 100억 받기", "내일 10억", "10년 뒤 100억", "선택지옥", "현재 가치와 인내심이 정면으로 붙는 돈 선택지", "돈 카테고리와도 연결되는 강력한 밸런스게임."),

  createArena(83, "좀비 100명 vs 곰 1마리", "좀비 100", "곰 1", "상상배틀", "숫자 공포와 피지컬 공포 중 무엇이 더 치명적인가", "상상 시뮬레이션 댓글이 잘 터지는 매치업."),
  createArena(84, "배트맨 돈 없음 vs 아이언맨 돈 없음", "배트맨", "아이언맨", "상상배틀", "장비빨 빠진 히어로의 순수 실력 논쟁", "대중문화 드립을 끌어오기 좋은 가벼운 경기."),
  createArena(85, "손흥민 야구 도전 vs 오타니 축구 도전", "손흥민 야구", "오타니 축구", "상상배틀", "운동 천재의 종목 변경 가능성을 상상하는 경기", "스포츠 팬들이 바로 들어올 수 있는 매치업."),
  createArena(86, "라면만 먹는 헐크 vs 삼겹살 먹는 스파이더맨", "라면 헐크", "삼겹 스파이더맨", "상상배틀", "영양과 능력치가 이상하게 섞이는 개그 매치", "말도 안 되는 제목일수록 댓글 드립이 살아남."),
  createArena(87, "초등학생 지능 성인 몸 vs 성인 지능 초등학생 몸", "성인 몸", "성인 지능", "상상배틀", "몸과 머리 중 무엇이 생존에 더 중요한지", "상상배틀과 철학적 정체성 논쟁 사이의 주제."),
  createArena(88, "하늘 날기 vs 순간이동", "하늘 날기", "순간이동", "상상배틀", "낭만과 효율이 붙는 초능력 대표 경기", "밸런스게임 클래식. 참여 장벽이 거의 없음."),
  createArena(89, "동물과 대화 vs 모든 언어 습득", "동물 대화", "모든 언어", "상상배틀", "귀여움과 실용성 사이에서 흔들리는 능력 선택", "가볍고 반응 좋은 초능력형 주제."),
  createArena(90, "공룡 한 마리 부활 vs 멸종동물 전부 부활", "공룡 한 마리", "멸종동물 전부", "상상배틀", "낭만과 생태계 혼란이 같이 오는 상상 경기", "과학 드립과 재난 시뮬레이션이 붙기 좋음."),
  createArena(91, "슈퍼컴퓨터 두뇌 vs 불사신 몸", "두뇌", "불사신", "상상배틀", "지능과 생존력 중 어떤 능력이 인생을 바꾸는가", "선택 이유가 길어지기 쉬운 능력 배틀."),
  createArena(92, "도라에몽 주머니 vs 타임머신", "주머니", "타임머신", "상상배틀", "만능 도구와 시간 조작의 사기성 대결", "추억과 상상력이 섞이는 대중적 주제."),

  createArena(93, "사형제 필요하다 vs 폐지해야 한다", "필요", "폐지", "전통논쟁", "정의, 오판, 응보가 충돌하는 무거운 고전 논쟁", "사회적 논쟁으로 오래 이어진 주제라 운영 톤 조절이 중요."),
  createArena(94, "표현의 자유 우선 vs 혐오 규제 우선", "표현 자유", "혐오 규제", "전통논쟁", "말할 자유와 피해 방지 사이의 경계선 싸움", "운영 정책과도 연결되는 핵심 논쟁."),
  createArena(95, "능력주의 공정하다 vs 출발선부터 불공정하다", "공정", "불공정", "전통논쟁", "노력의 보상과 구조적 차이가 맞붙는 사회형 경기", "요즘 사회 분위기와 잘 맞는 큰 논쟁."),
  createArena(96, "동물실험 필요하다 vs 비윤리적이다", "필요", "비윤리", "전통논쟁", "의학 발전과 생명 윤리의 충돌", "전통 윤리 논쟁으로 꾸준히 토론 가능한 소재."),
  createArena(97, "원전은 필요하다 vs 위험하다", "필요", "위험", "전통논쟁", "에너지 현실과 안전 불안이 맞붙는 정책형 주제", "시사성이 있지만 오래 가는 구조적 논쟁."),
  createArena(98, "기본소득 필요하다 vs 근로 의욕 떨어진다", "필요", "의욕 저하", "전통논쟁", "사회 안전망과 경제 동기 사이의 큰 질문", "경제/복지 논쟁으로 댓글 논리가 길어지기 좋음."),
  createArena(99, "교육은 평등해야 한다 vs 경쟁이 필요하다", "평등", "경쟁", "전통논쟁", "기회의 균등과 성취 경쟁 사이의 교육 철학", "부모, 학생, 직장인까지 모두 끼어들 수 있음."),
  createArena(100, "개인정보 보호 우선 vs 편리함 우선", "보호", "편리함", "전통논쟁", "감시와 편리함의 교환비를 묻는 현대 고전", "AI/플랫폼 논쟁과도 연결되는 안정적 주제."),
  createArena(101, "결혼은 필수다 vs 선택이다", "필수", "선택", "전통논쟁", "가족 제도와 개인 삶의 방식이 충돌하는 주제", "세대 차이가 크게 드러나는 전통형 논쟁."),
  createArena(102, "인간은 자연을 지배해야 한다 vs 공존해야 한다", "지배", "공존", "전통논쟁", "개발과 생태 사이에서 오래 반복된 질문", "환경 주제로도 확장 가능한 큰 논쟁."),

  createArena(103, "의식은 뇌의 결과다 vs 영혼이 있다", "뇌의 결과", "영혼", "철학", "과학 설명과 존재 감각이 맞붙는 깊은 경기", "신 존재 논쟁과 연결되는 철학 카테고리 핵심 주제."),
  createArena(104, "나는 기억의 합이다 vs 몸의 연속성이다", "기억", "몸", "철학", "정체성을 무엇으로 볼지 묻는 고전 질문", "텔레포트 사고실험 같은 댓글이 붙기 좋음."),
  createArena(105, "행복은 쾌락이다 vs 의미다", "쾌락", "의미", "철학", "즐거움과 목적 중 무엇이 삶을 지탱하는가", "돈으로 행복 논쟁과 이어지는 좋은 철학 보강."),
  createArena(106, "도덕은 절대적이다 vs 시대에 따라 바뀐다", "절대", "상대", "철학", "옳고 그름의 기준이 어디서 오는지 묻는 경기", "전통 윤리학의 대표 주제로 안정적."),
  createArena(107, "목적이 수단을 정당화한다 vs 안 된다", "정당화", "안 된다", "철학", "결과주의와 의무론이 한 문장으로 붙는 경기", "짧은 제목인데 댓글은 깊어질 수 있음."),
  createArena(108, "인간은 이성적이다 vs 감정적이다", "이성", "감정", "철학", "합리적 존재라는 자존심을 흔드는 질문", "일상 사례가 많이 붙는 철학 입문형 주제."),
  createArena(109, "아는 것이 힘이다 vs 모르는 게 약이다", "아는 것", "모르는 것", "철학", "진실을 감당할 수 있는지 묻는 생활형 철학", "밈처럼 가볍게도, 진지하게도 굴릴 수 있음."),
  createArena(110, "인생은 경쟁이다 vs 협력이다", "경쟁", "협력", "철학", "사회와 인간관계를 보는 기본 시선이 갈리는 경기", "직장/교육 논쟁과도 자연스럽게 연결됨."),
  createArena(111, "기술은 인간을 자유롭게 한다 vs 더 종속시킨다", "자유", "종속", "철학", "스마트폰부터 AI까지 모두 끌려오는 현대 철학", "AI 카테고리에서 넘어오는 유저를 잡기 좋은 주제."),
  createArena(112, "죽음이 있어야 삶이 의미 있다 vs 없어도 의미 있다", "죽음 필요", "의미 있음", "철학", "유한성과 의미를 두고 벌어지는 무거운 클래식", "깊은 댓글을 유도하는 철학 카테고리 마감 카드."),
  createArena(113, "애인이 이성 친구와 단둘이 술 가능 vs 절대 불가", "가능", "절대 불가", "연애", "믿음과 굳이 만드는 불안이 정면으로 붙는 연애 불판", "단톡방에 던지는 순간 바로 편 갈리는 바이럴형 주제."),
  createArena(114, "월 300 평생 받기 vs 로또 1등 한 번", "월 300 평생", "로또 1등", "돈", "안정적인 안전벨트와 인생 리셋 버튼 사이의 현실 배틀", "돈 얘기인데 누구나 자기 인생 기준으로 바로 답하게 되는 주제."),
  createArena(115, "출근 10분 거리 월급 250 vs 출근 1시간 거리 월급 350", "10분 250", "1시간 350", "직장", "통근 시간과 월급 100만원의 교환비를 묻는 직장인 불판", "회사 다니는 사람은 제목만 봐도 이미 계산기 켜는 주제."),
  createArena(116, "AI 연애상담 믿을 수 있다 vs 절대 못 믿는다", "믿을 수 있음", "절대 못 믿음", "AI", "객관적인 조언과 책임 없는 위로 사이의 연애 상담 배틀", "AI와 연애를 동시에 건드려 외부 유입 반응이 빠른 주제."),
  createArena(117, "읽씹이 더 싫다 vs 늦답이 더 싫다", "읽씹", "늦답", "연애", "확실한 상처와 길게 끄는 희망고문 중 무엇이 더 빡치는가", "카톡 답장 논쟁의 압축판. 누구나 한 번쯤 당해본 주제."),
  createArena(118, "죽기 전 진실 알기 vs 모른 채 행복하게 살기", "진실 알기", "모른 채 행복", "선택지옥", "알 권리와 평온한 착각 중 하나를 고르는 마지막 질문", "철학적이지만 제목만으로 바로 선택하게 되는 쉬운 딜레마."),
];

export const seededNumber = (seed: number, min: number, max: number) => {
  const range = max - min + 1;
  const mixed = Math.abs(Math.sin(seed * 999.91) * 10000);

  return min + (Math.floor(mixed) % range);
};

const votePercents = [51, 63, 74, 48, 82, 56, 39, 68, 43, 57, 71, 52, 66, 35, 79, 46, 61, 88, 54, 72, 41, 59];
const closeVotePercents = [51, 52, 49, 53, 46, 48, 54];

export const arenas: Arena[] = [...baseArenas, ...extraArenas].map((arena) => {
  const heat = seededNumber(arena.id * 5 + arena.heat, 58, 98);
  const baseLeftPercent = votePercents[arena.id % votePercents.length];
  const leftPercent =
    Math.abs(baseLeftPercent - 50) <= 4
      ? closeVotePercents[seededNumber(arena.id * 31 + arena.heat, 0, closeVotePercents.length - 1)]
      : baseLeftPercent;

  return {
    ...arena,
    heat,
    spectators: seededNumber(arena.id * 13 + arena.heat, 12, 180),
    recentCommentsCount: seededNumber(arena.id * 19 + heat, 1, 6),
    recentVotesCount: seededNumber(arena.id * 23 + heat, 4, 36),
    leftPercent,
    rightPercent: 100 - leftPercent,
    totalVotes: seededNumber(arena.id * 29 + heat, 42, 280),
  };
});

type SamplePair = {
  a: [string, string, number, Record<ReactionType, number>];
  b: [string, string, number, Record<ReactionType, number>];
};

const samplePairs: Partial<Record<number, SamplePair>> = {
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
  45: {
    a: ["쿨한척금지", "전 애인이랑 친구 가능하다는 건 둘 중 한 명이 아직 정리를 덜 했다는 뜻임.", 88, { knockout: 12, meme: 18, stretch: 2, fact: 14, funny: 11 }],
    b: ["거리두기장인", "가능은 하지. 근데 내 애인이 그러면 갑자기 불가능해짐. 이게 이 주제의 핵심임.", 93, { knockout: 16, meme: 21, stretch: 1, fact: 12, funny: 18 }],
  },
  58: {
    a: ["의리잔고", "잃어도 되는 돈이면 빌려주고, 아니면 안 빌려주는 게 맞음. 친구보다 상환일이 무서워짐.", 66, { knockout: 8, meme: 9, stretch: 1, fact: 17, funny: 5 }],
    b: ["채무자공포증", "돈 빌려주는 순간 친구가 채무자로 보이기 시작함. 관계 망치는 지름길임.", 82, { knockout: 13, meme: 12, stretch: 2, fact: 15, funny: 8 }],
  },
  63: {
    a: ["민초수호단", "민초 싫다는 사람들 특: 한 입 먹고 표정부터 과장함. 치약이면 치약 회사가 이렇게 맛있게 만들 리 없음.", 75, { knockout: 6, meme: 28, stretch: 4, fact: 4, funny: 24 }],
    b: ["치약감별사", "민초는 디저트가 아니라 양치 후 디저트 먹는 느낌임. 입이 헷갈려함.", 79, { knockout: 4, meme: 31, stretch: 3, fact: 3, funny: 27 }],
  },
  64: {
    a: ["소스민주화", "부먹은 소스 맛이고 찍먹은 튀김 맛임. 애초에 다른 종목임.", 92, { knockout: 10, meme: 23, stretch: 1, fact: 10, funny: 16 }],
    b: ["튀김수호자", "부먹은 단체전에서 독재임. 찍먹은 최소한 선택권을 줌.", 97, { knockout: 14, meme: 26, stretch: 1, fact: 8, funny: 19 }],
  },
  73: {
    a: ["오프라인공포", "인터넷 없으면 세상에서 삭제되는 느낌일 듯. 친구 없어도 인터넷엔 사람이 너무 많음.", 61, { knockout: 5, meme: 14, stretch: 3, fact: 7, funny: 10 }],
    b: ["친구0명불가", "친구는 적어도 되는데 0명은 다른 얘기임. 불편함보다 외로움이 오래 감.", 87, { knockout: 12, meme: 11, stretch: 1, fact: 15, funny: 8 }],
  },
  113: {
    a: ["믿음테스트", "술이 문제가 아니라 단둘이가 문제임. 굳이 불안한 상황을 만드는 건 믿음이랑 다른 얘기임.", 84, { knockout: 14, meme: 10, stretch: 1, fact: 19, funny: 7 }],
    b: ["잠못자는편", "괜찮다고 말은 할 수 있음. 근데 그날 잠은 잘 못 잠.", 91, { knockout: 11, meme: 24, stretch: 2, fact: 9, funny: 20 }],
  },
  114: {
    a: ["월300안정파", "월 300은 안전벨트고 로또 1등은 탈출 버튼임. 안정감이냐 리셋이냐 차이임.", 86, { knockout: 8, meme: 26, stretch: 1, fact: 12, funny: 19 }],
    b: ["인생리셋러", "로또 1등 받고 조용히 사라질 자신 있으면 로또지. 문제는 인간관계가 본게임이라는 거.", 94, { knockout: 13, meme: 25, stretch: 1, fact: 14, funny: 17 }],
  },
  115: {
    a: ["통근혐오자", "출근 10분은 복지임. 돈으로 환산 안 해본 사람만 왕복 2시간을 쉽게 말함.", 78, { knockout: 12, meme: 13, stretch: 1, fact: 18, funny: 9 }],
    b: ["월급계산기", "월 100 차이면 솔직히 고민됨. 대신 6개월 뒤 출근길에서 내 성격이 먼저 망가질 듯.", 73, { knockout: 7, meme: 18, stretch: 2, fact: 11, funny: 13 }],
  },
  116: {
    a: ["AI상담러", "친구보다 객관적일 때도 있음. 문제는 내가 듣고 싶은 말 나올 때까지 계속 물어본다는 거임.", 76, { knockout: 8, meme: 15, stretch: 2, fact: 13, funny: 9 }],
    b: ["표정중요파", "AI는 말은 잘하는데 책임지는 표정이 없음. 연애상담은 정답보다 내 편이 필요한 순간도 있음.", 83, { knockout: 11, meme: 10, stretch: 1, fact: 17, funny: 5 }],
  },
  117: {
    a: ["읽씹상처파", "읽씹은 확실히 아픈데 끝은 남. 늦답은 사람을 계속 기다리게 해서 더 나쁨.", 82, { knockout: 10, meme: 16, stretch: 2, fact: 14, funny: 8 }],
    b: ["희망고문싫음", "읽씹은 종료고 늦답은 희망고문임. 답장보다 내 자존심이 먼저 닳음.", 96, { knockout: 15, meme: 22, stretch: 1, fact: 12, funny: 16 }],
  },
  118: {
    a: ["진실중독", "모르고 행복한 게 편한 건 아는데, 죽기 전이면 진실 한 번은 보고 가야 하지 않나.", 58, { knockout: 6, meme: 6, stretch: 2, fact: 13, funny: 3 }],
    b: ["평온우선", "마지막에 진실 알고 멘탈 나가면 그게 무슨 의미임. 행복하게 모르는 것도 능력임.", 74, { knockout: 9, meme: 13, stretch: 1, fact: 10, funny: 8 }],
  },
};

const generatedReactions = (
  seed: number,
  sideOffset: number
): Record<ReactionType, number> => ({
  knockout: 1 + ((seed + sideOffset) % 5),
  meme: 1 + ((seed * 2 + sideOffset) % 6),
  stretch: (seed + sideOffset) % 4,
  fact: 1 + ((seed * 3 + sideOffset) % 6),
  funny: 1 + ((seed * 5 + sideOffset) % 6),
});

const generatedNicknames = [
  "현실파",
  "퇴근요정",
  "선택장애",
  "1년만버팀",
  "멘탈먼저",
  "돈이급함",
  "연애초보",
  "답장기다림",
  "커피중독",
  "라면파",
  "와이파이중독",
  "알림꺼둠",
  "혼자잘놈",
  "친구둘이면충분",
  "월세무서움",
  "퇴사각",
  "오늘만봄",
  "후회싫음",
  "주말만기다림",
  "해봤음",
  "과몰입중",
  "일단의심",
  "잠이보약",
  "통장수호자",
  "퇴근길",
  "거리두는중",
  "그럴수있지",
  "아직고민중",
  "일단살자",
  "내맘임",
  "루틴파",
  "지나가던사람",
];

const hasFinalConsonant = (text: string) => {
  const lastCode = text.trim().charCodeAt(text.trim().length - 1);

  return lastCode >= 0xac00 && lastCode <= 0xd7a3
    ? (lastCode - 0xac00) % 28 !== 0
    : false;
};

const withParticle = (text: string, consonant: string, vowel: string) =>
  `${text}${hasFinalConsonant(text) ? consonant : vowel}`;

const asTopic = (text: string) => withParticle(text, "은", "는");
const asSubject = (text: string) => withParticle(text, "이", "가");
const asObject = (text: string) => withParticle(text, "을", "를");

const generatedAComments: Array<(arena: Arena) => string> = [
  (arena) => `솔직히 ${arena.optionA}. 이유 길게 쓰려다 그냥 이게 내 답임.`,
  (arena) => `${arena.optionB} 골랐다가 후회해본 적 있어서 이번엔 ${arena.optionA}.`,
  (arena) => `내 주변은 다 ${arena.optionB}라는데 나는 혼자 ${arena.optionA} 누름 ㅋㅋ`,
  (arena) => `${asTopic(arena.optionA)} 적어도 다음 날의 나한테 변명은 가능함.`,
  (arena) => `이건 좀 고민했는데 막상 닥치면 ${asObject(arena.optionA)} 고를 듯.`,
  (arena) => `${arena.optionA}. 생각보다 사람은 익숙한 불편을 잘 버팀.`,
  (arena) => `해봤는데 ${asSubject(arena.optionA)} 낫더라. 말로 볼 때랑 진짜 다름.`,
  (arena) => `친구는 ${arena.optionB} 쪽이라는데 그 말 듣고 더 ${arena.optionA} 쪽으로 감.`,
  (arena) => `${arena.optionA} 쪽. 거창한 신념 없고 그냥 내 일상이 덜 피곤함.`,
  (arena) => `처음엔 반대였는데 한 달까지 생각하니까 ${arena.optionA}.`,
  (arena) => `${arena.optionA} 고르고 후회할래. ${arena.optionB}는 시작부터 자신 없음.`,
  (arena) => `ㄹㅇ 이건 ${arena.optionA}. 반대쪽도 이해는 가는데 나는 못 함.`,
];

const generatedBComments: Array<(arena: Arena) => string> = [
  (arena) => `${arena.optionA} 말은 멋있지. 근데 현실의 나는 ${arena.optionB}임.`,
  (arena) => `나는 ${arena.optionB}. 한 번 겪어보면 왜 이쪽인지 바로 앎.`,
  (arena) => `${asObject(arena.optionA)} 해봤는데 생각보다 오래 감. 다시면 ${arena.optionB}.`,
  (arena) => `${arena.optionB} 누르고 마음 편하게 잘래. 그게 제일 큼.`,
  (arena) => `다들 ${arena.optionA} 쪽이라는데 나는 왜 ${asSubject(arena.optionB)} 더 끌리냐.`,
  (arena) => `${asTopic(arena.optionB)} 재미는 없어도 사고는 덜 칠 것 같음.`,
  (arena) => `개인적으로 ${arena.optionB}. 나중 일보다 오늘 버티는 게 먼저임.`,
  (arena) => `${arena.optionA} 선택한 사람들 대단함. 나는 그냥 ${arena.optionB} 쪽 갈게.`,
  (arena) => `처음 5초는 ${arena.optionA}, 생각 좀 하면 ${arena.optionB}.`,
  (arena) => `${arena.optionB}. 내 주변 실제 사례 보고 마음 굳힘.`,
  (arena) => `이거 은근 갈리네 ㅋㅋ 그래도 나는 ${arena.optionB}.`,
  (arena) => `둘 다 싫은데 꼭 고르라면 ${arena.optionB}. 덜 후회할 듯.`,
];

type CommentPack = { A: string[]; B: string[] };

const representativeCommentPacks: Partial<Record<number, CommentPack>> = {
  3: {
    A: [
      "좋아하면 화장실 가서라도 답장함.",
      "하루 넘게 안 보면 관심도 같이 퇴근한 거 아님?",
      "바쁜 건 이해함. 근데 매번 바쁜 건 그냥 순위가 낮은 거지.",
      "답장 말고 다른 사람 스토리는 잘 보더라. 거기서 끝남.",
      "나도 느린 편인데 좋아하는 사람 톡은 이상하게 바로 보임 ㅋㅋ",
      "칼답까지는 안 바라는데 반나절은 좀 그렇잖아.",
      "처음엔 성격인 줄 알았는데 나한테만 느렸음. 경험담임.",
    ],
    B: [
      "답장 속도로 마음 재면 연애가 아니라 출석체크임.",
      "느린 사람은 진짜 다 느림. 배달앱 알림도 하루 뒤에 봄.",
      "머릿속으로 답장하고 실제 전송 안 하는 사람 여기 있음.",
      "칼답만 사랑이면 나는 평생 무성애자임 ㅋㅋ",
      "중요한 건 속도보다 내용임. 1분 만에 ㅇㅇ 오는 게 더 싫음.",
      "일할 때 폰 아예 안 보는 사람도 있음. 다 관심 없음으로 몰면 피곤함.",
      "나한테도 느리고 엄마한테도 느림. 그냥 그런 인간 맞음.",
    ],
  },
  4: {
    A: [
      "500 받고 울면서 택시 타고 퇴근할 듯.",
      "300 마음 평화라는데 월세 내면 평화 바로 사라짐.",
      "지금 300인데 마음도 안 평화로움… 그럼 500 갈래.",
      "월급날만큼은 상사 얼굴이 흐릿해질 것 같음.",
      "1년만 버티고 퇴사각 잡으면 됨. 일단 종잣돈부터.",
      "눈빛은 원래 없었고 통장이라도 있어야 함.",
      "500이면 야근 후 배달에 택시까지 가능. 300 야근이 진짜 공포임.",
      "솔직히 돈 급한 시기엔 워라밸도 사치더라. 딱 2년만 가능.",
    ],
    B: [
      "돈보다 잠이 먼저라는 걸 야근하면서 배웠음.",
      "1년 버틴다는 사람들 보통 3개월 뒤에 눈빛 사라짐.",
      "500 받아서 병원비랑 배달비로 200 쓰면 뭐가 남냐.",
      "퇴근 후 내 시간이 있어야 돈 쓸 힘도 생김.",
      "둘 다 해봤는데 500 스트레스는 주말까지 따라옴.",
      "300도 상사가 이상하면 300 지옥인 건 인정. 그래도 칼퇴는 지킴.",
      "통장 잔고보다 일요일 저녁 심장 두근거림이 더 무서움.",
      "내가 퇴사한 이유가 딱 이거였음. 다시 가도 300.",
    ],
  },
  10: {
    A: [
      "사진 사기는 만나는 순간 신뢰부터 마이너스임.",
      "대화 노잼은 집에 가면 끝나는데 사진 사기는 계속 생각남.",
      "각도 차이는 이해함. 본인 아닌 수준이면 장르가 다름.",
      "카페 문 열고 서로 못 알아본 적 있음. 그날 이후 사진 봄.",
      "말 잘 통해도 첫 10분 동안 보정 앱만 생각날 듯.",
      "노잼은 긴장해서 그럴 수도 있음. 사진은 이미 준비한 거잖아.",
    ],
    B: [
      "사진은 적응이라도 하지. 대화 노잼은 두 시간이 안 감.",
      "질문 세 번 했는데 단답 세 번 오면 집 가고 싶음.",
      "사진보다 침묵이 더 무서움. 얼음 녹는 소리까지 들림.",
      "외모는 보다 보면 괜찮아지는데 재미없는 건 점점 더 재미없음.",
      "소개팅에서 내가 혼자 진행자 된 적 있음. 다시는 못 함.",
      "사진 사기여도 웃기면 다음 약속 가능. 노잼은 첫날 종료.",
    ],
  },
  73: {
    A: [
      "친구 없어도 인터넷엔 사람 많음. 쓰고 보니 좀 슬프네.",
      "와이파이 하루 끊겨도 불안한데 평생은 진짜 못 함.",
      "인터넷 없으면 일도 취미도 은행도 다 막힘. 현실적으로 불가.",
      "친구는 온라인에서 만들면 되잖아. 어? 인터넷이 없네.",
      "지도 없이 길 찾는 것부터 못 함. 친구한테 전화하면 되나…",
      "오프라인 취미 만들면 된다는데 그 취미 검색을 어디서 함 ㅋㅋ",
      "친구 0명도 무섭지만 인터넷 0은 생활 자체가 1998년 됨.",
    ],
    B: [
      "친구는 적어도 되는데 0명은 다른 얘기임.",
      "인터넷이 위로는 해줘도 아플 때 죽 사다 주진 못함.",
      "혼자 잘 노는 편인데도 평생 0명은 멘탈 갈릴 듯.",
      "온라인 사람 백 명보다 전화할 사람 한 명이 더 필요할 때가 있음.",
      "인터넷 없이도 살았던 시절은 있는데 친구 없이 산 적은 없음.",
      "이거 인터넷 고른 사람들 일주일 뒤에 사람 찾아다닐 듯.",
      "친구 둘이면 충분하다는 말이지 0명이 괜찮다는 말은 아님.",
    ],
  },
};

const getGeneratedPair = (arena: Arena): SamplePair => {
  return {
    a: [
      generatedNicknames[seededNumber(arena.id * 3, 0, generatedNicknames.length - 1)],
      `${arena.optionA} 쪽. 첫 느낌대로 눌렀는데 다시 봐도 안 바뀜.`,
      8 + (arena.id % 34),
      generatedReactions(arena.id, 1),
    ],
    b: [
      generatedNicknames[seededNumber(arena.id * 5 + 1, 0, generatedNicknames.length - 1)],
      `${arena.optionB}. 주변에서 비슷한 일 겪는 거 보고 이쪽으로 마음 굳힘.`,
      7 + ((arena.id * 3) % 36),
      generatedReactions(arena.id, 2),
    ],
  };
};

const prominentArenaCommentCounts = new Map<number, number>([
  [4, 16],
  [3, 14],
  [9, 12],
  [10, 12],
  [33, 12],
  [45, 12],
  [55, 12],
  [58, 12],
  [63, 14],
  [64, 14],
  [69, 12],
  [72, 12],
  [73, 14],
  [113, 12],
  [114, 14],
  [115, 12],
  [117, 12],
]);

const seedMinutesAgo = [3, 7, 12, 18, 25, 34, 46, 61, 83, 110, 145, 190, 255, 340, 460, 620];
const seedCreatedAt = Date.now();

export const getSeedCommentCount = (arenaId: number) =>
  prominentArenaCommentCounts.get(arenaId) ?? 8 + (arenaId % 3);

const seededComments: ArenaComment[] = arenas.flatMap(
  (arena, index) => {
    const pair = samplePairs[arena.id] ?? getGeneratedPair(arena);
    const representativePack = representativeCommentPacks[arena.id];
    const commentCount = getSeedCommentCount(arena.id);

    return Array.from({ length: commentCount }, (_, commentIndex) => {
      const side: Side = commentIndex % 2 === 0 ? "A" : "B";
      const pairComment = side === "A" ? pair.a : pair.b;
      const sideIndex = Math.floor(commentIndex / 2);
      const templates = side === "A" ? generatedAComments : generatedBComments;
      const template = templates[(arena.id * 3 + sideIndex) % templates.length];
      const score =
        commentIndex < 2
          ? pairComment[2]
          : 4 + seededNumber(arena.id * 41 + commentIndex * 13, 0, 42);
      const representativeText = representativePack?.[side][sideIndex];

      return {
        id: index * 100 + commentIndex + 1,
        arenaId: arena.id,
        side,
        nickname:
          commentIndex < 2
            ? pairComment[0]
            : generatedNicknames[(arena.id * 5 + commentIndex * 7) % generatedNicknames.length],
        text: representativeText ?? (commentIndex < 2 ? pairComment[1] : template(arena)),
        score,
        likes: score,
        reactions:
          commentIndex < 2
            ? pairComment[3]
            : generatedReactions(arena.id + commentIndex, side === "A" ? 1 : 2),
        createdAt:
          seedCreatedAt -
          (seedMinutesAgo[commentIndex] + (arena.id % 4)) * 60_000,
      };
    });
  }
);

const seedTextCounts = seededComments.reduce((counts, comment) => {
  counts.set(comment.text, (counts.get(comment.text) ?? 0) + 1);
  return counts;
}, new Map<string, number>());

const repeatedSeedTexts = new Set(
  [...seedTextCounts]
    .filter(([, count]) => count > 1)
    .map(([text]) => text)
);

const duplicateContextPhrases: Array<(arena: Arena) => string> = [
  (arena: Arena) => `반대가 ${arena.optionB}여도 안 바뀜.`,
  (arena: Arena) => `친구는 ${arena.optionB} 쪽이라는데 나는 그대로임.`,
  (arena: Arena) => `${arena.optionA} 쪽 얘기라 더 공감됐음.`,
  () => `이 질문에서는 유독 이쪽임.`,
  (arena: Arena) => `${arena.optionB}도 봤는데 마음 안 움직임.`,
  () => `막상 닥쳐도 같은 쪽 누를 듯.`,
];
const repeatedTextOffsets = new Map<string, number>();

export const initialComments: ArenaComment[] = seededComments.map((comment) => {
  if (!repeatedSeedTexts.has(comment.text)) return comment;

  const arena = arenas.find((item) => item.id === comment.arenaId);
  const offset = repeatedTextOffsets.get(comment.text) ?? 0;
  repeatedTextOffsets.set(comment.text, offset + 1);

  return {
    ...comment,
    text: `${comment.text} ${
      arena
        ? duplicateContextPhrases[offset % duplicateContextPhrases.length](arena)
        : "이 질문에서는 유독 이쪽임."
    }`,
  };
});

export const getReactionTotal = (comment: ArenaComment) =>
  reactionOrder.reduce((total, reaction) => total + comment.reactions[reaction], 0);

export const getCommentScore = (comment: ArenaComment) =>
  comment.score ?? comment.likes ?? 0;

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
  const localA = Math.max(
    0,
    targetComments.filter((comment) => comment.side === "A").length -
      initialComments.filter(
        (comment) => comment.arenaId === arena.id && comment.side === "A"
      ).length
  );
  const localB = Math.max(
    0,
    targetComments.filter((comment) => comment.side === "B").length -
      initialComments.filter(
        (comment) => comment.arenaId === arena.id && comment.side === "B"
      ).length
  );
  const aPercent = Math.min(90, Math.max(10, arena.leftPercent + localA * 2 - localB * 2));
  const reactionScore = targetComments.reduce(
    (sum, comment) => sum + getCommentScore(comment),
    0
  );
  const heatScore =
    arena.heat * 2 + arena.spectators / 20 + targetComments.length * 5 + reactionScore;

  return {
    aPercent,
    bPercent: 100 - aPercent,
    voteCount: arena.totalVotes + localA + localB,
    commentCount: targetComments.length,
    aCommentCount: targetComments.filter((comment) => comment.side === "A").length,
    bCommentCount: targetComments.filter((comment) => comment.side === "B").length,
    recentComments: arena.recentCommentsCount,
    recentVotes: arena.recentVotesCount,
    heatScore,
    reactionScore,
  };
};

export const getArenaStatsWithLocalComments = (
  arena: Arena,
  localComments: ArenaComment[]
) => getArenaStats(arena, [...initialComments, ...localComments]);

export const getArenaBadge = (
  arena: Arena,
  comments: ArenaComment[] = initialComments
) => {
  const stats = getArenaStats(arena, comments);
  const diff = Math.abs(stats.aPercent - stats.bPercent);

  if (arena.status === "closed") return "명경기 보관";
  if (diff <= 10) return "박빙";
  if (arena.heat >= 98) return "지금 제일 불탐";
  if (stats.commentCount >= 45) return "댓글 과열";
  if (stats.aPercent >= 70) return "A 우세";
  if (stats.bPercent >= 70) return "B 우세";
  if (arena.status === "upcoming") return "예열 중";

  return "입 털기 좋음";
};
