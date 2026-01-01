import http from "./http";

export type Candle = {
    t: number; // epoch millis
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
};

export const trainingApi = {
    // 백엔드 호출 API (테스트 버전)
    getCandles: async (params?: { symbol?: string; from?: string; to?: string }) => {
        const res = await http.get<Candle[]>("/api/training/candles", { params });
        return res.data;
    },
};
