import { notFound } from "next/navigation";
import { LabRouter } from "@/components/labs/lab-router";
const labs: Record<string,string>={threejs:"Three.js 基準構成",r3f:"React Three Fiber 基準構成",babylonjs:"Babylon.js 基準構成","model-viewer":"model-viewer 基準構成"};
export const dynamicParams=false;
export function generateStaticParams(){return Object.keys(labs).map(slug=>({slug}));}
export default async function LabPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;if(!labs[slug])notFound();return <section className="lab-page"><header className="lab-header"><div><small>再現できる検証環境</small><strong>{labs[slug]}</strong></div><span>簡易データ／判断の根拠には未使用</span></header><LabRouter slug={slug}/></section>}
