export type IndicatorKey =
  | "ma"
  | "volume"
  | "bollinger"
  | "ichimoku"
  | "volumeProfile"
  | "rsi"
  | "macd";

export const INDICATOR_META: {
  key: IndicatorKey;
  label: string;
  group: "chart" | "sub";
  configurable: boolean;
  disabled: boolean;
}[] = [
  {
    key: "ma",
    label: "이동평균선",
    group: "chart",
    configurable: true,
    disabled: false,
  },
  {
    key: "bollinger",
    label: "볼린저밴드",
    group: "chart",
    configurable: true,
    disabled: true,
  },
  {
    key: "ichimoku",
    label: "일목균형표",
    group: "chart",
    configurable: true,
    disabled: true,
  },
  {
    key: "volumeProfile",
    label: "매물대",
    group: "chart",
    configurable: true,
    disabled: true,
  },

  {
    key: "volume",
    label: "거래량",
    group: "sub",
    configurable: false,
    disabled: false,
  },
  {
    key: "rsi",
    label: "RSI",
    group: "sub",
    configurable: true,
    disabled: false,
  },
  {
    key: "macd",
    label: "MACD",
    group: "sub",
    configurable: true,
    disabled: false,
  },
];
