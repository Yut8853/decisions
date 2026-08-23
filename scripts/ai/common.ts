import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import type { ZodType } from "zod";

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required. Configure it as a GitHub secret or local environment variable.`);
  return value;
}

export function readPrompt(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), ".ai", "prompts", `${name}.md`), "utf8");
}

export function readPolicies(): string {
  const dir = path.join(process.cwd(), ".ai", "policies");
  return fs.readdirSync(dir).filter((name) => name.endsWith(".md")).sort().map((name) => fs.readFileSync(path.join(dir, name), "utf8")).join("\n\n---\n\n");
}

function extractOutputText(response: any): string {
  if (typeof response.output_text === "string" && response.output_text) return response.output_text;
  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n");
}

export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(withoutFence); } catch {}
  const first = Math.min(...[withoutFence.indexOf("{"), withoutFence.indexOf("[")].filter((index) => index >= 0));
  const lastObject = withoutFence.lastIndexOf("}");
  const lastArray = withoutFence.lastIndexOf("]");
  const last = Math.max(lastObject, lastArray);
  if (!Number.isFinite(first) || first < 0 || last < first) throw new Error("AI response did not contain valid JSON.");
  return JSON.parse(withoutFence.slice(first, last + 1));
}

export async function callAgent<T>(input: {
  stage: string;
  prompt: string;
  payload: unknown;
  schema: ZodType<T>;
  webSearch?: boolean;
}): Promise<{ data: T; responseId: string; model: string }> {
  const model = requireEnv("OPENAI_MODEL");
  const client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
  const enableWeb = input.webSearch && process.env.OPENAI_ENABLE_WEB_SEARCH !== "false";
  const tools = enableWeb ? [{ type: process.env.OPENAI_WEB_SEARCH_TOOL || "web_search" }] : undefined;
  const response: any = await (client.responses as any).create({
    model,
    input: [
      { role: "system", content: [{ type: "input_text", text: `${input.prompt}\n\nGLOBAL POLICIES:\n${readPolicies()}` }] },
      { role: "user", content: [{ type: "input_text", text: JSON.stringify(input.payload, null, 2) }] }
    ],
    tools,
    max_output_tokens: 16000
  });
  const raw = extractOutputText(response);
  const parsed = input.schema.parse(extractJson(raw));
  return { data: parsed, responseId: response.id ?? "unknown", model };
}

export function saveStage(runDir: string, stage: string, value: unknown) {
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(runDir, `${stage}.json`), `${JSON.stringify(value, null, 2)}\n`);
}

export function parseArgs() {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 1) {
    const token = process.argv[index];
    if (!token.startsWith("--")) continue;
    values.set(token.slice(2), process.argv[index + 1] && !process.argv[index + 1].startsWith("--") ? process.argv[++index] : "true");
  }
  return values;
}
