"use client";

import { useTemplateCopy } from "@/components/foundations/template-copy/template-copy";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  RiAsterisk,
  RiCalendarCheckFill,
  RiCapsuleFill,
  RiDropFill,
  RiHeartPulseFill,
  RiLungsFill,
  RiMedicineBottleFill,
  RiMoonClearFill,
  RiPulseFill,
  RiSyringeFill,
  RiTempHotFill,
  RiTestTubeFill,
  RiWalkFill,
} from "@remixicon/react";
import type { ComponentType, CSSProperties } from "react";
import { MONTHS, hash, weekLabel, weekStart } from "@/components/application/medical/medical-data";
import { WeekRangePill } from "@/components/application/medical/week-range-pill";
import { useDirection } from "@/components/foundations/direction/direction";
import { useCountUp } from "@/hooks/use-count-up";
import { cx } from "@/utils/cx";

/**
 * Figma source: Board UI → medical profile dashboard → Frame 126 (node
 * 3950:5936). Alert feed: tinted icon circle, title + description, and a
 * soft date pill absolutely pinned to the row's top-right corner.
 *
 * The feed runs flush to the card's bottom edge and clips there (the card
 * keeps its 10px inset on the other three sides only) — per Figma, where
 * the third alert row is visibly cut off by the card bounds. The scroll
 * content itself ends with a 10px pad so the last alert doesn't sit hard
 * against that edge once you reach the bottom, and a card-colored gradient
 * fades in over the top edge while scrolled so rows dissolve out instead
 * of being sharply cut by the header.
 *
 * The week pill steps through earlier weeks and back, up to the current one.
 * Each week has its own alerts (seeded, so stable across renders and SSR),
 * dated inside that week, and its own count, which counts up like the Steps
 * card's total. Switching, the shown alerts slide 12px toward the week being
 * left and fade out, then the new week's alerts slide in from the other side,
 * 50ms apart, sharpening from a 2px blur; the feed returns to its top.
 * Reduced motion keeps the fades only.
 */

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

type AlertKind = { icon: IconComponent; iconBg: string; title: string; description: string };
type Alert = AlertKind & { date: string };

/** The Figma feed's six alerts first (the current week shows them in this order), then the rest of the pool. */
const ALERT_KINDS: AlertKind[] = [
  {
    icon: RiHeartPulseFill,
    iconBg: "bg-rose-600",
    title: "High Heart rate",
    description: "Your heart rate rose above 120 BPM while you seemed to be inactive for 10 minutes starting at 8:59 AM.",
  },
  {
    icon: RiAsterisk,
    iconBg: "bg-amber-400",
    title: "Medical ID",
    description: "Your emergency contact and allergy information was updated in your Medical ID.",
  },
  {
    icon: RiTestTubeFill,
    iconBg: "bg-emerald-500",
    title: "Lab results ready",
    description: "Your latest blood panel ordered by Dr. Mattheus Clarkson is back — cholesterol and glucose are within the normal range.",
  },
  {
    icon: RiCapsuleFill,
    iconBg: "bg-blue-400",
    title: "Medication reminder",
    description: "You missed your 9:00 AM dose of Metoprolol. Take it as soon as possible unless your next dose is near.",
  },
  {
    icon: RiMoonClearFill,
    iconBg: "bg-purple-400",
    title: "Irregular sleep",
    description: "Your bedtime shifted by more than 2 hours on 3 of the last 7 nights, which can affect your sleep score.",
  },
  {
    icon: RiLungsFill,
    iconBg: "bg-teal-400",
    title: "Low blood oxygen",
    description: "Your blood oxygen dipped to 93% for a short period during sleep.",
  },
  {
    icon: RiPulseFill,
    iconBg: "bg-red-500",
    title: "High blood pressure",
    description: "Two readings were above 140/90 mmHg. Measure again at rest and share the results with your doctor.",
  },
  {
    icon: RiWalkFill,
    iconBg: "bg-orange-500",
    title: "Low activity",
    description: "You walked fewer than 3,000 steps on 4 of the last 7 days, well below your daily goal.",
  },
  {
    icon: RiCalendarCheckFill,
    iconBg: "bg-indigo-500",
    title: "Upcoming appointment",
    description: "Annual check-up with Dr. Mattheus Clarkson at 10:30 AM. Bring your latest lab results.",
  },
  {
    icon: RiSyringeFill,
    iconBg: "bg-sky-500",
    title: "Vaccine due",
    description: "Your tetanus booster is due this month. Book it with your clinic or a local pharmacy.",
  },
  {
    icon: RiDropFill,
    iconBg: "bg-cyan-500",
    title: "Low hydration",
    description: "You logged under 1.2 L of water on most days. Aim for about 2 L a day.",
  },
  {
    icon: RiTempHotFill,
    iconBg: "bg-orange-400",
    title: "Elevated temperature",
    description: "Your skin temperature ran 0.8°C above your baseline for two nights in a row.",
  },
  {
    icon: RiMedicineBottleFill,
    iconBg: "bg-lime-500",
    title: "Refill ready",
    description: "Your Metoprolol prescription is ready for pickup at your pharmacy.",
  },
];

/** "July, 4": the feed's date pill format. */
function alertDate(date: Date) {
  return `${MONTHS[date.getMonth()]}, ${date.getDate()}`;
}

/** The current week keeps the Figma feed (six alerts, 12 logged); earlier
 *  weeks draw three to six alerts from the pool, newest first, and log a few
 *  more than they list, as the full history would. */
function weekAlerts(offset: number): { alerts: Alert[]; count: number } {
  const start = weekStart(offset);
  const day = (index: number) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return alertDate(date);
  };
  if (offset === 0) {
    const days = [5, 4, 4, 3, 1, 0];
    return { alerts: ALERT_KINDS.slice(0, 6).map((kind, i) => ({ ...kind, date: day(days[i]) })), count: 12 };
  }
  const seed = offset * 97;
  const size = 3 + Math.floor(hash(seed) * 4);
  const kinds = ALERT_KINDS.map((kind, i) => ({ kind, rank: hash(seed + i + 1) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, size)
    .map(({ kind }) => kind);
  const days = kinds.map((_, i) => Math.floor(hash(seed + 50 + i) * 7)).sort((a, b) => b - a);
  return {
    alerts: kinds.map((kind, i) => ({ ...kind, date: day(days[i]) })),
    count: size + Math.floor(hash(seed + 99) * 9),
  };
}

/** How long the outgoing alerts take to leave before the new week's arrive. */
const LEAVE_MS = 150;

export function ImportantAlertsCard({ className }: { className?: string } = {}) {
  const localize = useTemplateCopy();
  const direction = useDirection();
  const [scrolled, setScrolled] = useState(false);
  // `week` follows the pill at once; `shown` is the week whose alerts are on
  // screen, which trails it by the leave. `step` is the last move: -1 back, 1 forward.
  const [week, setWeek] = useState(0);
  const [shown, setShown] = useState(0);
  const [step, setStep] = useState(-1);
  const feedRef = useRef<HTMLDivElement>(null);
  const leaving = week !== shown;

  useEffect(() => {
    if (week === shown) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => {
      setShown(week);
      feedRef.current?.scrollTo({ top: 0 });
      setScrolled(false);
    }, reduce ? 0 : LEAVE_MS);
    return () => clearTimeout(timer);
  }, [week, shown]);

  const { alerts, count } = useMemo(() => weekAlerts(shown), [shown]);
  const { count: weekCount } = useMemo(() => weekAlerts(week), [week]);
  const display = useCountUp(weekCount);

  // Back in time, alerts leave toward the end side and arrive from the start
  // side (forward, the reverse), mirrored in RTL, like the pill's chevrons.
  const towardEnd = (step < 0 ? 1 : -1) * (direction === "rtl" ? -1 : 1);
  const shift = { "--alert-in": `${-12 * towardEnd}px`, "--alert-out": `${12 * towardEnd}px` } as CSSProperties;

  const goTo = (next: number) => {
    setStep(next < week ? -1 : 1);
    setWeek(next);
  };

  return localize((
    <section
      className={cx(
        // The 1px border matches the card's own bg — invisible as a line,
        // but content clips at the padding box (inside the border), so the
        // white alert rows stop 1px shy of the rounded edge instead of
        // touching it when scrolled to the bottom.
        "flex h-[330px] w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[20px] border border-background-secondary-default bg-background-secondary-default px-2.5 pt-2.5",
        className,
      )}
    >
      <div className="flex w-full items-start justify-between gap-2 px-1.5 pt-1.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5" aria-live="polite">
          <p className="text-body-medium text-text-secondary">Important alerts</p>
          <div className="flex items-baseline gap-1">
            <p className="text-title-1-medium whitespace-nowrap text-text-primary tabular-nums">{display}</p>
            <span key={week === 0 ? 0 : week === -1 ? 1 : 2} className="animate-number-fade text-caption-1-medium whitespace-nowrap text-text-secondary">
              {week === 0 ? "this week" : week === -1 ? "last week" : "that week"}
            </span>
          </div>
        </div>
        <WeekRangePill
          label={weekLabel(week)}
          onPrev={() => goTo(week - 1)}
          onNext={() => goTo(week + 1)}
          nextDisabled={week >= 0}
        />
      </div>

      <div className="relative min-h-0 w-full flex-1">
        <div
          ref={feedRef}
          className="flex h-full w-full flex-col gap-2.5 overflow-y-auto overscroll-contain pb-2.5"
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
          style={shift}
        >
          {alerts.map((alert, index) => (
            <div
              key={`${shown}-${alert.title}`}
              style={{ transitionDelay: leaving ? "0ms" : `${index * 50}ms` }}
              className={cx(
                "relative flex w-full shrink-0 flex-col gap-2 rounded-2lg bg-background-inner-default p-2.5",
                "transition-[opacity,translate,filter] ease-out",
                "starting:opacity-0 motion-safe:starting:translate-x-(--alert-in) motion-safe:starting:blur-[2px]",
                leaving
                  ? "opacity-0 duration-150 motion-safe:translate-x-(--alert-out) motion-safe:blur-[2px]"
                  : "duration-300",
              )}
            >
              <span className={cx("flex size-8 shrink-0 items-center justify-center rounded-full", alert.iconBg)}>
                <alert.icon className="size-[18px] text-white" aria-hidden />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-body-medium whitespace-nowrap text-text-primary">{alert.title}</p>
                <p className="text-body-2-regular text-text-secondary">{alert.description}</p>
              </div>
              <span className="absolute top-2.5 end-2.5 rounded-md bg-background-secondary-default px-1.5 py-px text-body-medium whitespace-nowrap text-text-secondary">
                {alert.date}
              </span>
            </div>
          ))}
        </div>
        {/* Top fade — card-colored gradient that eases in once the feed is
            scrolled, so rows dissolve under the header instead of cutting. */}
        <div
          aria-hidden
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-background-secondary-default to-transparent",
            "transition-opacity duration-200 ease-out",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </section>
  ));
}
