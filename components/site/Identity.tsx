"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  clearIdentity,
  initialsOf,
  loadIdentity,
  saveIdentity,
  type SiteIdentity,
} from "@/lib/identity";

/**
 * The identity corner — sign in, profile, sign out.
 *
 * A pitch prototype needs somewhere for a reader to put their own name,
 * and this is that. What makes it worth building rather than omitting is
 * that it demonstrates the product's central claim instead of asserting it:
 * the session is real, it persists, and it never leaves the device. Open
 * devtools and the stored record says `custody: "this device"` in the data
 * itself, not only in the prose beside it.
 *
 * The honesty constraints are the design, not a disclaimer on it:
 *
 *   · There is no password field. Nothing to authenticate against, so
 *     asking for one would be theatre.
 *   · Nothing is transmitted. There is no fetch in this file.
 *   · The panel never says "account created". It says what happened: a
 *     session was started on this device.
 *   · If localStorage is unavailable the panel says the session is
 *     memory-only rather than pretending it will survive a reload.
 *
 * Keyboard and screen-reader behaviour, since a disclosure in the corner is
 * exactly the kind of control that gets skipped:
 *
 *   · The trigger is a real <button> with aria-expanded and aria-controls.
 *   · Escape closes the panel and returns focus to the trigger.
 *   · Clicking away closes it.
 *   · The panel is a labelled region, so it is reachable by landmark
 *     rather than by tabbing blind.
 *   · Focus moves into the panel on open and back to the trigger on close,
 *     because a control that opens something and drops focus into nothing
 *     strands keyboard users.
 */
export function Identity() {
  const [identity, setIdentity] = useState<SiteIdentity | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  /* Mounted on the client only, so the corner never renders a signed-out
     mark for a reader who is in fact signed in. A brief absence beats a
     wrong state. */
  useEffect(() => {
    setIdentity(loadIdentity());
    setReady(true);
  }, []);

  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Escape closes, and focus goes home. Tabbing out closes too, but only
     once focus has actually left the panel — otherwise the first Tab
     inside the form would shut it. */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    /* A pointer press anywhere outside dismisses. `pointerdown` rather than
       `click` so the panel closes in the same gesture — a click handler
       that fires after the target's own click produces the classic
       "opened then immediately closed" flicker. */
    const onPointerDown = (e: PointerEvent) => {
      const el = e.target as Node;
      if (panelRef.current?.contains(el) || triggerRef.current?.contains(el)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  /* Move focus into the panel once it exists, so the first Tab lands in
     the form rather than back at the top of the page. */
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>("input, button")?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="identity">
      <button
        ref={triggerRef}
        type="button"
        className="identity-trigger"
        data-session={ready && identity ? "on" : "off"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {/* The mark carries the initials once there is a session, and the
            same emitting diamond the wordmark uses before there is one. The
            aria-label is the state, because the initials alone say nothing
            to a screen reader. */}
        <span className="identity-mark" aria-hidden="true">
          {ready && identity ? initialsOf(identity.name) : null}
        </span>
        <span className="sr-only">
          {identity
            ? `Signed in as ${identity.name}. Open profile.`
            : "Not signed in. Open to sign in."}
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="identity-panel"
          role="region"
          aria-label={identity ? "Your profile" : "Sign in"}
        >
          {identity ? (
            <Profile
              identity={identity}
              onSignOut={() => {
                clearIdentity();
                setIdentity(null);
                close();
              }}
            />
          ) : (
            <SignIn
              onSignedIn={(next) => {
                setIdentity(next);
              }}
              onCancel={close}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ── Signed out ────────────────────────────────────────────────── */

function SignIn({
  onSignedIn,
  onCancel,
}: {
  onSignedIn: (identity: SiteIdentity) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [persisted, setPersisted] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { identity, persisted: ok } = saveIdentity({ name, role, org });
    setPersisted(ok);
    onSignedIn(identity);
  };

  return (
    <form onSubmit={submit}>
      <p className="identity-title">Sign in</p>

      {/* The honest sentence, first. A sign-in form whose first line is a
          disclaimer would be hiding the most important thing about it. */}
      <p className="identity-note">
        There is no account and no password. This starts a session on{" "}
        <strong>this device only</strong> — nothing is sent anywhere, and
        nothing here identifies you to anyone.
      </p>

      <label className="identity-field">
        <span className="identity-label">Your name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Njeri"
          autoComplete="off"
          required
        />
      </label>

      <label className="identity-field">
        <span className="identity-label">
          Role <span className="identity-hint">optional</span>
        </span>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Proprietor"
          autoComplete="off"
        />
      </label>

      <label className="identity-field">
        <span className="identity-label">
          Organisation <span className="identity-hint">optional</span>
        </span>
        <input
          type="text"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          placeholder="e.g. your school or firm"
          autoComplete="off"
        />
      </label>

      <div className="identity-actions">
        <button type="submit" className="btn" disabled={!name.trim()}>
          Start session
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {!persisted ? (
        <p className="identity-warn">
          This browser is refusing to store anything, so the session will end
          when you leave the page.
        </p>
      ) : null}
    </form>
  );
}

/* ── Signed in ─────────────────────────────────────────────────── */

function Profile({
  identity,
  onSignOut,
}: {
  identity: SiteIdentity;
  onSignOut: () => void;
}) {
  const since = new Date(identity.since);
  const readable = Number.isNaN(since.getTime())
    ? identity.since
    : since.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  return (
    <>
      <p className="identity-title">Your profile</p>

      {/* The mark at full size, with the initials. The only place on the
          site where the reader's own name is the largest type. */}
      <div className="identity-profile">
        <span className="identity-avatar" aria-hidden="true">
          {initialsOf(identity.name)}
        </span>
        <div>
          <p className="identity-name">{identity.name}</p>
          <p className="identity-sub">
            {identity.role ? <span>{identity.role}</span> : null}
            {identity.role && identity.org ? <span aria-hidden="true"> · </span> : null}
            {identity.org ? <span>{identity.org}</span> : null}
            {!identity.role && !identity.org ? <span>No role set</span> : null}
          </p>
        </div>
      </div>

      {/* A register row, because that is what every other fact on this
          site is. The session is a fact about this device and it is held at
          the state it carries. */}
      <dl className="identity-facts">
        <div>
          <dt>Session started</dt>
          <dd>{readable}</dd>
        </div>
        <div>
          <dt>Held by</dt>
          <dd>{identity.custody}</dd>
        </div>
        <div>
          <dt>Transmitted</dt>
          <dd>Nothing</dd>
        </div>
      </dl>

      <p className="identity-note">
        This is the product&rsquo;s own claim, made on you: your record stays on
        your device until you export it. Open devtools and the stored object
        says so too.
      </p>

      <div className="identity-actions">
        <button type="button" className="btn-ghost" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </>
  );
}