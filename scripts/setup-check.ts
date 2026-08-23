import fs from "node:fs";
import { execFileSync } from "node:child_process";

const checks: Array<{name:string;ok:boolean;detail:string}> = [];
const major=Number(process.versions.node.split(".")[0]);checks.push({name:"Node.js",ok:major>=22&&major<25,detail:process.versions.node});
checks.push({name:"Content manifest",ok:fs.existsSync("content/manifest.yml"),detail:"content/manifest.yml"});
checks.push({name:"Environment template",ok:fs.existsSync(".env.example"),detail:".env.example"});
try{checks.push({name:"Git",ok:true,detail:execFileSync("git",["--version"],{encoding:"utf8"}).trim()})}catch{checks.push({name:"Git",ok:false,detail:"not found"})}
checks.push({name:"OpenAI secret",ok:Boolean(process.env.OPENAI_API_KEY),detail:process.env.OPENAI_API_KEY?"configured":"optional for local site; required for AI pipeline"});
checks.push({name:"OpenAI model",ok:Boolean(process.env.OPENAI_MODEL),detail:process.env.OPENAI_MODEL??"optional for local site; required for AI pipeline"});
console.table(checks);if(checks.some(item=>!item.ok&&!["OpenAI secret","OpenAI model"].includes(item.name)))process.exit(1);
