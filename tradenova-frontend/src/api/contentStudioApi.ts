import http from "./http";

export type BlindContentCandle = {
  idx: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type BlindContentCase = {
  caseKey: string;
  analysisBars: number;
  futureBars: number;
  visibleThroughIndex: number;
  remainingBars: number;
  atEnd: boolean;
  candles: BlindContentCandle[];
};

export type RevealedContentCandle = BlindContentCandle & { date: string };

export type RevealedContentCase = {
  caseKey: string;
  symbolId: number;
  market: string;
  ticker: string;
  name: string;
  currency: string;
  startDate: string;
  blindThroughDate: string;
  endDate: string;
  analysisBars: number;
  futureBars: number;
  candles: RevealedContentCandle[];
};

export const contentStudioApi = {
  getAccess: async () => {
    const response = await http.get<{ allowed: boolean }>("/api/admin/content-studio/access");
    return response.data;
  },
  randomCase: async () => {
    const response = await http.post<BlindContentCase>("/api/admin/content-studio/cases/random", {});
    return response.data;
  },
  loadCase: async (caseKey: string, throughIndex?: number) => {
    const response = await http.get<BlindContentCase>(
      `/api/admin/content-studio/cases/${encodeURIComponent(caseKey)}`,
      { params: throughIndex == null ? undefined : { throughIndex } },
    );
    return response.data;
  },
  reveal: async (caseKey: string) => {
    const response = await http.get<RevealedContentCase>(
      `/api/admin/content-studio/cases/${encodeURIComponent(caseKey)}/reveal`,
    );
    return response.data;
  },
};
