import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  createBetaApplication,
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
import {
  DuplicateWaitlistEmailError,
  InvalidWaitlistApplicationError,
} from "@/lib/landing/waitlistErrors";
import { useI18n } from "@/i18n/LanguageProvider";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function BetaWaitlistForm() {
  const { t, value } = useI18n();
  const experienceLabels = value<string[]>("landing.waitlist.experienceOptions");
  const challengeLabels = value<string[]>("landing.waitlist.challengeOptions");
  const experienceOptions: Array<{ value: InvestmentExperience; label: string }> = [
    { value: "NONE", label: experienceLabels[0] }, { value: "UNDER_6_MONTHS", label: experienceLabels[1] },
    { value: "SIX_MONTHS_TO_TWO_YEARS", label: experienceLabels[2] }, { value: "OVER_TWO_YEARS", label: experienceLabels[3] },
  ];
  const challengeOptions: Array<{ value: InvestmentChallenge; label: string }> = [
    { value: "ENTRY_DECISION", label: challengeLabels[0] }, { value: "EXIT_DECISION", label: challengeLabels[1] },
    { value: "PLAN_DISCIPLINE", label: challengeLabels[2] }, { value: "EMOTIONAL_TRADING", label: challengeLabels[3] },
    { value: "CHART_ANALYSIS", label: challengeLabels[4] }, { value: "OTHER", label: challengeLabels[5] },
  ];
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
      setMessage(t("landing.waitlist.required"));
      return;
    }
    if (smsOptIn && !isValidKoreanMobileNumber(phoneNumber)) {
      setStatus("error");
      setMessage(t("landing.waitlist.phoneInvalid"));
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
          ? t("landing.waitlist.successSms")
          : t("landing.waitlist.successEmail"),
      );
      trackLandingEvent("beta_form_success", { experience, challenge, intent });
    } catch (error) {
      setStatus("error");
      const duplicate = error instanceof DuplicateWaitlistEmailError;
      const invalid = error instanceof InvalidWaitlistApplicationError;
      setMessage(
        duplicate
          ? t("landing.waitlist.duplicate")
          : invalid
            ? t("landing.waitlist.invalid")
          : t("landing.waitlist.failed"),
      );
      trackLandingEvent("beta_form_error", {
        reason: duplicate
          ? "duplicate_email"
          : invalid
            ? "invalid_request"
            : "request_failed",
      });
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.06] px-6 text-center" aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
        <h3 className="mt-5 text-xl font-semibold">{t("landing.waitlist.successTitle")}</h3>
        <p className="mt-2 max-w-sm break-keep text-sm leading-6 text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} onFocus={markStarted}>
      <div className="space-y-2">
        <Label htmlFor="beta-email">{t("landing.waitlist.email")}</Label>
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
        <Label>{t("landing.waitlist.experience")}</Label>
        <Select value={experience} onValueChange={(value) => { markStarted(); setExperience(value as InvestmentExperience); }} required>
          <SelectTrigger className="h-11 bg-background/70" aria-label={t("landing.waitlist.experience")}>
            <SelectValue placeholder={t("landing.waitlist.experiencePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {experienceOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("landing.waitlist.challenge")}</Label>
        <Select value={challenge} onValueChange={(value) => { markStarted(); setChallenge(value as InvestmentChallenge); }} required>
          <SelectTrigger className="h-11 bg-background/70" aria-label={t("landing.waitlist.challenge")}>
            <SelectValue placeholder={t("landing.waitlist.challengePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {challengeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("landing.waitlist.intent")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {([{"value":"YES","label":t("landing.waitlist.yes")},{"value":"CONSIDERING","label":t("landing.waitlist.considering")}] as const).map((option) => (
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
            <span className="font-medium text-foreground">{t("landing.waitlist.sms")}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{t("landing.waitlist.smsHelp")}</span>
          </span>
        </label>

        {smsOptIn && (
          <div className="space-y-2 pl-7">
            <Label htmlFor="beta-phone">{t("landing.waitlist.phone")}</Label>
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
        {status === "submitting" ? t("landing.waitlist.submitting") : t("landing.waitlist.submit")}
        {status !== "submitting" && <ArrowRight aria-hidden="true" />}
      </Button>

      <p className="text-center text-[11px] leading-5 text-muted-foreground">
        {t("landing.waitlist.privacy")}
      </p>
      {message && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive-foreground" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
