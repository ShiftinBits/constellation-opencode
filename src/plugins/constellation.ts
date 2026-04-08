import type { Plugin } from "@opencode-ai/plugin";
import type { Config } from "@opencode-ai/sdk";

/**
 * Constellation OpenCode Plugin
 *
 * Hooks:
 * - experimental.chat.system.transform — Inject code_intel primer + tool preference guidance
 * - experimental.session.compacting — Preserve Constellation insights during compaction
 * - tool.execute.before — Log structural query tool usage for debugging
 * - config — Programmatic MCP server registration
 */

export const ConstellationPlugin: Plugin = async () => {
  console.log("Constellation plugin initialized!");
  return {
    // ═══════════════════════════════════════════════════════════════
    // Hook: experimental.chat.system.transform
    // Injects code_intel primer, tool preference, and Code
    // Intelligence output style. Applied to all sessions
    // including subagents.
    // ═══════════════════════════════════════════════════════════════
    "experimental.chat.system.transform": async (input, output) => {
      const constellationPrimer = `You have Constellation access. \`code_intel\` is your PRIMARY tool for understanding this codebase—not an alternative, not a fallback, THE DEFAULT.

Mental model:
- "Where is X defined?" → code_intel
- "What uses X?" → code_intel
- "What would break?" → code_intel
- "Find the string 'ERROR_CODE_123'" → Grep

Grep is for literal text. Everything else starts with code_intel.

For structural code questions—symbol definitions, callers/callees, dependencies, dependents, impact analysis, architecture overview—use code_intel instead of Grep/Glob. It answers in one call what would take 3-5 text searches. Use Grep/Glob only for literal string search, config values, or when code_intel is unavailable.

Before modifying code: run \`api.impactAnalysis()\` to understand blast radius. Before adding imports: run \`api.getDependencies()\` + \`api.findCircularDependencies()\` to verify no cycles. Before renaming or deleting: run \`api.traceSymbolUsage()\` for all references including indirect ones. When exploring: use \`api.searchSymbols()\` for definitions (faster and more precise than grep). When explaining: use \`api.getCallGraph()\` for execution flow and call chains.`;

      output.system.push(constellationPrimer);
    },

    // ═══════════════════════════════════════════════════════════════
    // Hook: experimental.session.compacting
    // Preserves Constellation insights during context compaction
    // ═══════════════════════════════════════════════════════════════
    "experimental.session.compacting": async (input, output) => {
      const preservationInstructions = `Preserve: (1) The instruction that code_intel is the PRIMARY tool for code understanding—Grep is only for literal text, (2) Before modifying code, use api.impactAnalysis() and api.traceSymbolUsage() to check blast radius and references, (3) Any architectural insights, dependency relationships, or impact analysis results discovered via Constellation.`;

      output.context.push(preservationInstructions);
    },

    // ═══════════════════════════════════════════════════════════════
    // Hook: tool.execute.before
    // Logs when grep/glob is used for structural queries as a
    // debugging aid. The primary behavioral guidance lives in
    // the system transform above.
    // ═══════════════════════════════════════════════════════════════
    "tool.execute.before": async (input, output) => {
      if (input.tool === "grep" || input.tool === "glob") {
        console.log(
          `[constellation] ${input.tool} called — code_intel is preferred for structural queries`,
        );
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // Hook: config
    // Programmatically register Constellation MCP server.
    // ═══════════════════════════════════════════════════════════════
    config: async (input: Config) => {
      input.mcp = input.mcp ?? {};
      input.mcp["constellation"] = {
        type: "local",
        command: ["mcp-constellation"],
        environment: {
          CONSTELLATION_ACCESS_KEY: "{env:CONSTELLATION_ACCESS_KEY}",
        },
        enabled: true,
        timeout: 30000,
      };
    },
  };
};

export default ConstellationPlugin;
