# Agent Skills Arsenal Migration

## Goal

Make four requested tools directly available to project agents as local Agent
Skills, while removing the temporary `.arsenal` source checkout after migration.

## Scope

Install the skill components for:

- Caveman (`JuliusBrussee/caveman`)
- Ponytail (`DietrichGebert/ponytail`)
- Diagram Design (`cathrynlavery/diagram-design`)
- Impeccable (`pbakaus/impeccable`)

Place each skill in the repository's `.agents/skills/` directory, preserving
required references, scripts, and assets. Use the supported Agent Skills
distribution/install path where possible; do not install unrelated CLIs,
plugins, MCP servers, or application dependencies.

After confirming all four skills are present and readable, remove the
project-local `.arsenal` directory. Do not modify application source,
dependency manifests, or unrelated agent configuration.

## Compatibility and operation

These are project-scoped skills. Their instructions apply when an agent host
supports the Agent Skills convention and discovers `.agents/skills`. The
skills are independent; agents should invoke the relevant one per task rather
than loading all of them for every request. Better Design remains an existing
session MCP and is not part of this migration.

## Verification

Before removing `.arsenal`, verify each installed skill has its entry
`SKILL.md` and required bundled files. Then confirm `.arsenal` is absent and
the four skill directories remain. Run `npm run build` and
`npm run test:unit -- --run` to confirm the repository's required checks stay
green.
