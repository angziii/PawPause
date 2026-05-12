import { mkdir, appendFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const outputFile =
  process.env.PAWPAUSE_AGENT_EVENTS ||
  join(process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"), "pawpause", "agent-events", "opencode.jsonl");

function timestamp(properties) {
  return typeof properties?.timestamp === "number" ? properties.timestamp : Date.now();
}

function sessionID(properties) {
  return properties?.sessionID || properties?.sessionId || "unknown";
}

function compactText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}

function textFromParts(parts) {
  if (!Array.isArray(parts)) return "";
  return compactText(
    parts
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        return typeof part.text === "string" ? part.text : "";
      })
      .filter(Boolean)
      .join(" ")
  );
}

function entry(event, details) {
  return {
    version: 1,
    source: "OpenCode",
    id: event.id,
    type: event.type,
    timestampMs: timestamp(event.properties),
    sessionID: sessionID(event.properties),
    ...details
  };
}

function eventEntry(event) {
  const properties = event.properties || {};

  switch (event.type) {
    case "session.status": {
      const status = String(properties.status || properties.type || "");
      if (/idle|complete|done|stop/i.test(status)) {
        return entry(event, {
          kind: "complete",
          progressKind: "complete",
          message: "OpenCode session is idle"
        });
      }
      return entry(event, {
        kind: "working",
        progressKind: "thinking",
        message: "OpenCode is working",
        showProgress: false
      });
    }
    case "session.next.step.started":
      return entry(event, {
        kind: "working",
        progressKind: "thinking",
        message: `OpenCode ${properties.agent || "agent"} is working`
      });
    case "session.next.reasoning.started":
    case "session.next.text.started":
      return entry(event, {
        kind: "working",
        progressKind: "thinking",
        message: "OpenCode is thinking",
        showProgress: false
      });
    case "session.next.tool.called":
    case "session.next.tool.input.started":
      return entry(event, {
        kind: "working",
        progressKind: properties.tool === "bash" || properties.name === "bash" ? "script" : "tool",
        message: String(properties.tool || properties.name || "tool")
      });
    case "session.next.shell.started":
      return entry(event, {
        kind: "working",
        progressKind: "script",
        message: String(properties.command || "OpenCode is running a command"),
        command: properties.command
      });
    case "permission.asked":
      return entry(event, {
        kind: "needs-review",
        progressKind: "permission",
        message: String(properties.permission || "OpenCode needs permission")
      });
    case "question.asked":
      return entry(event, {
        kind: "needs-review",
        progressKind: "choice",
        message: "OpenCode needs a choice"
      });
    case "session.idle":
      return entry(event, {
        kind: "complete",
        progressKind: "complete",
        message: "OpenCode session is idle"
      });
    case "session.error":
    case "session.next.step.failed":
      return entry(event, {
        kind: "failed",
        progressKind: "failed",
        message: String(properties.error?.message || "OpenCode ran into a problem")
      });
    default:
      return null;
  }
}

async function write(entry) {
  await mkdir(dirname(outputFile), { recursive: true });
  await appendFile(outputFile, `${JSON.stringify(entry)}\n`, "utf8");
}

export const PawPauseAgentHook = async () => ({
  event: async ({ event }) => {
    const next = eventEntry(event);
    if (next) await write(next);
  },
  "chat.message": async (input, output) => {
    await write({
      version: 1,
      source: "OpenCode",
      id: `chat.message:${input.sessionID}:${input.messageID || Date.now()}`,
      type: "chat.message",
      timestampMs: Date.now(),
      sessionID: input.sessionID,
      kind: "working",
      progressKind: "thinking",
      message: textFromParts(output?.parts) || "OpenCode is thinking"
    });
  },
  "command.execute.before": async (input) => {
    await write({
      version: 1,
      source: "OpenCode",
      id: `command.execute.before:${input.sessionID}:${Date.now()}`,
      type: "command.execute.before",
      timestampMs: Date.now(),
      sessionID: input.sessionID,
      kind: "working",
      progressKind: "script",
      message: String(input.command || "OpenCode is running a command")
    });
  },
  "tool.execute.before": async (input) => {
    await write({
      version: 1,
      source: "OpenCode",
      id: `tool.execute.before:${input.sessionID}:${input.callID}`,
      type: "tool.execute.before",
      timestampMs: Date.now(),
      sessionID: input.sessionID,
      kind: "working",
      progressKind: input.tool === "bash" ? "script" : "tool",
      message: input.tool
    });
  },
  "permission.ask": async (input) => {
    await write({
      version: 1,
      source: "OpenCode",
      id: `permission.ask:${input.sessionID}:${input.id}`,
      type: "permission.ask",
      timestampMs: Date.now(),
      sessionID: input.sessionID,
      kind: "needs-review",
      progressKind: "permission",
      message: String(input.permission || "OpenCode needs permission")
    });
  }
});
