"use client";

import { useState } from "react";
import { LOCATIONS, OCCUPATIONS, suggestUsername, validUsername } from "@/lib/ledger";
import { SKILLS, parseSkills } from "@/lib/board";
import { StateTag } from "@/components/site/StateTag";
import type { SignUpInput } from "./record";

type FieldErrs = {
  name?: string;
  occupation?: string;
  location?: string;
};

/**
 * The join form — the only way a name gets onto the roll.
 *
 * Every field is a local write, and the copy says so at each one rather
 * than once at the top: a caveat three fields up does not survive the
 * button. The controlled lists (trades, locations, skill slugs) are the
 * site's existing commitment to comparable records, so the form takes
 * what they allow and refuses the rest with a message that names the list.
 */
export function JoinForm({
  taken,
  onSignUp,
}: {
  /** Handles already on this device's roll. */
  taken: string[];
  onSignUp: (input: SignUpInput) => void;
}) {
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [location, setLocation] = useState("");
  const [skillsRaw, setSkillsRaw] = useState("");
  const [errs, setErrs] = useState<FieldErrs>({});

  // Live, because a handle is short and the rules on it are four: a person
  // should not have to submit to be told the handle is two characters long.
  const handleErr = handle.trim() ? validUsername(handle, taken) : null;
  const skills = parseSkills(skillsRaw);
  const skillsErr = skillsRaw.trim() ? skills.err : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const next: FieldErrs = {};
    if (name.trim().length < 2) next.name = "A name, or whatever you answer to. Two characters minimum.";
    if (!OCCUPATIONS.includes(occupation)) next.occupation = "Pick the closest trade on the list. The list is the list.";
    if (!LOCATIONS.includes(location)) next.location = "Pick one of the six. The list is the list.";
    setErrs(next);

    if (handleErr || skillsErr || next.name || next.occupation || next.location) return;

    onSignUp({
      username: handle.trim().replace(/^@/, ""),
      name: name.trim(),
      occupation,
      location,
      skills: skills.skills
    });
  }

  return (
    <section className="section" id="roll-join" aria-labelledby="roll-join-heading">
      <div className="section-head">
        <h2 className="section-title" id="roll-join-heading">
          Sign the roll
        </h2>
        <StateTag
          state="PROTOTYPE"
          title="The register genuinely works in this browser and is genuinely not deployed anywhere. Nothing below reaches a server."
        />
      </div>

      <div className="prose" style={{ marginBottom: "var(--s-4)" }}>
        <p>
          The roll ships empty. There is no seed directory, no founding
          members and no list of other people to be measured against — the
          first record on a device is the person using that device, and the
          only count this route can print honestly is the number of records
          this browser holds.
        </p>
      </div>

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="roll-handle">
            Handle
          </label>
          <input
            id="roll-handle"
            className="input"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Fundi_0001"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="roll-handle-hint"
            aria-invalid={handleErr ? true : undefined}
          />
          {handleErr ? (
            <p className="err" role="alert">
              {handleErr}
            </p>
          ) : null}
          <p className="hint" id="roll-handle-hint">
            Letters, numbers and underscore, 3–20 characters. &ldquo;Taken on
            this roll&rdquo; means taken by another record in this browser:
            nothing is checked against anybody, because there is no
            directory here to check it against.
          </p>
          <div className="action-row" style={{ marginTop: "var(--s-2)" }}>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => setHandle(suggestUsername(taken))}
            >
              Suggest one
            </button>
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="roll-name">
            Name
          </label>
          <input
            id="roll-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="As you would like it written on a job card"
            autoComplete="name"
            aria-invalid={Boolean(errs.name)}
          />
          {errs.name ? (
            <p className="err" role="alert">
              {errs.name}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="roll-occupation">
            Trade
          </label>
          <select
            id="roll-occupation"
            className="select"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            aria-invalid={Boolean(errs.occupation)}
          >
            <option value="">Choose one</option>
            {OCCUPATIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {errs.occupation ? (
            <p className="err" role="alert">
              {errs.occupation}
            </p>
          ) : null}
          <p className="hint">
            Seven trades, because a trade that has a name is comparable to the
            next one and a free-text job title is not.
          </p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="roll-location">
            Location
          </label>
          <select
            id="roll-location"
            className="select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-invalid={Boolean(errs.location)}
          >
            <option value="">Choose one</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {errs.location ? (
            <p className="err" role="alert">
              {errs.location}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="roll-skills">
            Skills
          </label>
          <input
            id="roll-skills"
            className="input"
            value={skillsRaw}
            onChange={(e) => setSkillsRaw(e.target.value)}
            placeholder="civil, logistics"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="roll-skills-hint"
            aria-invalid={skillsErr ? true : undefined}
          />
          {skillsErr ? (
            <p className="err" role="alert">
              {skillsErr}
            </p>
          ) : null}
          <p className="hint" id="roll-skills-hint">
            Comma-separated slugs. Free text fragments reputation; slugs do
            not — one yard, one spelling, so two records can be compared at
            all. The yard is {SKILLS.join(" · ")}. Leave it empty and the
            record carries no skills; that is a claim you have not made, not
            a gap in the form.
          </p>
        </div>

        <div className="action-row">
          <button className="btn" type="submit">
            Sign the roll
          </button>
          <p className="hint" style={{ maxWidth: "46ch" }}>
            One record, sealed as it is written, stored in this browser. No
            account, no code sent by SMS, no confirmation from anyone.
          </p>
        </div>
      </form>

      <p className="local-note" style={{ marginTop: "var(--s-4)" }}>
        <strong>What signing does not do · </strong>It does not create an
        account, because there is nowhere for an account to live. It does
        not check your handle against a directory, verify you, or tell
        anyone you exist. It writes one record into this browser&rsquo;s
        local storage and computes a hash of it in this tab. There is no
        server behind this page, and the record you just wrote was never
        transmitted — clear it below with the wipe, or lose it with the
        browser, and it is gone for good.
      </p>
    </section>
  );
}