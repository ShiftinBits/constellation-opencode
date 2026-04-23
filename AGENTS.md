# constellation-opencode

**Role**: OpenCode plugin for Constellation code intelligence platform.
**See**: `../AGENTS.md` for workspace architecture.

**Skill**: When working on this project, ALWAYS use the `opencode-plugin` skill (`opencode-plugin-development`). It provides comprehensive OpenCode plugin API documentation, patterns, and examples. Invoke it before making any changes to commands, agents, hooks, or `opencode.json`.

## Quick Reference

| Task | Location |
|------|----------|
| Build | `npm run build` (tsc) |
| Type check | `npm run type-check` |
| Add command | `commands/<name>.md` |
| Add agent | `opencode.json` `"agent"` + `prompts/<name>.md` |
| Modify hooks | `src/plugins/constellation.ts` |
| MCP config | `opencode.json` `"mcp"` section (declarative) OR `config` hook (programmatic) |
| Error codes | `skills/constellation-troubleshooting/references/error-codes.md` |

## Plugin Structure

```
opencode.json                  MCP server config + agent definitions (with prompt refs)
package.json                   NPM package (AGPL-3.0, type: module)
tsconfig.json                  TypeScript (ES2022, ESNext modules, bundler resolution)
src/
├── index.ts                   Re-exports from plugins/constellation.ts
└── plugins/
    └── constellation.ts       Main plugin — 4 hooks: system transform, compaction, tool interception, config
commands/                      7 slash commands
├── status.md                  API connectivity check (model: haiku)
├── diagnose.md                Full health check (model: haiku)
├── impact.md                  Symbol change impact analysis
├── deps.md                    File dependency analysis
├── unused.md                  Dead code finder
├── architecture.md            Codebase architecture overview
└── troubleshoot.md            Error diagnosis (model: haiku)
prompts/                       3 agent system prompts (no YAML frontmatter)
├── source-scout.md            Codebase exploration
├── impact-investigator.md     Change risk assessment
└── dependency-detective.md    Dependency health
skills/constellation-troubleshooting/
├── SKILL.md                   Troubleshooting guide (diagnostic flowchart + fixes)
└── references/error-codes.md  Complete error code reference
```

## Hooks

`src/plugins/constellation.ts` — `ConstellationPlugin` function implements 4 hooks:

| Hook | Purpose |
|------|---------|
| `experimental.chat.system.transform` | Inject code_intel primer + tool preference + Code Intelligence guidance |
| `experimental.session.compacting` | Preserve Constellation insights during compaction |
| `tool.execute.before` | Log when grep/glob used for structural queries (debugging aid) |
| `config` | Register Constellation MCP server programmatically |

The system transform applies to all sessions including subagents. The `tool.execute.before` provides console-level observability.

Types: `Plugin` from `@opencode-ai/plugin`, `Config` from `@opencode-ai/sdk`.

## Development

### Adding a Command

1. Create `commands/<name>.md` with YAML frontmatter (`description`, optional `model`)
2. Reference `constellation_code_intel` tool name
3. Arguments via `$1`, `$2`, `$ARGUMENTS`

### Adding an Agent

1. Add config to `opencode.json` `"agent"` key — requires: `description`, `mode: "subagent"`, `tools` (object), `prompt` (file path)
2. Create `prompts/<name>.md` — pure markdown, no YAML frontmatter

### Testing

No automated tests. Validate manually in OpenCode:

```
/status                             # API connectivity
/diagnose                           # Full health check
/impact <symbol> [file]             # Change impact
/deps <file> [--reverse]            # Dependencies
/unused [kind]                      # Dead code
/architecture                       # Codebase overview
/troubleshoot <error-code>          # Error diagnosis

@source-scout What does this codebase do?
@impact-investigator I'm renaming UserService
@dependency-detective Check for circular imports
```

## Gotchas

- **MCP server registered twice**: `opencode.json` `"mcp"` section AND the `config` hook both register the constellation MCP server. The `config` hook is the programmatic path; `opencode.json` is the declarative fallback. Both exist intentionally for compatibility.
- **No `zod` dependency**: This plugin has no runtime dependencies — only dev dependencies for types.
- **Build before testing**: Changes to `src/` require `npm run build` before they take effect in OpenCode.
