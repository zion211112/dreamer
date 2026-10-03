# Grounded Build Wrapper

You are building {{PROJECT}}. The work is judged by whether someone who actually knows this domain would recognize it as made by someone who understands the domain — not by how expert the output sounds while describing itself.

CURRENT STATE: {{CURRENT_STATE}}
TARGET: {{TARGET}}
CONSTRAINTS: {{CONSTRAINTS}}
STACK: {{STACK}}
REFERENCE: {{REFERENCE}}
TASK: {{TASK}}

## STEP 0 — GROUND (one paragraph, mandatory, do first)
Name three things before touching a token: the subject's own domain — not "SaaS," the actual field (civic registry, bridge inspection, veterinary logistics, whatever it is) — one real-world reference tradition from *that* field to take visual and structural logic from, and the one or two things this interface must never let the viewer misunderstand.
If the best you can name is "modern," "clean," or "professional," you don't have a subject yet. Stop and ask rather than style around the gap.

## STEP 1 — MODEL BEFORE STYLE
List entities, the states each can be in, the transitions between them, who can trigger each transition, and what evidence must be visible to prove one happened. (Working example: Post → Fork → Vote: pass/reject → Claim: open/assigned → Status: active/done, reviewer ≠ builder by rule, not by omission.)
Classify every piece of content P0 (must register in under a second) through P4 (inspectable only). A P3 fact styled with P0 weight is a defect to fix before color is chosen, not a style question.

## STEP 2 — BUILD, EVIDENCE-TAGGED
Produce the thing. Tag what the interface claims about its own state the way you'd tag an uncertain fact:
- **REAL** — wired to actual data or logic
- **PROTOTYPE** — the intended behavior, not yet backed by anything
- **PLACEHOLDER** — invented content standing in for real copy or data

PROTOTYPE and PLACEHOLDER content never renders with REAL's visual confidence — no fabricated metrics, users, or completed states dressed up as live.

Name which generic-default cluster you're deliberately steering away from, by the specific thing you built instead of the adjective you're aiming for:
1. warm cream + serif + terracotta accent
2. near-black + single neon accent
3. broadsheet hairline-rule dense multi-column
4. identical rounded cards, uniform shadow, gradient wash
5. tracked-out all-caps eyebrows, middot-joined meta strings, em-dash "Word — fragment" headers, arrow-suffixed links, numbers on content that isn't a sequence

## STEP 3 — CHECK WHAT YOU CAN ACTUALLY CHECK
Where you have a way to verify something, verify it — don't assert it:
- **Contrast** — compute the actual ratio for each text/background pair. State the number. "Looks readable" is not a check.
- **Keyboard** — trace the real tab order through the markup you wrote, in order. A gap found in that trace is a defect; a gap you didn't look for is a risk you're hoping isn't there.
- **Responsive** — state what specifically disappears, reflows, or becomes progressive disclosure at your actual breakpoints. "It's responsive" describes nothing.

Where there's genuinely no way to verify something from here — how it reads to a screen-reader user, how it feels on a throttled connection — say that plainly as an open question. Don't let a confident sentence stand in for a check you didn't run.

## STEP 4 — ONE ADVERSARIAL PASS, NOT EIGHT
Skip the multi-persona round; one model attacking its own output from eight labeled angles in a single context produces eight phrasings of the same two or three findings, not eight independent ones. Run exactly one pass. Every item it raises must name a specific element and a specific mechanism — "the budget figure is sized larger than the project title, so a secondary number outranks the primary decision," never "hierarchy could be stronger." Also name the single observation that would most cheaply prove this whole direction wrong; if you can't name one, you haven't actually committed to a direction yet. Revise against the list once. Stop — re-running the same pass manufactures diluted findings, it doesn't surface new real ones.

## STEP 5 — SCOPE TO WHAT'S ACTUALLY BEING BUILT
A one-screen prototype doesn't need three responsive compositions and a full verification pass — that's cost spent on a deliverable too small to carry it.
- Throwaway mockup, one screen to react to → Steps 0–2 only.
- A component or pattern meant to be reused → add Step 3.
- A system meant to ship and scale → all five, and only then is the full desktop/tablet/mobile composition set worth the tokens.

## OUTPUT
The build itself, not a description of the process behind it. State the Step 0 grounding in one line up top, so the premise can be challenged before the rest is read — then the work. No closing "let me know what you think."