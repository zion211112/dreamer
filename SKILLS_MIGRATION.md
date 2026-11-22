# Skills Migration — APT-LABS Angular/Nx pre-staging

angular-migration installed by non-interactive file copy into .agents/skills/. The other three were not installed (see Status). No changes to src/, apt-labs/, MIGRATION.md, or package.json. Nothing committed.

| Skill | Exists? | Source / install command | Status |
|---|---|---|---|
| angular-migration | VERIFIED | File copy from https://github.com/sickn33/agentic-awesome-skills/blob/main/plugins/agentic-awesome-skills-claude/skills/angular-migration/SKILL.md → `.agents/skills/angular-migration/SKILL.md` (no install/build script shipped) | INSTALLED |
| codemod-executor | UNVERIFIED | — (no repo found under that name) | NOT-INSTALLED (unverified; no source) |
| angular-architecture | UNSURE | `npx skills add https://github.com/angular/skills` (official) or `npx skills add jeffallan/claude-skills` (angular-architect) | NOT-INSTALLED (unconfirmed; not substituted) |
| uncodixfy | UNVERIFIED | — (no repo found under that name) | NOT-INSTALLED (unverified; no source) |

Summary: Only angular-migration is real and installable now — confirmed at sickn33/agentic-awesome-skills (`plugins/agentic-awesome-skills-claude/skills/angular-migration`) and installed by non-interactive file copy into `.agents/skills/angular-migration/`. codemod-executor and uncodixfy have no evidence under those exact names. angular-architecture has no exact match; closest live options are official angular/skills and jeffallan/claude-skills angular-architect, both needing confirmation before install.
