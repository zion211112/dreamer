/**
 * scripts/ts-resolve.mjs — EXTENSIONLESS RELATIVE IMPORTS FOR NODE.
 *
 * The domain model is TypeScript with no build step, written the idiomatic
 * way: sibling imports carry no extension, because that is what TypeScript
 * and every bundler expect. Node's ESM resolver does not agree, and this
 * hook is the two-line bridge between the two worlds.
 *
 * It exists so that the checks in check-epistemic.mjs execute the REAL
 * domain files directly rather than a transpiled copy. That distinction is
 * the whole point: a check that runs against a copy is evidence about the
 * copy, and the copy is where a bug would hide.
 *
 * Node 22.18+ strips TypeScript types natively, so no transpilation is
 * needed. Only resolution needs help.
 */

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const CANDIDATE_SUFFIXES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

export async function resolve(specifier, context, next) {
  /* Bare specifiers and absolute URLs are not our business. */
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return next(specifier, context);
  }

  const base = context.parentURL ?? pathToFileURL(process.cwd() + "/").href;
  const resolved = new URL(specifier, base);

  /* An explicit extension or a query/hash means the caller knew what it
     wanted. Only intervene when the specifier has neither. */
  if (/\.[cm]?[jt]sx?($|\?|#)/.test(resolved.pathname)) {
    return next(specifier, context);
  }

  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = new URL(resolved.pathname + suffix, resolved);
    if (!existsSync(fileURLToPath(candidate))) continue;

    /* The format must be declared, not defaulted.
     *
     * Returning "module" for a .ts file makes Node parse it as plain
     * JavaScript, which fails on any type syntax that is not erasable by
     * the cheap stripper — `as const` on a multi-line array is enough.
     * The failure surfaces as a SyntaxError pointing at the type keyword,
     * which reads like a syntax error in the source rather than a wrong
     * format string here. Hence the explicit mapping.
     *
     * "module-typescript" requires --experimental-transform-types, which
     * scripts/check-epistemic.mjs passes via the npm script. */
    const path = fileURLToPath(candidate);
    const format = path.endsWith(".ts")
      ? "module-typescript"
      : path.endsWith(".mts")
        ? "module-typescript"
        : path.endsWith(".json")
          ? "json"
          : "module";

    return { url: candidate.href, format, shortCircuit: true };
  }

  /* Nothing matched. Hand it back so Node produces its own diagnostic
     rather than a vaguer one from this file. */
  return next(specifier, context);
}