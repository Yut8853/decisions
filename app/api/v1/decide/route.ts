import { NextResponse } from "next/server";
import { z } from "zod";
import { contentBundle, getSituationBySlug } from "@/lib/content";
import { decide } from "@/lib/decision-engine";

const requestSchema = z.object({
  situationSlug: z.string().min(1),
  conditionIds: z.array(z.string()).default([])
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const situation = getSituationBySlug(input.situationSlug);
    if (!situation) return NextResponse.json({ error: "Situation not found." }, { status: 404 });
    const result = decide({
      situation,
      approaches: contentBundle.approaches,
      rules: contentBundle.rules,
      conditions: contentBundle.conditions,
      activeConditionIds: input.conditionIds
    });
    return NextResponse.json({
      situation: { id: situation.id, slug: situation.slug, title: situation.title, lastReviewed: situation.lastReviewed },
      activeConditionIds: result.activeConditionIds,
      ranked: result.ranked.map((item) => ({ id: item.approach.id, title: item.approach.title, label: item.label, reasons: item.reasons, evidenceIds: item.evidenceIds })),
      excluded: result.excluded.map((item) => ({ id: item.approach.id, title: item.approach.title, reasons: item.reasons, evidenceIds: item.evidenceIds })),
      warnings: result.warnings
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request.", details: String(error) }, { status: 400 });
  }
}
