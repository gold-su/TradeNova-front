// src/api/paperAccountApi.ts
import http from "@/api/http";

export type PaperAccountResponse = {
    id: number;
    name: string;
    description?: string | null;
    cashBalance: number;
    isDefault?: boolean;
};

export type PaperAccountCreateRequest = {
    name: string;
    description?: string | null;
    initialCash?: number; // 백엔드 DTO랑 다르면 제거/수정
};

export type PaperAccountUpdateRequest = {
    name?: string;
    description?: string | null;
};

export const paperAccountApi = {
    list: () => http.get<PaperAccountResponse[]>("/api/paper-accounts").then(r => r.data),
    create: (body: PaperAccountCreateRequest) =>
        http.post<PaperAccountResponse>("/api/paper-accounts", body).then(r => r.data),

    update: (id: number, body: PaperAccountUpdateRequest) =>
        http.patch<PaperAccountResponse>(`/api/paper-accounts/${id}`, body).then(r => r.data),

    setDefault: (id: number) =>
        http.patch<void>(`/api/paper-accounts/${id}/default`).then(r => r.data),

    reset: (id: number) =>
        http.post<void>(`/api/paper-accounts/${id}/reset`).then(r => r.data),
};