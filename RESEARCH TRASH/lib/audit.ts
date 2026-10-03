// The studio's expert audit — design science, not prediction.
//
// The studio shows what this computes; nothing here reads scores, logs or
// the class. Every check is a rule an education engineer can sign off on,
// grounded in the assessment craft behind the CBC:
//
//   1 · Traceability   — assessment follows the learning experience;
//                         no KRA, no schedule, no defence at inspection.
//   2 · Cognitive      — demand is placed on Bloom's scale; recall-heavy
//      demand            design is the known CBC failure mode.
//   3 · Target         — one of the seven competencies or the values,
//                        named, not implied.
//   4 · Hook           — the misconception the item is built to elicit;
//                        without it the item only measures.
//   5 · Evidence       — a marking key (written), a scaffold (lesson), a
//                        runtime (media): mastery must be on record.
//   6 · Budgets        — marks against time, weight against demand.
//
// The shape is deliberately small and pure — no state, no IO — so the ML
// team can later replace these heuristics with a scored model behind the
// same Check[] interface, without touching the studio.

import { BLOOM_LEVELS, ContentItem, ExamPaper } from "./content";

export type Sev = "pass" | "watch" | "fail";

export interface Check {
  id: string;
  sev: Sev;
  title: string;
  detail: string;
  fix?: string; // one line, imperative — what to do about it
}

export function auditItem(it: ContentItem): Check[] {
  const cs: Check[] = [];
  const isTest = it.category === "test";
  const isMedia = !isTest && it.category !== "lesson" && it.category !== "timeline";

  // 1 · Traceability.
  cs.push(
    it.kras.length > 0
      ? {
          id: "trace",
          sev: "pass",
          title: `Traced to ${it.kras.length} KRA${it.kras.length > 1 ? "s" : ""}`,
          detail: "Assessment follows the learning experience — this item can be scheduled and defended at inspection."
        }
      : {
          id: "trace",
          sev: "fail",
          title: "Untraced",
          detail: "The item names no KRA. Untraced items cannot be scheduled against the design and will not survive inspection.",
          fix: "Bind it to at least one KRA code."
        }
  );

  // 2 · Cognitive demand, or the lesson scaffold.
  if (isTest) {
    const level = BLOOM_LEVELS[it.bloom] ?? BLOOM_LEVELS[2];
    cs.push(
      it.bloom >= 2
        ? { id: "cognitive", sev: "pass", title: `Demand · ${level}`, detail: "The item asks the learner to do something with knowledge, not just recall it." }
        : {
            id: "cognitive",
            sev: "watch",
            title: `Recall-level demand · ${level}`,
            detail: "Knowledge and comprehension measure nothing new. CBC assessment should reach application and above.",
            fix: "Raise the demand — a new context, a judgement, a construction."
          }
    );
  } else if (it.category === "lesson") {
    cs.push(
      it.plan.trim()
        ? {
            id: "cognitive",
            sev: "pass",
            title: "Lesson scaffold written",
            detail: "Intention, inputs, activity, evidence, adjustment — the lesson is a design, not a hope."
          }
        : {
            id: "cognitive",
            sev: "watch",
            title: "No lesson scaffold",
            detail: "A lesson without a written scaffold is a hope, not a design.",
            fix: "Write the five-line scaffold in the mastery evidence node."
          }
    );
  }

  // 3 · Target — the seven competencies or the values, named.
  cs.push(
    it.competency.trim()
      ? { id: "target", sev: "pass", title: "Target named", detail: `Develops ${it.competency}.` }
      : {
          id: "target",
          sev: "watch",
          title: "No target named",
          detail: "The seven CBC competencies and the values should be aimed at, not implied.",
          fix: "Pick the competency or value this item develops."
        }
  );

  // 4 · Diagnostic hook — the misconception the item is built to elicit.
  cs.push(
    it.misconception.trim()
      ? { id: "hook", sev: "pass", title: "Diagnostic hook set", detail: `The item is built to elicit: “${it.misconception}”` }
      : {
          id: "hook",
          sev: "watch",
          title: "No diagnostic hook",
          detail: "An item without a hook only measures; it does not reveal where the thinking breaks.",
          fix: "Name the specific wrong answer it should expose."
        }
  );

  // 5 · Mastery evidence — marking key, scaffold or runtime, by kind.
  if (isTest) {
    cs.push(
      it.rubric.trim()
        ? { id: "key", sev: "pass", title: "Marking key written", detail: "Mastery evidence is on record — partial credit is defensible." }
        : {
            id: "key",
            sev: "watch",
            title: "No marking key",
            detail: "Without a key, two teachers will mark this item two ways.",
            fix: "Write what earns full marks and what earns half."
          }
    );
  } else if (isMedia) {
    cs.push(
      it.durationMin > 0
        ? { id: "medium", sev: "pass", title: "Medium scheduled", detail: `${it.durationMin} min on the clock — the timetable holds it.` }
        : {
            id: "medium",
            sev: "watch",
            title: "No runtime on the medium",
            detail: "Media without a runtime cannot sit on a timetable.",
            fix: "Set the minutes it needs in the room."
          }
    );
  }

  // 6 · Weight — written items carry their marks.
  if (isTest) {
    cs.push(
      it.marks >= 1
        ? it.marks > 20
          ? {
              id: "weight",
              sev: "watch",
              title: `Heavy item · ${it.marks} marks`,
              detail: "More than half of a 40-mark paper — make sure the demand is worth the weight."
            }
          : { id: "weight", sev: "pass", title: `Weight · ${it.marks} mark${it.marks > 1 ? "s" : ""}`, detail: "Proportionate to the demand." }
        : {
            id: "weight",
            sev: "fail",
            title: "No marks",
            detail: "A written item with no weight cannot be papered.",
            fix: "Set the marks."
          }
    );
  }

  // 7 · Prompt — the stimulus is a task or a description, not a label.
  cs.push(
    it.title.trim().length >= 12
      ? { id: "prompt", sev: "pass", title: "Prompt carries a task", detail: "The stimulus reads as a task, not a label." }
      : {
          id: "prompt",
          sev: "watch",
          title: "Prompt too thin",
          detail: "A two-word title is a label, not a stimulus.",
          fix: "Write the full task or the full description of the resource."
        }
  );

  // 8 · Status — sealed or draft.
  cs.push(
    it.status === "published"
      ? { id: "status", sev: "pass", title: "Published", detail: "Cleared for print." }
      : { id: "status", sev: "watch", title: "Still a draft", detail: "Seal it before it reaches a paper or a classroom." }
  );

  return cs;
}

// Paper audit — the exam-design craft: time against marks, the cognitive
// mix, traceability, targets, drafts, process skills, hooks, instructions.
export function auditPaper(paper: ExamPaper, byId: Map<string, ContentItem>): Check[] {
  const cs: Check[] = [];
  const attached = paper.items.map((id) => byId.get(id)).filter((i): i is ContentItem => !!i);
  const tests = attached.filter((i) => i.category === "test");
  const marks = tests.reduce((s, i) => s + i.marks, 0);

  if (attached.length === 0) {
    cs.push({
      id: "empty",
      sev: "fail",
      title: "Empty paper",
      detail: "Nothing is attached — the sheet would print blank.",
      fix: "Pull items in from the bank."
    });
    return cs;
  }

  // Time budget: 10 minutes to read, about 2 minutes per mark.
  const need = 10 + marks * 2;
  cs.push(
    marks > 0 && paper.durationMin < need
      ? {
          id: "time",
          sev: "fail",
          title: "Time famine",
          detail: `${marks} marks needs about ${need} min to read, work and check; the paper allows ${paper.durationMin}.`,
          fix: "Cut the weight, extend the clock, or both."
        }
      : {
          id: "time",
          sev: "pass",
          title: "Time fits",
          detail: `${marks} marks in ${paper.durationMin} min — ${Math.max(0, paper.durationMin - need)} min of headroom.`
        }
  );

  // Cognitive mix — at least 40% of the written items must reach application.
  if (tests.length === 0) {
    cs.push({
      id: "spread",
      sev: "watch",
      title: "No written items",
      detail: "The paper carries resources but nothing to mark — it assesses attendance, not mastery."
    });
  } else {
    const above = tests.filter((i) => i.bloom >= 2).length;
    cs.push(
      above / tests.length >= 0.4
        ? {
            id: "spread",
            sev: "pass",
            title: "Cognitive mix holds",
            detail: `${above} of ${tests.length} written items work at application and above — the paper tests thinking, not just memory.`
          }
        : {
            id: "spread",
            sev: "fail",
            title: "Recall-heavy paper",
            detail: `Only ${above} of ${tests.length} written items reach application. A paper that only tests memory is the critique, not the model.`,
            fix: "Swap recall items for new-context tasks at the same KRA."
          }
    );
  }

  // Traceability of everything on the sheet.
  const untraced = attached.filter((i) => i.category === "test" && i.kras.length === 0).length;
  cs.push(
    untraced === 0
      ? { id: "trace", sev: "pass", title: "Fully traced", detail: "Every item on the paper names its KRA." }
      : {
          id: "trace",
          sev: "fail",
          title: `${untraced} untraced item${untraced > 1 ? "s" : ""}`,
          detail: "Items without a KRA cannot be scheduled against the design and will not survive inspection.",
          fix: "Trace each one, or drop it from the paper."
        }
  );

  // Competency targets on the written items.
  const noTarget = tests.filter((i) => !i.competency.trim()).length;
  if (noTarget > 0)
    cs.push({
      id: "target",
      sev: "watch",
      title: `${noTarget} written item${noTarget > 1 ? "s" : ""} without a target`,
      detail: "The CBC competencies should be aimed at, not implied.",
      fix: "Name the competency each item develops."
    });

  // Drafts on the sheet.
  const drafts = attached.filter((i) => i.status === "draft").length;
  if (drafts > 0)
    cs.push({
      id: "draft",
      sev: "watch",
      title: `${drafts} draft${drafts > 1 ? "s" : ""} on the sheet`,
      detail: "A draft on a printed paper is a promise not kept.",
      fix: "Publish or detach before you print."
    });

  // Process skills — a CBC paper must be able to see doing, not just writing.
  const process = attached.some(
    (i) => i.category === "vr-lab" || i.type === "practical" || i.type === "performance" || i.type === "portfolio"
  );
  cs.push(
    process
      ? { id: "process", sev: "pass", title: "Process skills assessed", detail: "The paper carries practical or performance work, not just written recall." }
      : {
          id: "process",
          sev: "watch",
          title: "Written-only paper",
          detail: "CBC process tasks keep their evidence in doing; a purely written sheet cannot see it.",
          fix: "Attach one practical, performance or portfolio task."
        }
  );

  // Diagnostic hooks.
  const hooks = attached.filter((i) => i.misconception.trim()).length;
  cs.push(
    hooks > 0
      ? {
          id: "hook",
          sev: "pass",
          title: `${hooks} item${hooks > 1 ? "s" : ""} carry${hooks === 1 ? "s" : ""} diagnostic hooks`,
          detail: "Failure on these will point at a specific break in the thinking."
        }
      : {
          id: "hook",
          sev: "watch",
          title: "No diagnostic hooks",
          detail: "Nothing on this paper reveals a misconception — it measures and stops.",
          fix: "Give at least one item a named hook."
        }
  );

  // Instructions.
  cs.push(
    paper.note.trim()
      ? { id: "instructions", sev: "pass", title: "Instructions set", detail: "Learners know the ground rules before question one." }
      : {
          id: "instructions",
          sev: "watch",
          title: "No instruction line",
          detail: "Print the rules of the paper, not just its questions.",
          fix: "One line: what to answer, how to show working."
        }
  );

  return cs;
}

/* ------------------------------------------------------------------ */
/* Bank audit — the whole studio, read like a sign-off sheet.        */
/* ------------------------------------------------------------------ */

export interface BankReport {
  score: number; // 0–100; a pass counts 1, a watch 0.5
  checks: Check[];
}

export function auditBank(items: ContentItem[], papers: ExamPaper[]): BankReport {
  const cs: Check[] = [];
  let all = 0;
  let full = 0;
  let half = 0;
  const count = (c: Check) => {
    cs.push(c);
    all++;
    if (c.sev === "pass") full++;
    else if (c.sev === "watch") half++;
  };

  if (items.length === 0) {
    count({
      id: "empty",
      sev: "fail",
      title: "The bank is empty",
      detail: "No items on this device yet — nothing to audit and nothing to print.",
      fix: "Start an item, or restore the sample bank."
    });
  } else {
    const pub = items.filter((i) => i.status === "published").length;
    count(
      pub === items.length
        ? { id: "pulse", sev: "pass", title: `${items.length} items · all published`, detail: "Every item in the bank is cleared for print." }
        : {
            id: "pulse",
            sev: "watch",
            title: `${items.length} items · ${pub} published`,
            detail: `${items.length - pub} still in draft — the bank is only as strong as its weakest sheet.`
          }
    );

    const traced = items.filter((i) => i.kras.length > 0).length;
    const tshare = traced / items.length;
    count(
      tshare >= 0.8
        ? { id: "trace", sev: "pass", title: `${Math.round(tshare * 100)}% traced`, detail: "Almost the whole bank answers for itself at inspection." }
        : {
            id: "trace",
            sev: "watch",
            title: `${Math.round(tshare * 100)}% traced`,
            detail: "Under 80% of items carry a KRA — untraced items cannot be scheduled against the design.",
            fix: "Bind the untraced items to a KRA."
          }
    );

    const tests = items.filter((i) => i.category === "test");
    if (tests.length > 0) {
      const above = tests.filter((i) => i.bloom >= 2).length;
      count(
        above / tests.length >= 0.4
          ? {
              id: "cognitive",
              sev: "pass",
              title: "Cognitive mix holds",
              detail: `${above} of ${tests.length} written items ask for application and above — the bank teaches thinking.`
            }
          : {
              id: "cognitive",
              sev: "fail",
              title: "Recall-heavy bank",
              detail: `Only ${above} of ${tests.length} written items reach application. A bank built on recall will print papers that only measure memory.`,
              fix: "Reweight the bank toward new-context tasks."
            }
      );
      const hooks = tests.filter((i) => i.misconception.trim()).length;
      count(
        hooks > 0
          ? { id: "hook", sev: "pass", title: `${hooks} written item${hooks > 1 ? "s" : ""} carry hooks`, detail: "Failure will have somewhere to point." }
          : {
              id: "hook",
              sev: "fail",
              title: "No diagnostic hooks",
              detail: "Not one written item names the misconception it reveals — the bank measures and stops.",
              fix: "Give each written item its hook."
            }
      );
      const keys = tests.filter((i) => i.rubric.trim()).length;
      count(
        keys === tests.length
          ? { id: "key", sev: "pass", title: "Marking keys complete", detail: "Every written item carries its key — marking will be defensible." }
          : {
              id: "key",
              sev: "watch",
              title: `${tests.length - keys} written item${tests.length - keys > 1 ? "s" : ""} without a key`,
              detail: "No key, no partial credit, no two-teacher agreement.",
              fix: "Write the marking key for the missing items."
            }
      );
    }

    const media = items.filter((i) => i.category !== "test").length;
    count(
      media > 0
        ? {
            id: "media",
            sev: "pass",
            title: `${media} learning resource${media > 1 ? "s" : ""} in the bank`,
            detail: "Video, labs, books, archives — the classroom has texture, not just paper."
          }
        : {
            id: "media",
            sev: "watch",
            title: "A paper-only bank",
            detail: "No media or practical resources attached to the teaching.",
            fix: "Bring one resource in — a video, a lab, a text."
          }
    );
  }

  if (papers.length > 0) {
    const byId = new Map(items.map((i) => [i.id, i]));
    for (const p of papers) {
      const pc = auditPaper(p, byId);
      const fails = pc.filter((c) => c.sev === "fail");
      const watches = pc.filter((c) => c.sev === "watch");
      if (fails.length === 0)
        count(
          watches.length === 0
            ? { id: p.id, sev: "pass", title: p.title, detail: `${p.items.length} items · clean audit.` }
            : {
                id: p.id,
                sev: "watch",
                title: p.title,
                detail: `${p.items.length} items · ${watches.length} watch${watches.length > 1 ? "es" : ""} on the audit — ${watches
                  .map((c) => c.title)
                  .join("; ")
                  .toLowerCase()}.`
              }
        );
      else
        count({
          id: p.id,
          sev: "fail",
          title: p.title,
          detail: `${fails.map((c) => c.title).join("; ")}${watches.length ? ` · ${watches.length} more to watch` : ""}.`,
          fix: "Open the paper and clear the failures."
        });
    }
  } else if (items.length > 0) {
    count({
      id: "no-papers",
      sev: "watch",
      title: "No paper yet",
      detail: "Items exist; nothing has been composed into a printable sheet.",
      fix: "Start a paper and pull the items in."
    });
  }

  const score = all === 0 ? 0 : Math.round(((full + 0.5 * half) / all) * 100);
  return { score, checks: cs };
}
