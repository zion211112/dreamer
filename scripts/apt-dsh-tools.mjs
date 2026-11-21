#!/usr/bin/env node
/**
 * apt-dsh-tools — drive the installed DSH design-intelligence plugins from the
 * Claude Code / npm side of the workspace.
 *
 * The DSH plugins (dsh-ui-ux-pro-max, dsh-design, dsh-commercial-ui-ux,
 * dsh-context-governor) are plain ESM/CJS Node modules with their full data
 * payload on disk. They normally load inside the DeepSeek Harness loader; this
 * driver imports them directly so the same intelligence is available from the
 * build pipeline and from any agent session.
 *
 * Usage:
 *   node scripts/apt-dsh-tools.mjs recommend "<query>" [--stack vue] [--variance 7] [--motion 4] [--density 8] [--project name]
 *   node scripts/apt-dsh-tools.mjs review "<target>" [--platform web] [--max 10]
 *   node scripts/apt-dsh-tools.mjs search "<query>" [--domain style|color|chart|landing|product|ux|typography|icons|gsap|react|web|google-fonts] [--stack vue] [--max 5]
 *   node scripts/apt-dsh-tools.mjs list
 */
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)

const DSH_MODULES = join(
  homedir(),
  '.dsh',
  'profiles',
  'desktop',
  'node_modules',
)

function loadPlugin(name) {
  return require(join(DSH_MODULES, name))
}

const argv = process.argv.slice(2)
const cmd = argv[0]

function flag(name, fallback) {
  const i = argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const v = argv[i + 1]
  return v === undefined || v.startsWith('--') ? true : v
}

function positional(from = 1) {
  return argv[from]
}

function pick(specs) {
  // toolSpecs is an array-like map; index order is stable but prefer by name.
  const byName = specs.toolSpecs || specs
  if (byName && byName.design_recommend) return byName
  const arr = Array.isArray(byName) ? byName : Object.values(byName)
  const found = {}
  for (const s of arr) if (s && s.name) found[s.name] = s
  return found
}

async function main() {
  if (cmd === 'list') {
    const { toolNames, toolSpecs } = loadPlugin('dsh-ui-ux-pro-max/lib/tools/index.js')
    console.log('dsh-ui-ux-pro-max tools:', Object.keys(toolNames).join(', '))
    for (const [n, s] of Object.entries(toolSpecs)) {
      console.log(`\n${n}\n  ${s.description}`)
    }
    return
  }

  if (cmd === 'recommend' || cmd === 'review' || cmd === 'search') {
    const { toolSpecs } = loadPlugin('dsh-ui-ux-pro-max/lib/tools/index.js')
    const specs = pick(toolSpecs)
    const name = { recommend: 'design_recommend', review: 'design_review', search: 'design_search' }[cmd]
    const spec = specs[name]
    if (!spec) {
      console.error(`unknown tool ${name}; have: ${Object.keys(specs).join(', ')}`)
      process.exit(2)
    }
    const params = { query: positional() || '' }
    if (cmd === 'recommend') {
      params.projectName = flag('project', 'APT-LABS')
      params.stack = flag('stack', 'vue')
      params.variance = Number(flag('variance', 6))
      params.motion = Number(flag('motion', 4))
      params.density = Number(flag('density', 7))
    }
    if (cmd === 'review') {
      params.target = positional() || ''
      params.platform = flag('platform', 'web')
      params.maxRules = Number(flag('max', 10))
    }
    if (cmd === 'search') {
      params.domain = flag('domain', null)
      params.stack = flag('stack', null)
      params.maxResults = Number(flag('max', 5))
    }
    const result = await spec.execute(params)
    console.log(JSON.stringify(result, null, 2))
    return
  }

  console.error('unknown command. use: list | recommend | review | search')
  process.exit(2)
}

main().catch((e) => {
  console.error('FAILED:', e && e.stack ? e.stack : e)
  process.exit(1)
})
