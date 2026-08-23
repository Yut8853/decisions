import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import {
  approachSchema,
  benchmarkPlanSchema,
  conditionSchema,
  decisionPresetSchema,
  evidenceSchema,
  resourceSchema,
  ruleSchema,
  situationFrontmatterSchema
} from "../../src/lib/schemas";
import type { ContentBundle } from "../../src/lib/types";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");

function files(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(extension))
    .sort()
    .map((name) => path.join(dir, name));
}

function yamlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { recursive: true })
    .map(String)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .sort()
    .map((name) => path.join(dir, name));
}

function parseYaml(file: string): unknown {
  return YAML.parse(fs.readFileSync(file, "utf8"));
}

function parseMany<T>(dir: string, schema: { parse: (value: unknown) => T }): T[] {
  return yamlFiles(dir).map((file) => {
    try {
      return schema.parse(parseYaml(file));
    } catch (error) {
      throw new Error(`Invalid content file: ${path.relative(ROOT, file)}\n${String(error)}`);
    }
  });
}

export function loadContent(): ContentBundle {
  const situations = files(path.join(CONTENT, "situations"), ".md").map((file) => {
    const parsed = matter(fs.readFileSync(file, "utf8"));
    try {
      return { ...situationFrontmatterSchema.parse(parsed.data), body: parsed.content.trim() };
    } catch (error) {
      throw new Error(`Invalid situation: ${path.relative(ROOT, file)}\n${String(error)}`);
    }
  });

  const conditionsRaw = parseYaml(path.join(CONTENT, "conditions", "conditions.yml"));
  if (!Array.isArray(conditionsRaw)) throw new Error("content/conditions/conditions.yml must contain an array.");
  const conditions = conditionsRaw.map((value) => conditionSchema.parse(value));

  return {
    generatedAt: new Date().toISOString(),
    situations,
    approaches: parseMany(path.join(CONTENT, "approaches"), approachSchema),
    rules: parseMany(path.join(CONTENT, "rules"), ruleSchema),
    evidence: parseMany(path.join(CONTENT, "evidence"), evidenceSchema),
    resources: parseMany(path.join(CONTENT, "resources"), resourceSchema),
    conditions,
    decisions: parseMany(path.join(CONTENT, "decisions"), decisionPresetSchema),
    benchmarks: parseMany(path.join(CONTENT, "benchmarks", "plans"), benchmarkPlanSchema)
  };
}

export function loadManifest(): {
  schemaVersion: number;
  minimums: Record<string, number>;
  defaultDomain: string;
  policyVersion: string;
} {
  return parseYaml(path.join(CONTENT, "manifest.yml")) as ReturnType<typeof loadManifest>;
}
