import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { loadContent } from "../lib/load-content";
import { callAgent, parseArgs, readPrompt, saveStage } from "./common";
import { candidatePackageSchema, factCheckResultSchema, researchResultSchema, reviewerResultSchema } from "./contracts";
import { evaluatePublisherGate, publishCandidate } from "./publisher-gate";

const args = parseArgs();
const brief = args.get("brief");
const slug = args.get("slug");
const mode = (args.get("mode") ?? "draft") as "draft" | "publish";
if (!brief || !slug) throw new Error("Usage: pnpm ai:pipeline -- --brief \"...\" --slug slug --mode draft|publish");
const runId = `${new Date().toISOString().replace(/[:.]/g,"-")}-${crypto.randomBytes(3).toString("hex")}`;
const runDir = path.join(process.cwd(), ".ai", "runs", runId);
const inventory = loadContent();
const inventorySummary = {
  situations: inventory.situations.map(({id,title,conditionIds,approachIds})=>({id,title,conditionIds,approachIds})),
  approaches: inventory.approaches.map(({id,title,technologyIds})=>({id,title,technologyIds})),
  conditions: inventory.conditions,
  evidenceIds: inventory.evidence.map((item)=>item.id),
  policy: "Do not overwrite existing ids. New rules require verified evidence. Do not generate measured benchmark numbers."
};

const research = await callAgent({ stage:"researcher", prompt:readPrompt("researcher"), payload:{brief,slug,inventory:inventorySummary,currentDate:new Date().toISOString()}, schema:researchResultSchema, webSearch:true });
saveStage(runDir,"01-research",research);
const author = await callAgent({ stage:"author", prompt:readPrompt("author"), payload:{brief,slug,research:research.data,inventory:inventorySummary,currentDate:new Date().toISOString()}, schema:candidatePackageSchema, webSearch:false });
saveStage(runDir,"02-author",author);
const reviewer = await callAgent({ stage:"reviewer", prompt:readPrompt("reviewer"), payload:{brief,slug,candidate:author.data,inventory:inventorySummary}, schema:reviewerResultSchema, webSearch:true });
saveStage(runDir,"03-reviewer",reviewer);
const factCheck = await callAgent({ stage:"fact-checker", prompt:readPrompt("fact-checker"), payload:{brief,slug,candidate:author.data,evidence:author.data.evidence}, schema:factCheckResultSchema, webSearch:true });
saveStage(runDir,"04-fact-checker",factCheck);
const { candidate, result } = evaluatePublisherGate(author.data, reviewer.data, factCheck.data);
saveStage(runDir,"05-publisher-gate",result);
if (!result.approved) {
  fs.writeFileSync(path.join(runDir,"FAILED"),`${result.blockingIssues.join("\n")}\n`);
  throw new Error(`Publisher gate rejected the candidate:\n- ${result.blockingIssues.join("\n- ")}`);
}
const written = publishCandidate(candidate,runId,mode);
saveStage(runDir,"06-published",{mode,written,warnings:result.warnings,manualReviewRequired:result.manualReviewRequired});
console.log(JSON.stringify({runId,mode,written,warnings:result.warnings,manualReviewRequired:result.manualReviewRequired},null,2));
