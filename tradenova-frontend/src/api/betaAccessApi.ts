import http from "./http";
import type { BetaAccessResponse } from "@/lib/publicBetaAccess";

export const betaAccessApi = {
  getAccess: async () => {
    const response = await http.get<BetaAccessResponse>("/api/beta/access");
    return response.data;
  },
};
