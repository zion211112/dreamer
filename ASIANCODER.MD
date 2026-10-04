You are building the APT-LABS Agent Wrapper: a state-of-the-art environment for creating, running, inspecting, attacking, evaluating, and refining AI agents and AI-generated websites/software.

Do not build another generic agent builder.

Build an epistemic control plane.

The central design problem is:

LLMs are extremely good at producing fluent, plausible, coherent output while being unreliable at category boundaries, evidence tracking, uncertainty calibration, causal reasoning, adversarial robustness, novelty, and knowing when they should defer to a human.

The wrapper must therefore make epistemic failure structurally visible and structurally expensive.

The system should feel like something between:
- an elite research workstation
- an agent IDE
- a graphical compiler/debugger
- a scientific instrument
- a sovereign control plane
- an infinite canvas
- a high-end 2060 operating interface

Do NOT make it feel like:
- ChatGPT with boxes
- a CRUD dashboard
- a LangChain demo
- a generic n8n clone
- a neon cyberpunk toy
- a prompt library

==================================================
APT-LABS PRODUCT THESIS
==================================================

APT-LABS is a framework for building systems in which human creativity remains sovereign while machine reasoning becomes inspectable, adversarially tested, traceable, and replaceable.

The LLM is NOT the authority.

The LLM is one computational component inside a typed epistemic system.

Primary design principle:

    fluency != truth
    confidence != evidence
    coherence != causality
    citation != verification
    novelty != creativity
    consensus != correctness

The wrapper exists to make these distinctions operational.

==================================================
CORE OBJECT MODEL
==================================================

Everything in the system should be represented as typed objects.

At minimum:

Observation
Evidence
Source
Claim
Inference
Hypothesis
Assumption
Mechanism
Causal Model
Counterexample
Alternative
Decision
Value Judgment
Instruction
Artifact
Agent
Tool
Human Review
Evaluation
Experiment
Trace
Memory
Dataset
Policy
Constraint

Every object has a type.

Never silently convert one type into another.

For example:

Observation:
"Solar output fell 18%."

Inference:
"Panel degradation may explain the decline."

Hypothesis:
"The primary cause is dust accumulation."

Value judgment:
"Reliability should take priority over minimum cost."

Decision:
"Schedule maintenance this week."

The UI must visually distinguish these.

This is the first major anti-category-error mechanism.

==================================================
EPISTEMIC FIREWALL
==================================================

Build a first-class epistemic firewall.

Every generated statement should be classifiable into:

FACT
OBSERVATION
SOURCE CLAIM
INFERENCE
HYPOTHESIS
PREDICTION
ASSUMPTION
NORMATIVE JUDGMENT
DESIGN CHOICE
SPECULATION
UNKNOWN

Never allow the model to collapse:

"we observed X"

into:

"therefore Y is true."

The interface must expose category transitions.

Create a visible semantic chain:

OBSERVED
   ↓
INTERPRETED
   ↓
INFERRED
   ↓
HYPOTHESIZED
   ↓
TESTED
   ↓
ACCEPTED / REJECTED / UNKNOWN

Users should be able to click any transition and inspect why it happened.

==================================================
EVIDENCE LEDGER
==================================================

Every consequential claim gets an evidence ledger.

Each claim should display:

claim
claim type
source
source quality
timestamp
direct / indirect evidence
independent corroboration
contradicting evidence
known unknowns
confidence
confidence basis
last verified
verification status

Do not let "high confidence" exist without a visible reason.

Confidence is not a free text property.

Derive it from explicit factors where possible.

Example:

CONFIDENCE
0.82

because:

+ direct primary source
+ independent corroboration
+ recent evidence
- contradictory secondary source
- incomplete sample

This must remain inspectable.

==================================================
FLUENCY COUNTER
==================================================

Build a prominent "FLUENCY / EPISTEMIC GAP" instrument.

The system should detect when language quality is rising faster than epistemic support.

Example:

Fluency:        94
Evidence:       61
Calibration:    57
Novelty:        83
Robustness:     72

Then show:

⚠ FLUENCY > EVIDENCE

This is not a quality score.

It is a danger signal.

Create additional signals:

unsupported specificity
citation inflation
category drift
premature convergence
false consensus
causal overreach
scope creep
assumption leakage
unknown suppression
analogy substitution
confidence inflation
median-answer collapse

These are system diagnostics.

==================================================
ANTI-MEDIAN ENGINE
==================================================

A normal LLM naturally converges toward statistically common answers.

Prevent that.

For difficult creative/design/research tasks, generate multiple genuinely different hypotheses BEFORE synthesis.

Not:

A1
A1.1
A1.2

Instead:

BRANCH A — conservative
BRANCH B — inversion
BRANCH C — radical mechanism change
BRANCH D — outsider model
BRANCH E — constraint-breaking design

Each branch must expose:

core thesis
assumptions
mechanism
failure mode
novel contribution
why it differs from the others

Then compare the branches.

The system should penalize branches that are merely lexical variations of each other.

Add:

DIVERSITY SCORE
CONCEPTUAL DISTANCE
MECHANISM DISTANCE
ASSUMPTION DISTANCE

This is the creativity preservation mechanism.

==================================================
HUMAN CREATIVITY GATE
==================================================

Do NOT allow the model to automatically optimize away weird ideas.

Human creativity must be a first-class state.

Allow the human to mark an idea:

KEEP
KILL
INCUBATE
COMBINE
DISTORT
PROTECT FROM OPTIMIZATION

"PROTECT FROM OPTIMIZATION" is important.

The model may critique an idea but must not automatically converge it toward the median.

Create a visual distinction:

MODEL-GENERATED
HUMAN-GENERATED
HUMAN-MODIFIED
JOINT
UNRESOLVED

Never erase provenance.

==================================================
ADVERSARIAL LOOP
==================================================

Implement this exact high-level loop:

INTUIT
BOOTSTRAP
ATTACK
REPLACE
STEELMAN
INTEGRATE
CONVERGE

But do NOT expose internal chain-of-thought.

The system should capture structured artifacts from the stages, not hidden reasoning.

For example:

INTUIT:
one-sentence first-principles hypothesis

BOOTSTRAP:
minimal viable answer

ATTACK:
specific vulnerabilities

REPLACE:
revised answer

STEELMAN:
strongest objection

INTEGRATE:
synthesis

CONVERGE:
material-change test

The UI should show these as versioned artifacts.

==================================================
HOSTILE REVIEW
==================================================

Create adversarial reviewers with different failure models.

Reviewer types:

DOMAIN EXPERT
STATISTICIAN
SYSTEMS ENGINEER
RED TEAM
SKEPTIC
OUTSIDER
USER ADVOCATE
SECURITY REVIEWER
CAUSAL INFERENCE REVIEWER
EPISTEMIC AUDITOR

Each reviewer sees the current artifact and attempts to break it.

The system should explicitly show:

ATTACK
TARGET
SEVERITY
COUNTEREVIDENCE
REQUIRED CHANGE
STATUS

Never ask:

"Does this answer look good?"

Ask:

"What would make this answer fail?"

==================================================
COUNTEREXAMPLE ENGINE
==================================================

For every strong assertion, attempt to find:

counterexample
boundary condition
failure regime
confounder
alternative mechanism
selection effect
measurement problem
distribution shift

A claim survives only if it survives attempted falsification.

Do not pretend this proves truth.

The correct state is:

SUPPORTED
WEAKLY SUPPORTED
CONTESTED
UNTESTED
REFUTED
UNKNOWN

"UNKNOWN" is a valid terminal state.

==================================================
EPISTEMIC DIFFERENTIAL
==================================================

Add a comparison view between:

WHAT THE MODEL SAID
WHAT THE EVIDENCE SUPPORTS
WHAT THE SYSTEM CAN ACTUALLY VERIFY
WHAT REMAINS UNKNOWN

This should be one of the most important screens.

Example:

MODEL:
"Demand increased because of migration."

EVIDENCE:
"Population increased."

VERIFIED:
"Population increase occurred."

UNKNOWN:
"Causal contribution of migration."

This prevents narrative completion from being mistaken for knowledge.

==================================================
TRACE SYSTEM
==================================================

Every run produces a trace.

Trace:

task
context
model
temperature / generation settings
tools
retrieval
sources
claims
category transitions
agent calls
human interventions
critic attacks
revisions
evaluations
final artifact

Make the trace replayable.

Think debugger, not chat transcript.

Allow:

replay
fork
compare
diff
rollback
pin
branch
annotate
export

The user should be able to fork an old run and ask:

"Change only assumption #4."

==================================================
AGENT GRAPH
==================================================

Use a graph/canvas as the primary orchestration interface.

But the graph must represent semantics, not just function calls.

Nodes:

SOURCE
RETRIEVER
INTERPRETER
CLASSIFIER
REASONER
CRITIC
SIMULATOR
DOMAIN AGENT
MEMORY
EVALUATOR
HUMAN REVIEW
DECISION
OUTPUT

Edges have typed semantics:

DATA
EVIDENCE
CONTROL
CONTEXT
UNCERTAINTY
REVIEW
OVERRIDE
CONTRADICTION

Do not use generic arrows for everything.

==================================================
NODE DESIGN
==================================================

Each node should have:

name
role
input types
output types
model
tools
memory
evidence policy
confidence policy
failure policy
latency
cost
recent errors
evaluation score

Compact default state.

Deep inspector on selection.

No bloated cards.

==================================================
THE CANVAS
==================================================

The canvas should feel like:

tldraw
+
high-end network graph
+
IDE
+
scientific instrument

Reference tldraw for infinite-canvas interaction, custom shapes, bindings, runtime control and workflow-builder patterns.

GitHub:
https://github.com/tldraw/tldraw

Do NOT clone its aesthetic.
Use its interaction philosophy.

The central canvas should support:

pan
zoom
minimap
snap
semantic zoom
selection
multi-select
branching
grouping
edge inspection
timeline playback
trace overlays
evidence overlays

==================================================
REFERENCE ARCHITECTURE
==================================================

Study and borrow architectural ideas — never blindly copy product UI — from:

tldraw
https://github.com/tldraw/tldraw

OpenAI Agents SDK
https://github.com/openai/openai-agents-python

LangGraph
https://github.com/langchain-ai/langgraph

Langfuse
https://github.com/langfuse/langfuse

Phoenix
https://github.com/Arize-ai/phoenix

DeepEval
https://github.com/confident-ai/deepeval

Inspect AI
https://github.com/UKGovernmentBEIS/inspect_ai

Vercel AI SDK
https://github.com/vercel/ai

Trigger.dev
https://github.com/triggerdotdev/trigger.dev

Study:

- tldraw for spatial interaction and workflow canvas
- OpenAI Agents tracing for run/span semantics
- LangGraph for stateful orchestration
- Langfuse for traces, datasets, scoring and experiments
- Phoenix for observability and evaluation
- Inspect AI for serious evaluation methodology
- DeepEval for application-level evaluation
- Vercel AI SDK for provider abstraction and streaming
- Trigger.dev for durable execution and human-in-the-loop workflows

Current references checked:
tldraw provides an extensible infinite canvas with custom shapes/tools/bindings and workflow/agent starter kits. :contentReference[oaicite:0]{index=0}
OpenAI Agents SDK provides trace/span semantics covering model generations, tool calls, handoffs and guardrails. :contentReference[oaicite:1]{index=1}
Langfuse supports traces, evaluations, datasets and experiments. :contentReference[oaicite:2]{index=2}
Phoenix combines tracing, evaluation, datasets and experimentation. :contentReference[oaicite:3]{index=3}
Inspect AI provides a framework for LLM evaluations, including multi-turn, tool-use and model-graded evaluation. :contentReference[oaicite:4]{index=4}
DeepEval provides an LLM evaluation framework with tracing, red-teaming and guardrail-oriented evaluation capabilities. :contentReference[oaicite:5]{index=5}
Vercel AI SDK provides provider-agnostic TypeScript infrastructure for AI applications and agents. :contentReference[oaicite:6]{index=6}
Trigger.dev provides durable AI workflows, retries, queues, observability and human-in-the-loop pauses. :contentReference[oaicite:7]{index=7}

==================================================
UX SYSTEM
==================================================

The product should have approximately five primary surfaces:

01 FIELD
Reality entering the system.

02 REGISTER
Evidence, claims, sources, provenance, records.

03 INTELLIGENCE
Agent graph, reasoning artifacts, hypotheses and alternatives.

04 CONTROL
Policies, execution, evaluations, adversarial review, human overrides.

05 OUTPUT
The synthesized result and its epistemic status.

Avoid 14 tiny nav items.

Information architecture should feel inevitable.

==================================================
PRIMARY LAYOUT
==================================================

Desktop-first.

Three-zone application shell:

LEFT:
navigation + project state

CENTER:
canvas / artifact / experiment

RIGHT:
contextual inspector

BOTTOM:
trace / run / evidence / evaluation strip

Top bar:

project
environment
model
run state
human ownership
system health

Use progressive disclosure aggressively.

==================================================
VISUAL LANGUAGE
==================================================

APT-LABS aesthetic:

near-black graphite
extremely subtle grid
off-white typography
teal = verified / live
cyan = evidence / data
violet = intelligence / hypothesis
amber = uncertainty / pending
red = contradiction / failure

Thin borders.

Small radii.

No excessive blur.

No giant gradients.

No gratuitous glassmorphism.

No stock AI sparkle icons.

Typography should feel closer to:

scientific instrument
terminal
financial market system
industrial control panel

than consumer SaaS.

Use visual density intelligently.

Negative space is part of the information architecture.

==================================================
MICROINTERACTIONS
==================================================

State changes should be legible.

Examples:

source arrives:
→ subtle pulse

claim becomes contested:
→ amber edge

reviewer finds contradiction:
→ edge turns red

human approves:
→ white/teal confirmation

unknown remains unknown:
→ deliberately quiet neutral state

Never use animations merely for decoration.

==================================================
IMPORTANT: CATEGORY GUARD
==================================================

Implement a visible "Category Guard".

When the model generates:

"X caused Y"

and available evidence supports only:

"X correlated with Y"

the UI must flag:

CAUSALITY OVERREACH

When the model says:

"Experts agree..."

without actual evidence:

CONSENSUS CLAIM UNSUPPORTED

When a source says something but the application renders it as fact:

SOURCE CLAIM → FACT COLLAPSE

When an assumption quietly enters a conclusion:

ASSUMPTION LEAKAGE

When multiple agents repeat the same unsupported claim:

CONSENSUS AMPLIFICATION

When polished prose exceeds evidence:

FLUENCY / EVIDENCE GAP

These are first-class system events.

==================================================
EPISTEMIC HEALTH SCORE
==================================================

Do NOT create a simplistic overall "AI quality score."

Instead provide a radar / vector:

Evidence
Calibration
Category integrity
Causal integrity
Adversarial robustness
Novelty
Diversity
Traceability
Human ownership

Scores must have drill-down evidence.

Never produce:

"Quality: 92%"

without explaining what that number means.

==================================================
HUMAN CONTROL
==================================================

The human is the final authority over:

values
creative direction
irreversible decisions
deployment
external communication
high-impact claims

The system must allow:

approve
reject
rewrite
branch
freeze
protect
request evidence
request adversarial review
mark unknown

Human actions become part of the trace.

==================================================
MEMORY
==================================================

Memory should NOT simply mean "conversation history."

Separate:

FACT MEMORY
TASK MEMORY
PREFERENCE MEMORY
HYPOTHESIS MEMORY
FAILED IDEAS
OPEN QUESTIONS
VERIFIED KNOWLEDGE
UNRESOLVED CONTRADICTIONS

Every memory item has provenance and decay/revalidation rules.

A stale fact should be visually stale.

==================================================
MODEL ROUTING
==================================================

Treat models as interchangeable components.

A task can route to:

fast model
deep reasoning model
vision model
coding model
critic model
judge model
local model
specialist model

The routing layer should optimize for:

task type
latency
cost
risk
required reasoning depth
privacy
tool requirements

Do not bind system architecture to one provider.

==================================================
EXPERIMENT MODE
==================================================

Make prompt/model/agent experiments first-class.

User can select:

Run A
Run B
Run C
Human baseline

Then compare:

claim coverage
unsupported claims
contradictions
novelty
category errors
evidence completeness
latency
cost
human edits

Show diffs, not just scores.

==================================================
DATA MODEL
==================================================

Define explicit TypeScript schemas.

At minimum:

Evidence
Claim
Source
Assertion
Inference
Hypothesis
Alternative
Evaluation
Attack
Trace
Agent
Node
Edge
HumanDecision
MemoryItem
Experiment
Artifact

Use discriminated unions.

Do not use "any" for epistemic objects.

==================================================
TECHNICAL ARCHITECTURE
==================================================

Prefer:

React
TypeScript
Vite or Next.js
Tailwind or equivalent utility styling
tldraw or an equally capable canvas engine
Zustand or equivalent state layer
Zod for runtime validation
OpenTelemetry-compatible tracing
provider abstraction
Postgres for durable state
object storage for artifacts

Use a pluggable adapter architecture for:

models
retrieval
vector search
observability
evaluators
tools
authentication
storage

No vendor lock-in in the core domain model.

==================================================
SECURITY
==================================================

Treat model output as untrusted input.

Guard:

prompt injection
tool injection
data exfiltration
unsafe tool calls
cross-agent contamination
memory poisoning
citation spoofing
source spoofing
privilege escalation

Tool calls should have explicit capability boundaries.

A model should never silently gain a capability because a prompt asks for it.

==================================================
NO HIDDEN AUTHORITY
==================================================

The system must make it impossible for an agent to silently:

change system policy
rewrite evidence
alter provenance
delete contradictions
modify human decisions
promote hypotheses to facts
declare itself correct

Those require explicit controlled transitions.

==================================================
KEYBOARD-FIRST UX
==================================================

Everything important should have a keyboard path.

Examples:

⌘K
command palette

⌘Enter
run

⌘Shift+R
red-team

⌘Shift+E
evidence

⌘Shift+T
trace

⌘Shift+H
human review

⌘B
branch

⌘D
diff

⌘U
unknown

Esc
exit current inspection

==================================================
COMMAND PALETTE
==================================================

Commands:

Run
Run attack
Find evidence
Open trace
Branch artifact
Compare runs
Request human review
Mark unknown
Challenge claim
Generate alternatives
Freeze artifact
Export trace
Replay run

==================================================
IMPORTANT DESIGN PRINCIPLE
==================================================

Do not put the chatbot at the center.

Put the WORK PRODUCT at the center.

The conversation is a control surface.

The artifact is the object.

The evidence is the substrate.

The trace is the memory.

The human is the authority.

The model is the engine.

==================================================
QUALITY BAR
==================================================

Target 9.9/10.

Before considering the work complete, attack the implementation against:

1. Does it accidentally become another chatbot?
2. Can a fluent unsupported claim pass through unnoticed?
3. Can observation/inference/value judgment blur together?
4. Can agents converge on the same mediocre idea?
5. Can human creativity be destroyed by automated optimization?
6. Can evidence be inspected at the moment of judgment?
7. Can a user reconstruct why the system reached a conclusion?
8. Can a previous run be forked and compared?
9. Can the system express genuine UNKNOWN?
10. Can an adversarial reviewer materially change the result?
11. Are confidence scores grounded?
12. Can provenance survive every transformation?
13. Can memory become contaminated?
14. Can tools execute beyond their intended authority?
15. Does the UI remain understandable when the graph becomes large?
16. Is there a clean human override?
17. Does the system expose category failures instead of hiding them?
18. Does the product feel like an instrument rather than a chatbot?
19. Does it preserve weird/high-potential ideas rather than optimizing them away?
20. Does it remain useful when the model is wrong?

==================================================
BUILD ORDER
==================================================

Do not try to implement everything simultaneously.

Phase 1:
Build the visual shell and core data model.

Phase 2:
Build the epistemic objects and category guard.

Phase 3:
Build the canvas and agent graph.

Phase 4:
Build evidence ledger + trace viewer.

Phase 5:
Build adversarial review + experiments.

Phase 6:
Build human creativity controls.

Phase 7:
Connect real model providers and tools.

Phase 8:
Build evaluation suite.

After each phase:
run the application,
inspect the UI,
test real interactions,
fix failures,
then continue.

==================================================
CRITICAL KILO INSTRUCTION
==================================================

Do not merely create the interface described above.

First inspect the existing repository and determine what already exists.

Preserve useful existing work.

Then create an implementation plan.

Then implement incrementally.

Do not fabricate APIs.

Do not invent library capabilities without checking their current documentation.

Use current package APIs.

Prefer stable primitives over clever abstractions.

Keep the domain model independent from UI components.

Every major interaction must have a real state transition behind it.

Do not fake system behavior with static UI unless explicitly marked as simulation.

For anything represented as verified, traceable, evaluated, persisted, or executed, implement the underlying state and make the UI derive from it.

Finally, perform a hostile self-review of the implementation against the 20-item quality bar above and fix the highest-severity failures before stopping.

The goal is not:

"an impressive AI dashboard."

The goal is:

"the best interface yet built for keeping human judgment, machine reasoning, evidence, uncertainty, and creativity distinct without making the system cumbersome."

Build that.