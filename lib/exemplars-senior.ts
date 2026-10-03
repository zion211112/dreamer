// Senior-school exemplars — Mathematics, Physics and Biology, one worked
// lesson per form, Forms 1–4. These are the lessons a Form teacher actually
// teaches: the KCSE syllabus content of each year, written with the
// five-line plan scaffold so a deputy can take the class cold. The codes are
// KRA-flavoured; the parser in content.ts only splits them, never claims
// to know what a strand is called.
//
// Same shape as the media exemplars: the bank (Content Studio) filters them
// by the Form 1–4 grade bands, and the plan is the load-bearing field.

import { Category, ContentItem } from "./content";

function mk(i: Partial<ContentItem> & { id: string; title: string; subject: string; category: Category }): ContentItem {
  return {
    id: i.id,
    category: i.category,
    title: i.title,
    subject: i.subject,
    gradeBand: i.gradeBand ?? "Form 1",
    kras: i.kras ?? [],
    competency: i.competency ?? "",
    misconception: i.misconception ?? "",
    rubric: i.rubric ?? "",
    plan: i.plan ?? "",
    type: i.type ?? "multiple-choice",
    bloom: i.bloom ?? 3,
    marks: i.marks ?? 5,
    durationMin: i.durationMin ?? 40,
    status: i.status ?? "published",
    createdAt: i.createdAt ?? 1750000000000
  };
}

export const EXEMPLAR_SENIOR: ContentItem[] = [
  mk({
    id: "sen-l-m1",
    category: "lesson",
    title: "Simultaneous linear equations — the fare problem",
    subject: "Mathematics",
    gradeBand: "Form 1",
    kras: ["MAT.9.2.1"],
    competency: "Thinking & Problem Solving",
    misconception: "Elimination is \"removing a number\" — the sign of the second equation is never checked, so x − y is treated as y − x.",
    durationMin: 40,
    plan: "Intention: set up and solve two linear equations in two unknowns from a word problem. Inputs: the fare problem (two ticket types, two totals), two-column elimination on the board. Activity: pairs translate the story into x + y and 2x − y equations, then eliminate — teacher walks, watching the sign column. Evidence: both unknowns with the units attached (tickets, not bare numbers). Adjustment: pairs that lose a sign re-derive the second equation from the story before any arithmetic; the story, not the algebra, is the check.",
    status: "published"
  }),
  mk({
    id: "sen-l-m2",
    category: "lesson",
    title: "Trigonometric ratios — the roof pitch",
    subject: "Mathematics",
    gradeBand: "Form 2",
    kras: ["MAT.10.3.1"],
    competency: "Thinking & Problem Solving",
    misconception: "sin, cos and tan are picked by the angle being \"nice\", not by which sides the ratio actually uses.",
    durationMin: 40,
    plan: "Intention: choose the right ratio for an unknown side or angle in a right triangle. Inputs: roof-pitch diagram (span, height, pitch angle), protractor for a real ramp if one is in the compound. Activity: board the two known sides, name them opposite/adjacent/hypotenuse from the target angle, pick the ratio, solve — SOH-CAH-TOA card up. Evidence: the named sides before any calculator work. Adjustment: learners who reach for the wrong ratio rebuild the labelling with the angle moved to a different corner — same triangle, new labels, which forces \"the sides are named from the angle\".",
    status: "published"
  }),
  mk({
    id: "sen-l-m3",
    category: "lesson",
    title: "Quadratic functions — reading the graph, not just the formula",
    subject: "Mathematics",
    gradeBand: "Form 3",
    kras: ["MAT.11.3.2"],
    competency: "Digital Literacy",
    misconception: "The discriminant is a rule about \"how many answers\" — it is not read as what the graph does to the x-axis.",
    durationMin: 40,
    plan: "Intention: read roots, vertex and sign from a quadratic graph, and match it to b² − 4ac. Inputs: three graph cards (one crossing twice, one touching, one missing the axis), a spreadsheet with the y-values. Activity: groups take a card, plot the table, mark the vertex and the axis behaviour, then justify their discriminant reading on the board. Evidence: each group's graph with the vertex and both intercepts labelled. Adjustment: groups graphing only positive x-values are shown the symmetry about the vertex first — the full curve is two halves, not one.",
    status: "published"
  }),
  mk({
    id: "sen-l-m4",
    category: "lesson",
    title: "Grouped data — the ogive and the maize yield",
    subject: "Mathematics",
    gradeBand: "Form 4",
    kras: ["MAT.12.4.1"],
    competency: "Thinking & Problem Solving",
    misconception: "The cumulative frequency is counted up from the group total, not up through the groups; the ogive's first point is (lower bound of first group, 0).",
    durationMin: 40,
    plan: "Intention: build a less-than ogive from grouped data and read the median and quartiles off it. Inputs: a grouped table of 40 harvest yields (0–5, 5–10… kg/plot), graph paper, rulers. Activity: compute the running totals, plot (upper bound, cumulative n), join with a smooth curve, drop verticals at n/2 and the quartile lines. Evidence: the ogive with the three marked positions, values to the nearest unit. Adjustment: learners using class midpoints instead of upper bounds re-plot one curve with midpoints and compare where the median lands — the shift is the lesson.",
    status: "published"
  }),
  mk({
    id: "sen-l-p1",
    category: "lesson",
    title: "Scalars and vectors — walking gate to field",
    subject: "Physics",
    gradeBand: "Form 1",
    kras: ["PHY.9.1.1"],
    competency: "Thinking & Problem Solving",
    misconception: "Displacement is \"how far we walked\" — distance and displacement are used interchangeably, so the vector sum is never smaller than the walk.",
    durationMin: 40,
    plan: "Intention: distinguish scalar from vector quantities and add two displacement vectors by the parallelogram method. Inputs: the school's gate-to-field walk (north 200 m, then east 300 m), a compass card drawn on the board. Activity: the class walks the route, measures the straight-line return with a tape where possible, then draws the two vectors to scale and completes the parallelogram. Evidence: the drawn resultant with magnitude and bearing, matched to the measured return. Adjustment: learners who add 200 + 300 \"to get 500\" re-walk the route and time how far the 500 m line misses the field — the miss is the difference.",
    status: "published"
  }),
  mk({
    id: "sen-l-p2",
    category: "lesson",
    title: "Projectile motion — the shot from the tower",
    subject: "Physics",
    gradeBand: "Form 2",
    kras: ["PHY.10.2.3"],
    competency: "Digital Literacy",
    misconception: "Horizontal speed is \"used up\" partway across — the vx component is treated as changing, so time of flight is read off the horizontal leg.",
    durationMin: 40,
    plan: "Intention: solve a level-to-ground projectile by splitting into independent x and y motions. Inputs: the worked example (v₀ horizontal, height h), a spreadsheet with the two motion equations. Activity: students set the x-row and y-row separately, solve the vertical row for t, then take that single t into the horizontal row for range — the one shared number is t. Evidence: both rows on the page with t written only once and used twice. Adjustment: groups whose t differs between rows re-check which row t belongs to; the vertical row owns t, the horizontal row only spends it.",
    status: "published"
  }),
  mk({
    id: "sen-l-p3",
    category: "lesson",
    title: "Newton's second law — the lorry, the load, the seatbelt",
    subject: "Physics",
    gradeBand: "Form 3",
    kras: ["PHY.11.2.1"],
    competency: "Self-Efficacy",
    misconception: "F = ma is \"force moves things\" — in the stopping problem the force is on the load, not the lorry, and the load keeps going.",
    durationMin: 40,
    plan: "Intention: apply F = ma and impulse to a stopping vehicle and its cargo, and explain the safety design in terms of Δt. Inputs: the lorry-braking problem (mass m, speed u, stopping time t), a crumple-zone diagram. Activity: compute the stopping force on the load, then re-compute it with the stopping time doubled by a soft coupling — the force halves. Evidence: the two force values with the Δt ratio written beside them. Adjustment: learners who put the force on the lorry are asked who it hurts when the cargo keeps moving — the passenger, which is the whole point of the seatbelt.",
    status: "published"
  }),
  mk({
    id: "sen-l-p4",
    category: "lesson",
    title: "Electromagnetic induction — the school generator",
    subject: "Physics",
    gradeBand: "Form 4",
    kras: ["PHY.12.3.2"],
    competency: "Collaboration",
    misconception: "Induced voltage is \"created by the magnet\" — it is created by the change of flux, so a steady magnet sitting in the coil reads zero.",
    durationMin: 40,
    plan: "Intention: explain Faraday's law for a rotating coil in the generator and the role of the slip rings. Inputs: the generator diagram, a galvanometer on a coil with a bar magnet if available, otherwise the demonstration video. Activity: groups predict the galvanometer reading for three motions — magnet in, magnet out, magnet still — then test where the apparatus exists. Evidence: the three predicted readings with the reasoning, and the observed one agreeing. Adjustment: the \"still\" case is the hinge — a group that predicts a reading for the stationary magnet re-reads the law in words, not symbols, and the word \"change\" carries the argument.",
    status: "published"
  }),
  mk({
    id: "sen-l-b1",
    category: "lesson",
    title: "The cell — from the microscope to the model",
    subject: "Biology",
    gradeBand: "Form 1",
    kras: ["BIO.9.1.1"],
    competency: "Digital Literacy",
    misconception: "The cell wall \"is the membrane\" — plant and animal cell organelles are drawn as one list, wall and membrane never distinguished.",
    durationMin: 40,
    plan: "Intention: label a eukaryotic cell and say what each organelle is for, plant versus animal. Inputs: an onion-squash slide (or the class's own drawing), a blank two-column list. Activity: draw what the class actually sees, then build the model — one column the plant cell, one the animal, the wall/chloroplast/vacuole differences marked. Evidence: the two-column model with the three differences called out by name. Adjustment: groups drawing the \"animal cell with a wall\" re-examine the onion slide — the wall is the cell's house, the membrane the door.",
    status: "published"
  }),
  mk({
    id: "sen-l-b2",
    category: "lesson",
    title: "Osmosis — why the plant keeps its tone",
    subject: "Biology",
    gradeBand: "Form 2",
    kras: ["BIO.10.2.2"],
    competency: "Thinking & Problem Solving",
    misconception: "Water moves \"towards the salt\" — direction is read from the solute side, not the water-potential side, so the plasmolysis explanation inverts.",
    durationMin: 40,
    plan: "Intention: explain water movement by water potential and predict turgor and plasmolysis. Inputs: the two-beaker demo (potato in water, potato in strong salt solution), the diagram of the flaccid and turgid cell. Activity: students predict the potato's fate in each beaker from water potential alone, then cut in after 20 minutes to check. Evidence: both predictions with the potential argument, then the cut result matched. Adjustment: a group that predicts the salt-potato swells re-reads the direction rule — water moves to the lower potential, not to the stuff.",
    status: "published"
  }),
  mk({
    id: "sen-l-b3",
    category: "lesson",
    title: "The heart — double circulation as a pump problem",
    subject: "Biology",
    gradeBand: "Form 3",
    kras: ["BIO.11.3.1"],
    competency: "Thinking & Problem Solving",
    misconception: "The left and right sides beat in different rhythms — the septum is \"where the blood swaps\", not where the two loops stay separate.",
    durationMin: 40,
    plan: "Intention: trace one red-blood-cell round of the double circuit and say what each loop's job is. Inputs: the heart diagram with both loops drawn, a two-colour pen. Activity: each student traces one cell in red (pulmonary) and one in blue (systemic), labelling the valves they pass; the class pools the two routes on the board. Evidence: the board trace with every valve named in order. Adjustment: a trace that runs the loops side-by-side \"at the same time\" re-runs one cell at a time — the heart is two pumps sharing a wall, not a four-door room.",
    status: "published"
  }),
  mk({
    id: "sen-l-b4",
    category: "lesson",
    title: "Inheritance — the monohybrid cross to the F2",
    subject: "Biology",
    gradeBand: "Form 4",
    kras: ["BIO.12.1.1"],
    competency: "Thinking & Problem Solving",
    misconception: "The dominant trait \"wins\" — dominance in the F1 is read as the dominant allele being more numerous, not as masking.",
    durationMin: 40,
    plan: "Intention: do a monohybrid cross from two heterozygotes, predict the F2 ratio, and test a parent with the test cross. Inputs: the worked cross (Tt × Tt), the Punnett grid, the test-cross question. Activity: students fill the grid, read the 3:1, then answer \"which parent would you cross with a tt to expose the genotype\" — the test cross is the hinge. Evidence: the grid with the genotypes not just the phenotypes, and the test-cross argument. Adjustment: a grid that writes Tt four times re-labels each box from the two gamete rows — the box is a meeting of one gamete from each parent.",
    status: "published"
  })
];