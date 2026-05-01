import type {
  Config,
  Hooks,
  Plugin,
  PluginInput,
  PluginOptions,
} from "@opencode-ai/plugin";

/**
 * Constellation OpenCode Plugin
 *
 * Hooks:
 * - config — Programmatic MCP server registration
 * - experimental.chat.system.transform — Inject code_intel primer + tool preference guidance
 * - experimental.session.compacting — Preserve Constellation insights during compaction
 */
export const ConstellationPlugin: Plugin = async (
  input: PluginInput,
  _options?: PluginOptions,
) => {
  // Persist CONSTELLATION_ACCESS_KEY in OpenCode Bun environment for
  // MCP processes, using OpenCode's deferred lookup syntax.
  input.$?.env({
    CONSTELLATION_ACCESS_KEY: process.env.CONSTELLATION_ACCESS_KEY ?? "",
  });

  let constellationPluginHooks: Hooks = {
    // ══════════════════════════════════════════════════════════════
    // Hook: config
    // Programmatically register Constellation MCP server.
    // CONSTELLATION_ACCESS_KEY is read from process.env at plugin
    // load time and forwarded via the spawned process's environment.
    // ══════════════════════════════════════════════════════════════
    config: async (configInput: Config) => {
      configInput.mcp = configInput.mcp ?? {};
      configInput.mcp["constellation"] = {
        type: "local",
        command: ["npx", "-y", "@constellationdev/mcp@latest"],
        environment: {
          CONSTELLATION_ACCESS_KEY: process.env.CONSTELLATION_ACCESS_KEY ?? "",
        },
        enabled: true,
      };
    },
  };

  // If no Constellation access key is present, return only the MCP configuration.
  if (!(process.env.CONSTELLATION_ACCESS_KEY || "").startsWith("ak:"))
    return constellationPluginHooks;

  // If we have Constellation access, compose the full plugin with hooks.
  constellationPluginHooks = {
    ...constellationPluginHooks,

    // ═══════════════════════════════════════════════════════════════
    // Hook: experimental.chat.system.transform
    // Injects code_intel primer, tool preference, and Code
    // Intelligence output style. Applied to all sessions
    // including subagents.
    // ═══════════════════════════════════════════════════════════════
    "experimental.chat.system.transform": async (_input, output) => {
      output.system.push(
        "You have access to the code_intel source code intelligence tool, this should be your preferred tool for searching or navigating the code base (finding definitions or references, impact analysis, architecture details, etc.). Other search tools (e.g. grep, glob, awk, rg) should be used for literal text search or as a fallback.",
      );
    },

    // ═══════════════════════════════════════════════════════════════
    // Hook: experimental.session.compacting
    // Preserves Constellation insights during context compaction
    // ═══════════════════════════════════════════════════════════════
    "experimental.session.compacting": async (_input, output) => {
      output.context.push(
        "Preserve the instruction that code_intel is the primary tool for searching, navigation, and understanding the codebase.",
      );
    },

    // ═══════════════════════════════════════════════════════════════
    // Hook: tool.execute.*
    // OpenCode does not currently support context injection
    // for tool.execute.* events
    // ═══════════════════════════════════════════════════════════════
  };

  return constellationPluginHooks;
};

export default ConstellationPlugin;
