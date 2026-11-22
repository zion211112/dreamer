/**
 * APT-LABS — Agent dock governance data (lean masterpiece).
 *
 * Each module's "Next moves" are not free chat prompts — they are governed
 * verbs. Every intent names the tool it will run and whether that tool is
 * inside the module agent's granted scope. Routine verbs clear the policy
 * gate and execute (filing a real receipt to Proof); consequential verbs are
 * outside scope, so the gate holds them for a higher authoriser — the
 * propose-never-executes doctrine, made visible.
 *
 * The scope + intents per module are co-located so the dock and the engine
 * share one source of truth: nothing here is invented per-view.
 */
import type { ModuleId } from './registry'

export interface ModuleIntent {
  /** The "Next moves" button text — a verb, not a question. */
  label: string
  /** The engine tool this intent governs. */
  tool: string
  /** One-line, honest rationale for the step. */
  rationale: string
  /** Consequential = outside the module agent's scope → held for sign-off. */
  consequential: boolean
}

export interface ModuleAgentSpec {
  /** Tools the module agent is granted (its in-scope verbs). */
  scope: string[]
  /** The concrete "Next moves" for this module. */
  intents: ModuleIntent[]
}

export const AGENT_SPECS: Record<ModuleId, ModuleAgentSpec> = {
  overview: {
    scope: ['chain:trace', 'model:inspect'],
    intents: [
      { label: 'Trace a distinction through the chain', tool: 'chain:trace', rationale: 'Walk the distinction from reality to the type, node by node.', consequential: false },
      { label: 'Show me what is disputed', tool: 'model:inspect', rationale: 'Surface the standing flags the record does not yet clear.', consequential: false },
      { label: 'Amend the ontology from here', tool: 'steward:amend-ontology', rationale: 'Mutates the type layer — held for a higher authoriser.', consequential: true },
    ],
  },
  'commons-network': {
    scope: ['inquiry:draft', 'inquiry:summarise', 'knowledge:read', 'network:map', 'capability:inspect', 'relation:query'],
    intents: [
      { label: 'Draft a brief for the top inquiry', tool: 'inquiry:draft', rationale: 'Turn the open question into a structured brief to examine.', consequential: false },
      { label: 'Summarise open inquiries by institution', tool: 'inquiry:summarise', rationale: 'Group live intentions by the institutions that raised them.', consequential: false },
      { label: 'Map who can do what in this cluster', tool: 'network:map', rationale: 'Resolve each actor to the capabilities it holds here.', consequential: false },
      { label: 'Which capability is unheld?', tool: 'capability:inspect', rationale: 'Find the capability no registered actor can supply.', consequential: false },
      { label: 'Conclude a disputed inquiry', tool: 'inquiry:conclude', rationale: 'Closes an intention with standing consequences.', consequential: true },
    ],
  },
  workbench: {
    scope: ['work:open', 'work:blockers', 'work:prepare-review'],
    intents: [
      { label: 'Open the next pilot to run', tool: 'work:open', rationale: 'Bring the next runnable proof-carrying unit to the front.', consequential: false },
      { label: 'What is blocked on this unit?', tool: 'work:blockers', rationale: 'Name the dependency that holds this unit up.', consequential: false },
      { label: 'Sign off this work unit', tool: 'work:sign-off', rationale: 'Closes the unit with standing consequences — held for a higher authoriser.', consequential: true },
    ],
  },
  'records-intelligence': {
    scope: ['canon:search', 'record:diff', 'record:provenance', 'intel:match', 'intel:forecast', 'agent:inspect'],
    intents: [
      { label: 'Search the canon', tool: 'canon:search', rationale: 'Query settled knowledge across the canon store.', consequential: false },
      { label: 'Diff this record against the roll', tool: 'record:diff', rationale: 'Compare the working record to the immutable roll entry.', consequential: false },
      { label: 'Run a match against this intent', tool: 'intel:match', rationale: 'Score the open items against the stated intent.', consequential: false },
      { label: 'Forecast this constraint', tool: 'intel:forecast', rationale: 'Project the constraint forward from current records.', consequential: false },
      { label: 'Write to the immutable roll', tool: 'roll:write', rationale: 'The roll is immutable — writes need steward sign-off.', consequential: true },
      { label: 'Hand this to Kemetos', tool: 'agent:dispatch', rationale: 'Dispatches a live agent — needs a coordinator sign-off.', consequential: true },
    ],
  },
  value: {
    scope: ['value:trace', 'value:reconcile'],
    intents: [
      { label: 'Trace this outcome’s allocation', tool: 'value:trace', rationale: 'Follow disclosed cost from the outcome to its allocation rule.', consequential: false },
      { label: 'Show who was paid and why', tool: 'value:reconcile', rationale: 'Reconcile the circulation against the open rule that set it.', consequential: false },
      { label: 'Settle a circulation', tool: 'value:settle', rationale: 'Closes a value flow — held for a higher authoriser.', consequential: true },
    ],
  },
}
