"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { decide } from "@/lib/decision-engine";
import type {
  Approach,
  BenchmarkPlan,
  ConditionDefinition,
  DecisionPreset,
  Evidence,
  Resource,
  Rule,
  Situation
} from "@/lib/types";
import { ApproachCard } from "./approach-card";
import { EvidencePanel } from "./evidence-panel";

function readHash(allowed: Set<string>): string[] {
  if (typeof window === "undefined") return [];
  const value = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("conditions");
  return value ? value.split(",").filter((id) => allowed.has(id)) : [];
}

export function DecisionExplorer(props: {
  situation: Situation;
  approaches: Approach[];
  conditions: ConditionDefinition[];
  rules: Rule[];
  evidence: Evidence[];
  resources: Resource[];
  presets: DecisionPreset[];
  benchmarks: BenchmarkPlan[];
}) {
  const allowed = useMemo(() => new Set(props.conditions.map((condition) => condition.id)), [props.conditions]);
  const [active, setActive] = useState<string[]>(props.situation.defaultConditionIds);

  useEffect(() => {
    const fromHash = readHash(allowed);
    if (fromHash.length) setActive(fromHash);
  }, [allowed]);

  const result = useMemo(() => decide({
    situation: props.situation,
    approaches: props.approaches,
    rules: props.rules,
    conditions: props.conditions,
    activeConditionIds: active
  }), [active, props]);

  function setConditions(next: string[]) {
    setActive(next);
    const params = new URLSearchParams();
    if (next.length) params.set("conditions", next.join(","));
    const hash = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${hash ? `#${hash}` : ""}`);
  }

  function toggle(id: string) {
    const next = active.includes(id) ? active.filter((item) => item !== id) : [...active, id];
    setConditions(next);
    track("condition_toggle", { situation: props.situation.slug, condition: id, enabled: !active.includes(id) });
  }

  const evidenceMap = new Map(props.evidence.map((item) => [item.id, item]));
  const resourceMap = new Map(props.resources.map((item) => [item.id, item]));
  const conditionLabels = new Map(props.conditions.map((item) => [item.id, item.label]));

  return (
    <div className="explorer">
      <section className="condition-section" aria-labelledby="condition-title">
        <div className="explorer-heading">
          <div><h2 id="condition-title">条件を変更する</h2></div>
          <button className="text-button" type="button" onClick={() => setConditions(props.situation.defaultConditionIds)}>標準に戻す</button>
        </div>
        <p>当てはまる条件を選んでください。おすすめの順番、除外する案、その理由が自動で更新されます。</p>
        <div className="condition-grid">
          {props.conditions.map((condition) => {
            const selected = active.includes(condition.id);
            return (
              <button
                className={selected ? "condition-chip selected" : "condition-chip"}
                type="button"
                aria-pressed={selected}
                onClick={() => toggle(condition.id)}
                key={condition.id}
              >
                <span>{selected ? "●" : "○"}</span>
                <b>{condition.label}</b>
                <small>{condition.description}</small>
              </button>
            );
          })}
        </div>
        {props.presets.length > 0 && (
          <div className="preset-row">
            <span>確認済みの条件例</span>
            {props.presets.map((preset) => (
              <button key={preset.id} type="button" onClick={() => {
                setConditions(preset.conditionIds);
                track("decision_preset", { situation: props.situation.slug, preset: preset.slug });
              }}>{preset.title}</button>
            ))}
          </div>
        )}
      </section>

      {result.warnings.length > 0 && (
        <section className="warning-box" aria-label="判断上の注意">
          <strong>条件間の注意</strong>
          {result.warnings.map((warning) => <p key={warning.id}>{warning.message}</p>)}
        </section>
      )}

      <section aria-labelledby="approach-title">
        <div className="explorer-heading">
          <div><h2 id="approach-title">この条件に合う実装案</h2></div>
          <small>{active.length}件の条件を選択中</small>
        </div>
        <div className="approach-stack">
          {result.ranked.map((item, index) => (
            <ApproachCard
              key={item.approach.id}
              rank={index + 1}
              item={item}
              evidenceMap={evidenceMap}
              resourceMap={resourceMap}
              activeConditionIds={result.activeConditionIds}
              conditionLabels={conditionLabels}
              situationSlug={props.situation.slug}
            />
          ))}
        </div>
      </section>

      {result.excluded.length > 0 && (
        <section className="excluded-section" aria-labelledby="excluded-title">
          <div className="explorer-heading"><div><h2 id="excluded-title">今回は除外</h2></div></div>
          <div className="excluded-grid">
            {result.excluded.map((item) => (
              <details key={item.approach.id} onToggle={(event) => {
                if ((event.currentTarget as HTMLDetailsElement).open) track("excluded_approach_expand", { situation: props.situation.slug, approach: item.approach.slug });
              }}>
                <summary><span>非推奨</span><b>{item.approach.shortTitle}</b><i>＋</i></summary>
                {item.reasons.map((reason) => <p key={reason}>{reason}</p>)}
              </details>
            ))}
          </div>
        </section>
      )}

      <EvidencePanel evidence={props.evidence} situationSlug={props.situation.slug} />
    </div>
  );
}
