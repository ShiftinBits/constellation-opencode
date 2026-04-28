# constellation-opencode

**Role**: OpenCode plugin for Constellation code intelligence platform.
**See**: `../AGENTS.md` for workspace architecture.

**Skill**: When working on this project, ALWAYS use the `opencode-plugin` skill (`opencode-plugin-development`). It provides comprehensive OpenCode plugin API documentation, patterns, and examples. Invoke it before making any changes to skills, agents, hooks, or `opencode.json`.

## Quick Reference

| Task | Location |
|------|----------|
| Build | `npm run build` (tsc) |
| Type check | `npm run type-check` |
| Add skill | `skills/<name>/SKILL.md` |
| Add agent | `opencode.json` `"agent"` + `agents/<name>.md` |
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
    └── constellation.ts       Main plugin — 4 hooks: system transform, compaction, tool-result injection, config
agents/                        3 agent system prompts (no YAML frontmatter)
├── source-scout.md            Codebase exploration
├── impact-investigator.md     Change risk assessment
└── dependency-detective.md    Dependency health
skills/                        7 on-demand skills loaded via the `skill` tool
├── constellation-status/SKILL.md          API connectivity check
├── constellation-diagnose/SKILL.md        Full health check
├── constellation-impact/SKILL.md          Symbol change impact analysis
├── constellation-deps/SKILL.md            File dependency analysis
├── constellation-unused/SKILL.md          Dead code finder
├── constellation-architecture/SKILL.md    Codebase architecture overview
└── constellation-troubleshooting/         Error diagnosis + reference
    ├── SKILL.md                           Troubleshooting guide + error code tables
    └── references/error-codes.md          Complete error code reference
```

## Hooks

`src/plugins/constellation.ts` — `ConstellationPlugin` function implements 4 hooks:

| Hook | Purpose |
|------|---------|
| `experimental.chat.system.transform` | Inject code_intel primer + tool preference + Code Intelligence guidance |
| `experimental.session.compacting` | Preserve Constellation insights during compaction |
| `tool.execute.after` | Append a code_intel reminder to `grep` / `glob` tool results (LLM-visible) |
| `config` | Register Constellation MCP server programmatically |

The system transform applies to all sessions including subagents. The `tool.execute.after` hook mutates the tool-result object so the LLM sees the reminder on its next turn — it does **not** write to the user's terminal. Do not reintroduce `console.log` in hooks: plugin stdout is shared with the user's OpenCode session. Use `client.app.log({ body: { service, level, message } })` for diagnostics.

Types: `Plugin` from `@opencode-ai/plugin`, `Config` from `@opencode-ai/sdk`.

## Hook Spec Reference

Authoritative source: the `Hooks` interface in `node_modules/@opencode-ai/plugin/dist/index.d.ts`. Runtime semantics verified against OpenCode source at `sst/opencode@dev` (`packages/opencode/src/session/prompt.ts`).

### `tool.execute.before`

```ts
(input: { tool: string; sessionID: string; callID: string },
 output: { args: any }) => Promise<void>
```

- **Mutable fields**: `output.args` — the tool's input arguments, forwarded to the tool's `execute()`.
- **Fires at**: `prompt.ts:417` (built-ins) / `prompt.ts:458` (MCP tools), before permission prompts and before the tool runs.
- **Use for**: rewriting arguments (e.g., sanitizing a `bash` command), or throwing to abort the call.
- **Cannot**: inject LLM-visible context. `args` goes to the tool, not the LLM message stream. For context injection, use `tool.execute.after`.

### `tool.execute.after`

```ts
(input: { tool: string; sessionID: string; callID: string },
 output: { title: string; output: string; metadata: any }) => Promise<void>
```

- **Mutable fields**: `output.title`, `output.output`, `output.metadata` — mutations propagate by reference.
- **Fires at**: `prompt.ts:431` (built-ins) / `prompt.ts:466` (MCP tools), after the tool's `execute()` returns, before the runtime reads fields back for the AI SDK return value and session state.
- **Propagation proof** (built-in tools, `prompt.ts:422-440`):
  ```ts
  const output = { ...result, attachments: ... }
  yield* plugin.trigger("tool.execute.after", {...}, output)   // passed by reference
  return output                                                 // mutated object returned to AI SDK
  ```
  `plugin.trigger` awaits each hook on the same `output` object and returns it; the caller then returns it to Vercel AI SDK and writes `output.output` into the session state (`processor.ts:118-137`).
- **Built-in tools** (`grep`, `glob`, `read`, `bash`, etc.): tool-result shape is `{ title, output, metadata }`. Mutating `output.output` (a string) changes what the LLM sees on its next turn.
- **MCP tools**: tool-result shape is `{ content: ContentItem[] }`, NOT `{ output: string }`. The runtime builds the LLM-visible text from `result.content[*].text` (`prompt.ts:472-487`). Appending to `output.output` has **no effect** for MCP-sourced tools. If you ever extend the Constellation plugin to touch MCP tools in this hook, mutate `output.content` instead.
- **Use for**: appending guidance/context to tool results (our code_intel reminder), rewriting titles for UI, augmenting metadata.

### `experimental.chat.system.transform`

```ts
(input: { sessionID?: string; model: Model },
 output: { system: string[] }) => Promise<void>
```

- Push strings onto `output.system` to append them to the system prompt. Applies to all sessions including subagents.

### `experimental.session.compacting`

```ts
(input: { sessionID: string },
 output: { context: string[]; prompt?: string }) => Promise<void>
```

- Push strings onto `output.context` to inject preservation instructions. Setting `output.prompt` replaces the default compaction prompt entirely and ignores `context`.

### `config`

```ts
(input: Config) => Promise<void>
```

- Mutate `input.mcp[serverName]` to register MCP servers programmatically. Our plugin registers `constellation` here in addition to the declarative `opencode.json` entry (see Gotchas).

## Development

### Adding a Skill

1. Create `skills/<name>/SKILL.md` with YAML frontmatter — required fields: `name` (must match the directory, lowercase alphanumeric + hyphens, regex `^[a-z0-9]+(-[a-z0-9]+)*$`), `description` (1–1024 chars; phrase it so the agent's `skill` tool can match it to a user request — this is the *only* trigger).
2. Body is plain markdown. Include the exact `constellation_code_intel` `code` payload the agent should run, plus a "Present" / "On error" section describing how to format the output.
3. No `$1` / `$ARGUMENTS` syntax — skills receive no arguments. If the procedure needs inputs, list them under an "Inputs" section and instruct the agent to ask the user when missing.
4. Optional supplementary docs go in `skills/<name>/references/` and are loaded explicitly by the skill body.

OpenCode loads skills from `skills/`, `.opencode/skills/`, `~/.config/opencode/skills/`, `.claude/skills/`, and `.agents/skills/`. The `skills/` layout in this plugin ships via the `files` array in `package.json`.

### Adding an Agent

1. Add config to `opencode.json` `"agent"` key — requires: `description`, `mode: "subagent"`, `tools` (object), `prompt` (file path)
2. Create `agents/<name>.md` — pure markdown, no YAML frontmatter

### Testing

No automated tests. Validate manually in OpenCode by phrasing requests that match each skill's `description`:

```
"Check Constellation status"               → constellation-status
"Run a full Constellation health check"    → constellation-diagnose
"What's the impact of renaming X?"         → constellation-impact
"Show dependencies for src/foo.ts"         → constellation-deps
"Find dead code / unused exports"          → constellation-unused
"Give me a codebase architecture overview" → constellation-architecture
"Constellation says AUTH_ERROR, fix it"    → constellation-troubleshooting

@source-scout What does this codebase do?
@impact-investigator I'm renaming UserService
@dependency-detective Check for circular imports
```

## Gotchas

- **MCP server registered twice**: `opencode.json` `"mcp"` section AND the `config` hook both register the constellation MCP server. The `config` hook is the programmatic path; `opencode.json` is the declarative fallback. Both exist intentionally for compatibility.
- **No `zod` dependency**: This plugin has no runtime dependencies — only dev dependencies for types.
- **Build before testing**: Changes to `src/` require `npm run build` before they take effect in OpenCode.
