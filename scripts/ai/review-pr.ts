import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { callAgent, readPrompt, saveStage } from "./common";
import { reviewerResultSchema, factCheckResultSchema } from "./contracts";

let diff="";
try { diff=execFileSync("git",["diff","--unified=4","origin/main...HEAD","--","content","src/lib","scripts"],{encoding:"utf8",maxBuffer:8_000_000}); }
catch { diff=execFileSync("git",["diff","--unified=4","HEAD~1...HEAD","--","content","src/lib","scripts"],{encoding:"utf8",maxBuffer:8_000_000}); }
if(!diff.trim()){console.log("No reviewable diff.");process.exit(0)}
const runId=`pr-${process.env.GITHUB_RUN_ID??Date.now()}`;const runDir=path.join(process.cwd(),".ai","runs",runId);
const reviewer=await callAgent({stage:"pr-reviewer",prompt:readPrompt("reviewer"),payload:{task:"Review this git diff independently. Reject unsafe publication changes.",diff},schema:reviewerResultSchema,webSearch:true});saveStage(runDir,"reviewer",reviewer);
const fact=await callAgent({stage:"pr-fact-checker",prompt:readPrompt("fact-checker"),payload:{task:"Fact-check claims and evidence changed in this diff.",diff},schema:factCheckResultSchema,webSearch:true});saveStage(runDir,"fact-checker",fact);
const summary={approved:reviewer.data.approved&&fact.data.approved,reviewer:reviewer.data,factChecker:fact.data};fs.writeFileSync(path.join(runDir,"summary.json"),`${JSON.stringify(summary,null,2)}\n`);fs.mkdirSync("artifacts",{recursive:true});fs.writeFileSync("artifacts/ai-pr-review.json",`${JSON.stringify(summary,null,2)}\n`);
if(!summary.approved)throw new Error("Independent AI PR review rejected the change. See artifacts/ai-pr-review.json");
console.log("Independent AI PR review approved.");
