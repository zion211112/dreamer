"use client";

/**
 * POST A BUILD.
 *
 * A form with the weight of a contract: validateBuild decides whether the
 * record is allowed on the floor, and when it says no, its sentence is
 * rendered as it was written — not summarised, not softened. Nothing here
 * writes to the record by hand; addBuild mints the id, stamps the time and
 * files it.
 *
 * Two fields carry the load. The done line is the one that decides whether
 * the build may ever close, so it is written first in the markup and counted
 * as you type against the 144 the validator allows. The needs are one set of
 * facts, not a menu: validateBuild refuses a build that names no need at all
 * and refuses one that claims to need nothing while also asking for hands,
 * so the "nothing" chip here excludes the other four rather than merely
 * unchecking them, and says so.
 */

import { useState } from "react";
import {
  DOMAINS,
  TYPES,
  addBuild,
  stripUrls,
  validateBuild,
  type Build,
  type BuildNeeds,
  type FloorTier,
} from "@/lib/benben";
import { RISKS, SKILLS, parseSkills, ratifyTerms, type Risk } from "@/lib/board";

type PostBuildProps = {
  username: string | null;
  tier: FloorTier;
  /** The floor re-reads from storage so the new record takes its place in order. */
  onPosted: (b: Build) => void;
};

const EMPTY = { labor: 0, materials: "", funds: 0, intellect: "", nothing: false };

export function PostBuild({ username, tier, onPosted }: PostBuildProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [type, setType] = useState(TYPES[0]);
  const [location, setLocation] = useState("");
  const [risk, setRisk] = useState<Risk>("low");
  const [skillText, setSkillText] = useState("");
  const [skillsRead, setSkillsRead] = useState(false);
  const [needs, setNeeds] = useState(EMPTY);
  const [done, setDone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [posted, setPosted] = useState<string | null>(null);

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const parsed = parseSkills(skillText);
  const terms = ratifyTerms(risk);

  function setNeed(patch: Partial<BuildNeeds>) {
    setNeeds((n) => ({ ...n, ...patch }));
  }

  // "Nothing" excludes the rest of the needs rather than clearing the boxes:
  // the record that is written carries zeros and empty strings, which is
  // exactly what validateBuild demands of a build that needs nothing, and
  // the typed values are still there if the chip is released.
  function holdNothing(on: boolean) {
    setPosted(null);
    setNeed({ nothing: on, labor: on ? 0 : needs.labor, funds: on ? 0 : needs.funds });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setPosted(null);
    setSkillsRead(true);

    const record: BuildNeeds = needs.nothing
      ? { labor: 0, materials: "", funds: 0, intellect: "", nothing: true }
      : { ...needs, nothing: false };

    const problem = validateBuild({ title, body, done, needs: record });
    if (problem) {
      setErr(problem);
      return;
    }
    const skills = parseSkills(skillText);
    if (skills.err) {
      setErr(skills.err);
      return;
    }

    // Links are replaced, not followed: the floor is text, and a URL in a
    // done line is a promise the floor cannot keep or check.
    const b = addBuild({
      title,
      body: stripUrls(body),
      domain,
      type,
      needs: record,
      location,
      done: stripUrls(done),
      by: username ?? "Guest",
      tierAtPost: tier,
      risk,
      skills: skills.skills,
    });

    setErr(null);
    setPosted(b.id);
    setTitle("");
    setBody("");
    setLocation("");
    setDone("");
    setSkillText("");
    setNeeds(EMPTY);
    onPosted(b);
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="field">
        <label className="field-label" htmlFor="build-done">
          Done when — {done.trim().length}/144
        </label>
        <input
          id="build-done"
          className="input"
          value={done}
          maxLength={160}
          onChange={(e) => {
            setPosted(null);
            setDone(e.target.value);
          }}
          placeholder="the sentence that decides whether this may close"
        />
        <p className="hint">
          validateBuild refuses a build without one: &ldquo;Say what done looks like.
          One sentence.&rdquo; This line is what a closing attestation is checked
          against.
        </p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="build-title">
          Title — {title.trim().length}/89
        </label>
        <input
          id="build-title"
          className="input"
          value={title}
          maxLength={100}
          onChange={(e) => {
            setPosted(null);
            setTitle(e.target.value);
          }}
          placeholder="the work, named as work"
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="build-body">
          The work — {words}/500 words
        </label>
        <textarea
          id="build-body"
          className="textarea"
          value={body}
          onChange={(e) => {
            setPosted(null);
            setBody(e.target.value);
          }}
          placeholder="what exists, what is missing, what has already been tried"
        />
        <p className="hint">
          No emojis, and links in the body and the done line are replaced with
          &ldquo;[link removed — the floor is text]&rdquo;
        </p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="build-domain">
          Domain
        </label>
        <select
          id="build-domain"
          className="select"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        >
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="build-type">
          What this is
        </label>
        <select
          id="build-type"
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="build-location">
          Where — {(location || "—").slice(0, 40)}/40
        </label>
        <input
          id="build-location"
          className="input"
          value={location}
          maxLength={40}
          onChange={(e) => {
            setPosted(null);
            setLocation(e.target.value);
          }}
          placeholder="Mwea, Kagio, Embu"
        />
      </div>

      {/* Risk is not a mood. It sets the bar to be ratified, the length of
          the window, and the quorum that closes the build — so the terms
          for the class you are holding are printed under the chips. */}
      <fieldset className="fieldset">
        <legend>Risk class</legend>
        <div className="choices">
          {RISKS.map((r) => (
            <label className="choice" data-on={risk === r} key={r}>
              <input
                type="radio"
                name="build-risk"
                value={r}
                checked={risk === r}
                onChange={() => setRisk(r)}
              />
              {r}
            </label>
          ))}
        </div>
        <p className="hint" style={{ marginTop: "var(--s-2)" }}>
          {terms.barLabel} · {terms.windowLabel} · {terms.closeLabel}
        </p>
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor="build-skills">
          Skills — yard slugs, comma separated
        </label>
        <input
          id="build-skills"
          className="input"
          value={skillText}
          onChange={(e) => setSkillText(e.target.value)}
          onBlur={() => setSkillsRead(true)}
          placeholder="civil, funds"
        />
        <p className="hint">
          The yard: {SKILLS.join(", ")} — {parsed.skills.length} held. Free text is
          refused: &ldquo;is not on the yard list. The yard: …&rdquo;
        </p>
        {parsed.err && skillsRead ? (
          <p className="err" role="alert">
            {parsed.err}
          </p>
        ) : null}
      </div>

      <fieldset className="fieldset">
        <legend>What it needs</legend>

        <div className="choices" style={{ marginBottom: "var(--s-3)" }}>
          <label className="choice" data-on={needs.nothing}>
            <input
              type="checkbox"
              checked={needs.nothing}
              onChange={(e) => holdNothing(e.target.checked)}
            />
            Nothing — already built
          </label>
        </div>
        {needs.nothing ? (
          <p className="hint">
            Held. The four needs below are excluded from the record, which is what
            validateBuild requires: &ldquo;Nothing means nothing — uncheck the rest or
            uncheck Nothing.&rdquo;
          </p>
        ) : null}

        <div className="field">
          <label className="field-label" htmlFor="needs-labor">
            Hands wanted
          </label>
          <input
            id="needs-labor"
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={needs.labor}
            disabled={needs.nothing}
            onChange={(e) => setNeed({ labor: Math.max(0, Number(e.target.value) || 0) })}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="needs-materials">
            Materials
          </label>
          <input
            id="needs-materials"
            className="input"
            value={needs.materials}
            disabled={needs.nothing}
            onChange={(e) => setNeed({ materials: e.target.value })}
            placeholder="lashed reeds, timber decking"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="needs-funds">
            Funds, KES
          </label>
          <input
            id="needs-funds"
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={needs.funds}
            disabled={needs.nothing}
            onChange={(e) => setNeed({ funds: Math.max(0, Number(e.target.value) || 0) })}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="needs-intellect">
            Intellect
          </label>
          <input
            id="needs-intellect"
            className="input"
            value={needs.intellect}
            disabled={needs.nothing}
            onChange={(e) => setNeed({ intellect: e.target.value })}
            placeholder="truss ratios, load survey"
          />
        </div>
      </fieldset>

      {err ? (
        <p className="err" role="alert" style={{ marginBottom: "var(--s-3)" }}>
          {err}
        </p>
      ) : null}

      <div className="ticket-actions">
        <button type="submit" className="btn">
          Post it
        </button>
        <span className="hint">
          Signed @{username ?? "Guest"} at {tier}. The record is written to this
          browser and to nothing else.
        </span>
      </div>

      {posted ? (
        <p className="local-note" style={{ marginTop: "var(--s-3)" }} role="status">
          <strong>Posted</strong> {posted} is on this device and nowhere else. It
          carries your own up-vote, because addBuild signs the author in as the first
          voter — so the 1 on its card is your own signal, not a reading of anybody
          else. It leaves this floor the moment you clear this browser&rsquo;s storage.
        </p>
      ) : null}
    </form>
  );
}