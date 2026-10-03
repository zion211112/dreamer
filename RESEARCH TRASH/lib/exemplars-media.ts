// Media exemplars — the library half of the studio. Every lesson, video,
// audiobook, e-book, timeline and VR lab carries its five-line plan (the
// "Intention · Inputs · Activity · Evidence · Adjustment" scaffold) so a
// substitute teacher can run it cold.

import { Category, ContentItem } from "./content";

function mk(i: Partial<ContentItem> & { id: string; title: string; subject: string; category: Category }): ContentItem {
  return {
    id: i.id,
    category: i.category,
    title: i.title,
    subject: i.subject,
    gradeBand: i.gradeBand ?? "Junior 7",
    kras: i.kras ?? [],
    competency: i.competency ?? "",
    misconception: i.misconception ?? "",
    rubric: i.rubric ?? "",
    plan: i.plan ?? "",
    type: i.type ?? "multiple-choice",
    bloom: i.bloom ?? 2,
    marks: i.marks ?? 5,
    durationMin: i.durationMin ?? 10,
    status: i.status ?? "published",
    createdAt: i.createdAt ?? 1750000000000
  };
}

export const EXEMPLAR_MEDIA: ContentItem[] = [
  mk({
    id: "ex-l-maths",
    category: "lesson",
    title: "Percentages as discount — the market stall lesson",
    subject: "Mathematics",
    gradeBand: "Junior 7",
    kras: ["MAT.7.2.1"],
    competency: "Thinking & Problem Solving",
    misconception: "Discount % is read off the sale price, not the marked price.",
    durationMin: 40,
    plan: "Intention: compute a marked price from a discounted one using KSh market examples. Inputs: price tags from the duka (real or drawn), exercise books. Activity: pairs price three garments, one offers 20% off, the partner reconstructs the marked price. Evidence: working on the board — method line visible, not just the answer. Adjustment: learners who add 20% to the sale price re-run with 50% first, where the halving shows the base.",
    status: "published"
  }),
  mk({
    id: "ex-l-sci",
    category: "lesson",
    title: "Series circuits — brightness and the number of cells",
    subject: "Integrated Science",
    gradeBand: "Junior 7",
    kras: ["SCI.7.1.2"],
    competency: "Digital Literacy",
    misconception: "More cells 'split' the current, so brightness never changes.",
    durationMin: 40,
    plan: "Intention: build a two-cell series circuit and explain the brightness change. Inputs: 1.5V cells ×2, holders, lamp, switch, wires per group. Activity: wire one-cell then two-cell, record brightness, draw both circuits with the switch in. Evidence: the recorded observation plus both drawn circuits; one group demonstrates. Adjustment: groups stuck on 'sharing' compare two cells in parallel — brightness barely changes — and the contrast forces the series/parallel distinction.",
    status: "published"
  }),
  mk({
    id: "ex-l-kisw",
    category: "lesson",
    title: "Kusoma kwa picha: Sokoni — reading the market",
    subject: "Kiswahili",
    gradeBand: "Lower 2",
    kras: ["KIS.2.1.1"],
    competency: "Communication & Language",
    durationMin: 35,
    plan: "Intention: name market items in Kiswahili and build two-word phrases. Inputs: sokoni picture chart, real items where possible (mango, tomato, sukuma). Activity: 'duka la darasa' — one learner is the muuzaji, others buy in full phrases: 'Nipe tunda moja tafadhali.' Evidence: each learner completes one purchase phrase unaided. Adjustment: learners blending English re-run with the chart covered — the image, not translation, carries meaning.",
    status: "published"
  }),
  mk({
    id: "ex-l-sst",
    category: "lesson",
    title: "The Kenyan counties map walk — Yala Swamp to Lamu",
    subject: "Social Studies",
    gradeBand: "Junior 7",
    kras: ["SST.7.3.1"],
    competency: "Citizenship",
    misconception: "Physical features are located by county headquarters, not by map work.",
    durationMin: 40,
    plan: "Intention: locate five physical features on the county map and name one livelihood each supports. Inputs: wall map of Kenya, county outline maps, card. Activity: map walk — teams rotate to stations (Yala Swamp, Lake Turkana, the Mau water tower, Tana Delta, the Rift lakes), pin and justify. Evidence: each team pins the feature and defends the county call in one sentence. Adjustment: teams placing features 'where the town is' re-place them on a blank physical map with no county names.",
    status: "published"
  }),
  mk({
    id: "ex-l-agne",
    category: "lesson",
    title: "Financial records at home — the exercise-book ledger",
    subject: "Business Studies",
    gradeBand: "Junior 8",
    kras: ["BUS.8.1.1"],
    competency: "Self-Efficacy",
    misconception: "A record is anything written down, anywhere.",
    durationMin: 40,
    plan: "Intention: keep a two-column cash record for a week of home purchases. Inputs: exercise book, the family's week of shopping (recalled). Activity: rule a two-column book, post five entries, total both columns. Evidence: the book itself — dated, totalled, balanced. Adjustment: learners posting randomly re-post the teacher's worked example first, then their own.",
    status: "published"
  }),
  mk({
    id: "ex-l-up",
    category: "lesson",
    title: "Compost diary — two weeks, one bin",
    subject: "Science & Technology",
    gradeBand: "Upper 1",
    kras: ["SCI.4.4.2"],
    competency: "Creativity & Imagination",
    durationMin: 40,
    plan: "Intention: set up and maintain a compost bin and explain why air and 'browns' matter. Inputs: one class bin, kitchen peelings, dry leaves, turning stick, diary sheet. Activity: groups layer greens and browns, set a turning rota, record smell, temperature and visitors weekly. Evidence: the two-week diary with the turning rota signed. Adjustment: bins that go slimy get a rescue operation — diagnose against the diary, fix, write the before/after entry.",
    status: "published"
  }),
  mk({
    id: "ex-l-form",
    category: "lesson",
    title: "Building the Nation — hearing the irony aloud",
    subject: "English",
    gradeBand: "Form 3",
    kras: ["ENG.11.2.1"],
    competency: "Citizenship",
    misconception: "The persona is praising the driver.",
    durationMin: 40,
    plan: "Intention: hear how tone carries irony that silent reading hides. Inputs: the poem in hand, a strong recorded reading (or the teacher). Activity: listen once for tone, once marking the lines where the voice 'turns'. Evidence: the marked turn-lines plus a two-line note on the final smile. Adjustment: learners reading the driver as the hero re-listen to the last stanza only, with the question: who laughs last, and at whom?",
    status: "published"
  }),
  mk({
    id: "ex-v-circuit",
    category: "video",
    title: "Video · Two cells, one lamp — the brightness test (3:40)",
    subject: "Integrated Science",
    gradeBand: "Junior 7",
    kras: ["SCI.7.1.2"],
    competency: "Digital Literacy",
    misconception: "Brightness is a property of the lamp, not the circuit.",
    durationMin: 4,
    plan: "Intention: see the brightness change before wiring it. Inputs: the video, then the bench. Activity: watch muted at half-speed, predict aloud, verify at the bench. Evidence: prediction written before the lamp lights. Adjustment: pairs that predicted no change re-watch the series segment with the sheet in hand.",
    status: "published"
  }),
  mk({
    id: "ex-v-market",
    category: "video",
    title: "Video · Percentage discounts at the duka — worked live (5:10)",
    subject: "Mathematics",
    gradeBand: "Junior 7",
    kras: ["MAT.7.2.1"],
    competency: "Thinking & Problem Solving",
    misconception: "The discount is taken off the sale price.",
    durationMin: 5,
    plan: "Intention: anchor the base-of-the-percentage question in a shop scene. Inputs: the video, mini-whiteboards. Activity: pause before each reveal, every pair shows a price on the board. Evidence: five board checks in the exercise book margin. Adjustment: pairs using the sale price as base re-run with 10% and 50% where the error is obvious.",
    status: "published"
  }),
  mk({
    id: "ex-v-map",
    category: "video",
    title: "Video · Kenya from above — counties and the features that name them",
    subject: "Social Studies",
    gradeBand: "Junior 7",
    kras: ["SST.7.3.1"],
    competency: "Citizenship",
    durationMin: 8,
    plan: "Intention: connect county names to the physical features they carry. Inputs: the video, county outline map. Activity: call out each feature; a scribe pins it on the wall map. Evidence: the finished wall map. Adjustment: learners calling county towns re-watch with the physical map only.",
    status: "published"
  }),
  mk({
    id: "ex-a-setbook",
    category: "audiobook",
    title: "Audiobook · Kenyan short story: The Blue Scarf, read aloud (22 min)",
    subject: "English",
    gradeBand: "Junior 8",
    kras: ["ENG.8.1.3"],
    competency: "Communication & Language",
    durationMin: 22,
    plan: "Intention: build listening stamina and track character change. Inputs: the audiobook, tracking sheet. Activity: two sittings; after each, jot one line the character would not have said a week earlier. Evidence: two jotted lines with chapter cues. Adjustment: restless groups listen standing, with the sheet on the wall to sticker as the story turns.",
    status: "published"
  }),
  mk({
    id: "ex-a-kisw",
    category: "audiobook",
    title: "Audiobook · Hadithi: Sungura na Fisi, Kiswahili (12 min)",
    subject: "Kiswahili",
    gradeBand: "Lower 3",
    kras: ["KIS.3.2.1"],
    competency: "Communication & Language",
    durationMin: 12,
    plan: "Intention: hear story Kiswahili before reading it. Inputs: the audiobook, picture sequence cards. Activity: listen once; retell in pairs using the cards; second listen to check order. Evidence: the pair retell checked against the cards. Adjustment: pairs that invert the sequence retell with three cards first, then five.",
    status: "published"
  }),
  mk({
    id: "ex-a-poetry",
    category: "audiobook",
    title: "Audiobook · Poetry performance: Building the Nation (8 min)",
    subject: "English",
    gradeBand: "Form 3",
    kras: ["ENG.11.2.1"],
    competency: "Citizenship",
    misconception: "The persona is praising the driver.",
    durationMin: 8,
    plan: "Intention: hear tone carry irony that silent reading hides. Inputs: text in hand. Activity: listen once for tone, once marking the lines where the voice turns. Evidence: marked turn-lines plus a two-line note on the smile. Adjustment: re-listen to the final stanza and ask who laughs last.",
    status: "published"
  }),
  mk({
    id: "ex-e-science",
    category: "ebook",
    title: "E-book · Integrated Science Grade 7: Energy strands notes",
    subject: "Integrated Science",
    gradeBand: "Junior 7",
    kras: ["SCI.7.1.2"],
    competency: "Digital Literacy",
    durationMin: 25,
    plan: "Intention: pre-read the strand before the bench work. Inputs: the e-book chapter, two-column notes. Activity: read, then write the so-what line for each section. Evidence: two-column notes, three lines minimum. Adjustment: transcribers close the book and write from notes.",
    status: "published"
  }),
  mk({
    id: "ex-e-history",
    category: "historical-doc",
    title: "Historical doc · The Kenya Constitution, Chapter 12 — public finance",
    subject: "Social Studies",
    gradeBand: "Junior 9",
    kras: ["SST.9.4.1"],
    competency: "Citizenship",
    durationMin: 30,
    plan: "Intention: read a primary source and find where public money is controlled. Inputs: the simplified extract, highlighters. Activity: highlight the three control points, name the office holding each. Evidence: the highlighted extract with margin names. Adjustment: groups quoting headlines instead re-read the section itself and quote the line.",
    status: "published"
  }),
  mk({
    id: "ex-t-independence",
    category: "timeline",
    title: "Timeline · The road to independence, 1944–1964",
    subject: "History",
    gradeBand: "Junior 9",
    kras: ["HIS.9.1.2"],
    competency: "Citizenship",
    misconception: "Independence happened in 1963 without the decades before it.",
    durationMin: 30,
    plan: "Intention: sequence ten events and defend the order. Inputs: event cards, washing line and pegs. Activity: teams peg the decade, then defend one controversial ordering. Evidence: the pegged line plus one written defence. Adjustment: teams putting the war before its causes re-run with dates printed, then without.",
    status: "published"
  }),
  mk({
    id: "ex-vr",
    category: "vr-lab",
    title: "VR Lab · Inside the working circuit — current you can walk through",
    subject: "Integrated Science",
    gradeBand: "Junior 8",
    kras: ["SCI.8.1.1"],
    competency: "Digital Literacy",
    misconception: "Current is used up by the lamp — it runs out at the bulb.",
    durationMin: 20,
    plan: "Intention: see current as the same charge everywhere in the loop. Inputs: the VR module or the projector demo, prediction sheet. Activity: walk the loop; at three points the guide asks whether the flow is the same. Evidence: the three-point prediction sheet, before and after. Adjustment: the runs-out intuition re-walks with an ammeter overlay — the numbers refuse to drop.",
    status: "published"
  })
];

