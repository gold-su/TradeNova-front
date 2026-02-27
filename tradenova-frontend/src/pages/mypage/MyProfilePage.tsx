// src/pages/mypage/MyProfilePage.tsx
import { useMemo, useState } from "react";

function parseJwt(token: string) {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch {
        return null;
    }
}

export default function MyProfilePage() {
    const token = localStorage.getItem("accessToken") ?? "";
    const jwt = useMemo(() => (token ? parseJwt(token) : null), [token]);

    const [nickname, setNickname] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

    const onSave = async () => {
        // TODO: 백엔드에 내 정보 수정 API 붙이면 여기서 호출
        setMsg("현재는 UI만 준비됨. (다음 단계에서 API 연결)");
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="text-xl font-semibold">개인정보 / 프로필</div>
                <div className="mt-1 text-sm text-muted-foreground">
                    계정 정보 확인 및 수정
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/20 p-4">
                    <div className="text-sm font-semibold">로그인 정보</div>
                    <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">JWT subject</span>
                            <span className="font-mono">{jwt?.sub ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">userId</span>
                            <span className="font-mono">{jwt?.userId ?? jwt?.id ?? "-"}</span>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                        * 실제 이메일/닉네임은 백엔드 “내 정보 조회 API” 붙이면 정확히 표시 가능
                    </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/20 p-4">
                    <div className="text-sm font-semibold">닉네임 변경</div>
                    <div className="mt-3">
                        <input
                            className="w-full rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-sm"
                            placeholder="새 닉네임"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                        <button
                            onClick={onSave}
                            className="mt-3 w-full rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/30"
                        >
                            저장
                        </button>
                    </div>
                    {msg && (
                        <div className="mt-3 rounded-xl border border-border/60 bg-background/30 p-3 text-sm text-muted-foreground">
                            {msg}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}