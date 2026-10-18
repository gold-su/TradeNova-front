import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  createBetaApplication,
  DuplicateWaitlistEmailError,
  waitlistApi,
} from "@/api/waitlistApi";
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
import { isValidKoreanMobileNumber } from "@/lib/landing/waitlistSms";

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
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
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
    if (smsOptIn && !isValidKoreanMobileNumber(phoneNumber)) {
      setStatus("error");
      setMessage("010으로 시작하는 휴대폰 번호를 확인해주세요.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    trackLandingEvent("beta_form_submit", { experience, challenge, intent });

    try {
      await waitlistApi.submit(createBetaApplication({
        email: email.trim(),
        investmentExperience: experience,
        primaryChallenge: challenge,
        participationIntent: intent,
        smsOptIn,
        phoneNumber,
        attribution: getCampaignAttribution(),
      }));
      setStatus("success");
      setMessage(
        smsOptIn
          ? "베타 신청이 완료되었습니다. 오픈 안내는 이메일로 전달되며, 문자 알림을 신청한 경우 문자로도 안내드릴 예정입니다."
          : "신청이 접수되었습니다. 베타 오픈 소식을 이메일로 알려드릴게요.",
      );
      trackLandingEvent("beta_form_success", { experience, challenge, intent });
    } catch (error) {
      setStatus("error");
      const duplicate = error instanceof DuplicateWaitlistEmailError;
      setMessage(
        duplicate
          ? "이미 베타 신청이 완료된 이메일입니다."
          : "신청을 접수하지 못했습니다. 잠시 후 다시 시도해주세요.",
      );
      trackLandingEvent("beta_form_error", {
        reason: duplicate ? "duplicate_email" : "request_failed",
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

      <div className="space-y-3 rounded-lg border border-border/70 bg-background/40 px-4 py-3">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={smsOptIn}
            onChange={(event) => {
              markStarted();
              const checked = event.target.checked;
              setSmsOptIn(checked);
              if (!checked) setPhoneNumber("");
            }}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <span>
            <span className="font-medium text-foreground">베타 오픈 시 문자로도 알려주세요</span>
            <span className="mt-1 block text-xs text-muted-foreground">베타 오픈 안내 목적으로만 사용됩니다.</span>
          </span>
        </label>

        {smsOptIn && (
          <div className="space-y-2 pl-7">
            <Label htmlFor="beta-phone">휴대폰 번호</Label>
            <Input
              id="beta-phone"
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="010-1234-5678"
              pattern="010-?[0-9]{4}-?[0-9]{4}"
              className="h-10 bg-background/70"
            />
          </div>
        )}
      </div>

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
