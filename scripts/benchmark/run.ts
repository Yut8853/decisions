import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";

function arg(name: string, fallback?: string) { const index=process.argv.indexOf(`--${name}`); return index>=0 ? process.argv[index+1] : fallback; }
const benchmarkId=arg("id","bench-product-viewer-baseline")!;
const baseUrl=arg("base-url","http://127.0.0.1:3000")!;
const durationMs=Number(arg("duration-ms","5000"));
const runId=`${new Date().toISOString().replace(/[:.]/g,"-")}-${crypto.randomBytes(3).toString("hex")}`;
const runnerSource=fs.readFileSync(new URL(import.meta.url),"utf8");
const runnerChecksum=crypto.createHash("sha256").update(runnerSource).digest("hex");
const targets: Record<string,string>={"model-viewer-product":"/labs/model-viewer","threejs-gltf-product":"/labs/threejs","r3f-product":"/labs/r3f","babylonjs-product":"/labs/babylonjs"};
if(benchmarkId!=="bench-product-viewer-baseline") throw new Error(`Runner mapping not implemented for ${benchmarkId}. Add reproducible lab routes before measuring.`);
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const browserVersion=browser.version();
const results=[];
for(const [approachId,pathname] of Object.entries(targets)){
 const page=await context.newPage();
 await page.goto(`${baseUrl}${pathname}`,{waitUntil:"networkidle"});
 await page.waitForFunction(()=>window.__VTD_READY__===true,null,{timeout:30000});
 const measured=await page.evaluate(async(duration)=>{
  const started=performance.now();let frames=0;
  await new Promise<void>((resolve)=>{const tick=(time:number)=>{frames++;if(time-started>=duration)resolve();else requestAnimationFrame(tick)};requestAnimationFrame(tick)});
  const entries=performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const navigation=performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming|undefined;
  const paint=performance.getEntriesByName("first-contentful-paint")[0];
  const memory=(performance as Performance & {memory?:{usedJSHeapSize:number}}).memory;
  return {fpsMedian:frames/(duration/1000),firstContentfulPaintMs:paint?.startTime??navigation?.domContentLoadedEventEnd??null,transferredBytes:entries.reduce((sum,item)=>sum+(item.transferSize||0),0),jsHeapBytes:memory?.usedJSHeapSize??null,metrics:window.__VTD_METRICS__??{}};
 },durationMs);
 results.push({approachId,url:`${baseUrl}${pathname}`,samples:1,fpsMedian:Number(measured.fpsMedian.toFixed(2)),firstContentfulPaintMs:measured.firstContentfulPaintMs?Number(measured.firstContentfulPaintMs.toFixed(2)):null,transferredBytes:measured.transferredBytes||null,jsHeapBytes:measured.jsHeapBytes,drawCalls:measured.metrics.drawCalls??null,triangles:measured.metrics.triangles??null});
 await page.close();
}
await browser.close();
const output={schemaVersion:1,benchmarkId,runId,generatedBy:"benchmark-runner",generatedAt:new Date().toISOString(),runnerChecksum,environment:{browser:"chromium",browserVersion,os:`${os.platform()} ${os.release()}`,viewport:{width:1440,height:900}},results};
const outDir=path.join(process.cwd(),"content","benchmarks","results");fs.mkdirSync(outDir,{recursive:true});const out=path.join(outDir,`${benchmarkId}-${runId}.json`);fs.writeFileSync(out,`${JSON.stringify(output,null,2)}\n`);console.log(out);
