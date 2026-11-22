"use client";

import { RiArrowDownLine, RiArrowUpLine, RiCornerDownLeftLine, RiFileAddLine, RiHome5Line, RiSearchLine, RiUserAddLine } from "@remixicon/react";
import { Kbd } from "@/components/base/kbd/kbd";
import { cx } from "@/utils/cx";

const ROWS = [
  { icon: RiFileAddLine, label: "Create project", shortcut: "⌘N" },
  { icon: RiUserAddLine, label: "Invite teammates" },
  { icon: RiHome5Line, label: "Dashboard" },
];

/**
 * The gallery tile: the palette's panel at rest, drawn statically (a live
 * one is a modal). Surface, rows and footer mirror components/base/command-palette:
 * the radius/2xl panel, the 40px search row, 32px rows 6px inside it with the
 * first one highlighted, and the key-hint footer.
 */
export function CommandPalettePreviewCard() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="flex w-[360px] shrink-0 scale-[0.78] flex-col overflow-clip rounded-2xl border border-border-button-default bg-background-primary-default shadow-sidebar [--color-kbd-background:var(--color-kbd-subtle-background)]">
        <div className="flex h-10 items-center gap-2.5 border-b border-separator-border px-3.5">
          <RiSearchLine className="size-4 shrink-0 text-foreground-icon-tertiary" aria-hidden />
          <span className="truncate text-body-medium text-text-tertiary">Type a command or search…</span>
        </div>
        <div className="flex flex-col gap-0.5 p-1.5">
          {ROWS.map((row, index) => (
            <div
              key={row.label}
              className={cx("flex items-center gap-2.5 rounded-2lg px-2 py-1.5", index === 0 && "bg-dropdown-item-hover-background")}
            >
              <row.icon className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
              <span className="flex-1 text-body-medium text-text-primary">{row.label}</span>
              {row.shortcut ? <Kbd>{row.shortcut}</Kbd> : null}
            </div>
          ))}
        </div>
        <div className="flex h-9 items-center justify-between border-t border-separator-border px-3.5 text-body-2-regular text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <Kbd aria-label="Arrow up">
              <RiArrowUpLine className="size-3" aria-hidden />
            </Kbd>
            <Kbd aria-label="Arrow down">
              <RiArrowDownLine className="size-3" aria-hidden />
            </Kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd aria-label="Enter">
              <RiCornerDownLeftLine className="size-3" aria-hidden />
            </Kbd>
            Select
          </span>
        </div>
      </div>
    </div>
  );
}
