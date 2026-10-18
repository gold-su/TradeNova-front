export type ProductWalkthroughStep = {
  number: string;
  stage: string;
  title: string;
  description: string;
  image: "blind" | "plan" | "next" | "trade" | "review";
  imageAlt: string;
};

export const PRODUCT_WALKTHROUGH_STEPS: ProductWalkthroughStep[] = [
  {
    number: "01",
    stage: "BLIND",
    title: "종목을 모른 채 차트를 봅니다",
    description:
      "종목명과 티커를 가린 실제 과거 차트에서 가격 흐름과 거래량을 먼저 읽습니다.",
    image: "blind",
    imageAlt: "종목명이 가려진 네 개의 과거 차트를 비교하는 TradeNova 훈련 화면",
  },
  {
    number: "02",
    stage: "PLAN",
    title: "판단과 계획을 먼저 기록합니다",
    description:
      "현재 판단, 진입 기준, 리스크·청산 기준과 계획 변경 조건을 행동 전에 남깁니다.",
    image: "plan",
    imageAlt: "현재 판단과 진입 및 청산 기준을 기록하는 시나리오 관리 화면",
  },
  {
    number: "03",
    stage: "NEXT",
    title: "미래를 모른 채 시장을 진행합니다",
    description:
      "NEXT로 다음 구간을 확인하며 판단과 확인을 반복합니다. 자동 재생이 아니라 매 단계 직접 결정합니다.",
    image: "next",
    imageAlt: "과거 차트와 NEXT 버튼, 거래 실행 패널이 함께 보이는 훈련 화면",
  },
  {
    number: "04",
    stage: "TRADE",
    title: "직접 매수·매도하고 근거를 남깁니다",
    description:
      "BUY·SELL, 포지션과 거래 근거를 계획에 연결해 실제 훈련 행동으로 기록합니다.",
    image: "trade",
    imageAlt: "수량과 적용 계획, 매수 근거를 기록하는 TradeNova 주문 화면",
  },
  {
    number: "05",
    stage: "AI REVIEW",
    title: "결과가 아닌 판단 과정을 복기합니다",
    description:
      "AI Review가 계획, 근거, 실행과 리스크 관리를 연결해 다음 훈련에서 개선할 점을 정리합니다.",
    image: "review",
    imageAlt: "전체 요약과 잘 본 점, 놓친 점을 구분해 보여주는 Chart Review 화면",
  },
];

export const AI_REVIEW_POINTS = [
  "판단 근거를 구체적으로 기록했는지",
  "계획과 실제 실행이 어떻게 연결됐는지",
  "리스크와 계획 변경 기준이 있었는지",
  "다음 훈련에서 무엇을 개선할지",
] as const;
