# constellation-opencode

**Role**: OpenCode plugin that registers the Constellation MCP server and steers OpenCode toward `code_intel` for code search/navigation.

## Quick Reference

| Task | Command / Location |
|------|--------------------|
| Build | `npm run build` (tsc → `dist/`) |
| Type check | `npm run type-check` |
| Plugin entry | `src/plugins/constellation.ts` — `ConstellationPlugin` |
| Re-export | `src/index.ts` |
| Publish | GitHub Release → `.github/workflows/publish.yml` (auto-bumps version from tag) |

## Layout

```
src/
├── index.ts                   Re-exports ConstellationPlugin (default + named)
└── plugins/
    └── constellation.ts       Single plugin function — 3 hooks
package.json                   ESM, type: module, no runtime deps
tsconfig.json                  ES2022 / ESNext / bundler resolution / strict
.github/workflows/publish.yml  GH Release → npm publish with provenance
```

## Plugin Behavior

`ConstellationPlugin` (in `src/plugins/constellation.ts`) always registers the MCP server. It only adds the system-prompt and compaction hooks when `CONSTELLATION_ACCESS_KEY` starts with `ak:` — without a valid key, the plugin returns just the `config` hook so OpenCode still spawns the MCP server (which will surface its own auth error).

| Hook | Purpose |
|------|---------|
| `config` | Registers `constellation` MCP server: `npx -y @constellationdev/mcp@latest`, passes `CONSTELLATION_ACCESS_KEY` through `environment` |
| `experimental.chat.system.transform` | Appends a single line to the system prompt instructing the model to prefer `code_intel` over grep/glob/awk/rg |
| `experimental.session.compacting` | Pushes a context-preservation note so the `code_intel`-priority instruction survives compaction |

`input.$?.env({ CONSTELLATION_ACCESS_KEY })` is also called at plugin init to seed OpenCode's Bun environment for spawned MCP processes.

## Conventions

- **No runtime deps.** Only dev deps (`@opencode-ai/plugin`, `@types/node`, `typescript`). Do not introduce runtime deps without strong reason — this plugin is loaded into every OpenCode session.
- **No `console.log` in hooks.** Plugin stdout is shared with the user's OpenCode terminal. Use `client.app.log({ body: { service, level, message } })` if diagnostics are needed.
- **Types**: `Plugin`, `Hooks`, `PluginInput`, `PluginOptions` from `@opencode-ai/plugin`; `Config` from the same package. The Hooks interface in `node_modules/@opencode-ai/plugin/dist/index.d.ts` is authoritative.

## Gotchas

- **`tool.execute.after` is intentionally absent.** OpenCode currently does not propagate mutations to the LLM-visible message stream for built-in tools the way earlier versions did. Do not re-add this hook without verifying behavior against the installed `@opencode-ai/plugin` version and OpenCode runtime.
- **MCP server registration is programmatic only.** No `opencode.json` ships with this plugin. Users opt in via their own `opencode.json` `"plugin": ["@constellationdev/opencode"]` entry; the `config` hook then registers the MCP server.
- **Build before publish/test.** `dist/` is gitignored-but-publish-required. `prepublishOnly` runs `tsc`. Local OpenCode reload picks up `dist/` only after `npm run build`.
- **Stale `package.json` `files` entries.** `files` lists `agents/`, `skills/`, and `opencode.json`, none of which exist in this repo. They are no-ops at publish time but should be cleaned up when this plugin is next touched.
- **README.md is partially aspirational.** It describes skills/agents that this package no longer ships. Treat the source of truth as `src/plugins/constellation.ts`.

## Testing

No automated tests. Validate by:

1. `npm run build`
2. Point a local OpenCode install at this checkout (or `npm pack` + install the tarball).
3. Confirm `code_intel` appears in tool list and that the system prompt includes the preference line.
4. Trigger a long session to verify the compaction hook fires.
