"use client";

import { RiFileCodeLine, RiSearchEyeLine } from "@remixicon/react";
import { cx } from "@/utils/cx";

const FILES = [
  { label: "sidebar.tsx", folder: "ui" },
  { label: "layout.tsx", folder: "app" },
  { label: "auth.ts", folder: "lib" },
];

/**
 * The gallery tile: a prompt holding a command chip and a file chip, with the
 * "@" menu open under its trigger, drawn statically (a live one needs focus).
 * Chips, menu and rows mirror components/base/token-input.
 */
export function TokenInputPreviewCard() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="flex w-[340px] shrink-0 scale-[0.78] flex-col">
        <div className="rounded-2xl border border-border-button-default bg-background-primary-default px-3.5 py-3 text-body-regular text-text-primary shadow-xs">
          <span className="mx-px inline-flex items-center gap-1 rounded-md bg-button-ghost-background px-1 align-bottom text-body-medium text-button-ghost-foreground">
            <RiSearchEyeLine className="size-3.5 opacity-80" aria-hidden />
            review
          </span>{" "}
          <span className="mx-px inline-flex items-center gap-1 rounded-md bg-dropdown-item-hover-background px-1 align-bottom text-body-medium">
            <RiFileCodeLine className="size-3.5 opacity-80" aria-hidden />
            page.tsx
          </span>{" "}
          @
          <span className="ms-px inline-block h-4 w-px translate-y-0.5 bg-accent-500" />
        </div>
        <div className="ms-[150px] mt-1.5 flex w-[176px] flex-col gap-0.5 rounded-[14px] border border-border-button-default bg-background-primary-default p-1 shadow-dropdown">
          <div className="px-2 pt-1 pb-1 text-body-2-medium text-text-tertiary">Files</div>
          {FILES.map((file, index) => (
            <div
              key={file.label}
              className={cx("flex items-center gap-2 rounded-[10px] px-2 py-1.5", index === 0 && "bg-dropdown-item-hover-background")}
            >
              <RiFileCodeLine className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden />
              <span className="flex-1 text-body-medium text-text-primary">{file.label}</span>
              <span className="text-body-2-regular text-text-tertiary">{file.folder}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
