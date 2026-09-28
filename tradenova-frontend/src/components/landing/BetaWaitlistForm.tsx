import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { waitlistApi, WaitlistUnavailableError } from "@/api/waitlistApi";
import type {
  InvestmentChallenge,
  InvestmentExperience,
  ParticipationIntent,
} from "@/api/waitlistApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCampaignAttribution,
  trackLandingEvent,
} from "@/lib/landing/analytics";

type FormStatus = "idle" | "submitting" | "success" | "error";

const experienceOptions: Array<{ value: InvestmentExperience; label: string }> = [
  { value: "NONE", label: "아직 투자하지 않음" },
  { value: "UNDER_6_MONTHS", label: "6개월 미만" },
  { value: "SIX_MONTHS_TO_TWO_YEARS", label: "6개월~2년" },
  { value: "OVER_TWO_YEARS", label: "2년 이상" },
];

const challengeOptions: Array<{ value: InvestmentChallenge; label: string }> = [
  { value: "ENTRY_DECISION", label: "진입 판단" },
  { value: "EXIT_DECISION", label: "손절/익절" },
  { value: "PLAN_DISCIPLINE", label: "계획 준수" },
  { value: "EMOTIONAL_TRADING", label: "감정/충동매매" },
  { value: "CHART_ANALYSIS", label: "차트 분석" },
  { value: "OTHER", label: "기타" },
];

export function BetaWaitlistForm() {
  const startedRef = useRef(false);
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState<InvestmentExperience | "">("");
  const [challenge, setChallenge] = useState<InvestmentChallenge | "">("");
  const [intent, setIntent] = useState<ParticipationIntent | "">("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackLandingEvent("beta_form_start");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!experience || !challenge || !intent) {
      setStatus("error");
      setMessage("모든 항목을 선택해주세요.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    trackLandingEvent("beta_form_submit", { experience, challenge, intent });

    try {
      await waitlistApi.submit({
        email: email.trim(),
        investmentExperience: experience,
        primaryChallenge: challenge,
        participationIntent: intent,
        attribution: getCampaignAttribution(),
      });
      setStatus("success");
      setMessage("신청이 접수되었습니다. 베타 오픈 소식을 이메일로 알려드릴게요.");
      trackLandingEvent("beta_form_success", { experience, challenge, intent });
    } catch (error) {
      setStatus("error");
      const unavailable = error instanceof WaitlistUnavailableError;
      setMessage(
        unavailable
          ? "현재 베타 신청 접수를 준비 중입니다. 잠시 후 다시 시도해주세요."
          : "신청을 접수하지 못했습니다. 잠시 후 다시 시도해주세요.",
      );
      trackLandingEvent("beta_form_error", {
        reason: unavailable ? "endpoint_unavailable" : "request_failed",
      });
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.06] px-6 text-center" aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
        <h3 className="mt-5 text-xl font-semibold">베타 신청 완료</h3>
        <p className="mt-2 max-w-sm break-keep text-sm leading-6 text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} onFocus={markStarted}>
      <div className="space-y-2">
        <Label htmlFor="beta-email">이메일</Label>
        <Input
          id="beta-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-11 bg-background/70"
        />
      </div>

      <div className="space-y-2">
        <Label>투자 경험</Label>
        <Select value={experience} onValueChange={(value) => { markStarted(); setExperience(value as InvestmentExperience); }} required>
          <SelectTrigger className="h-11 bg-background/70" aria-label="투자 경험">
            <SelectValue placeholder="투자 경험을 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {experienceOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>현재 가장 어려운 점</Label>
        <Select value={challenge} onValueChange={(value) => { markStarted(); setChallenge(value as InvestmentChallenge); }} required>
          <SelectTrigger className="h-11 bg-background/70" aria-label="현재 가장 어려운 점">
            <SelectValue placeholder="한 가지를 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {challengeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">베타 오픈 시 바로 참여할 의향</legend>
        <div className="grid grid-cols-2 gap-2">
          {([{"value":"YES","label":"있음"},{"value":"CONSIDERING","label":"고민 중"}] as const).map((option) => (
            <label key={option.value} className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm transition ${intent === option.value ? "border-primary/60 bg-primary/10 text-primary" : "border-border/70 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
              <input className="sr-only" type="radio" name="participationIntent" value={option.value} checked={intent === option.value} onChange={() => { markStarted(); setIntent(option.value); }} required />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "신청 중..." : "무료 베타 신청하기"}
        {status !== "submitting" && <ArrowRight aria-hidden="true" />}
      </Button>

      <p className="text-center text-[11px] leading-5 text-muted-foreground">
        입력한 정보는 베타 참여 안내와 수요 검증에만 사용합니다.
      </p>
      {message && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive-foreground" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
