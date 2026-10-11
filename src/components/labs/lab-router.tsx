"use client";
import dynamic from "next/dynamic";
const ThreeLab=dynamic(()=>import("./three-lab"),{ssr:false,loading:()=> <p className="lab-overlay">Three.jsを読み込み中…</p>});
const R3FLab=dynamic(()=>import("./r3f-lab"),{ssr:false,loading:()=> <p className="lab-overlay">React Three Fiberを読み込み中…</p>});
const BabylonLab=dynamic(()=>import("./babylon-lab"),{ssr:false,loading:()=> <p className="lab-overlay">Babylon.jsを読み込み中…</p>});
const ModelViewerLab=dynamic(()=>import("./model-viewer-lab"),{ssr:false,loading:()=> <p className="lab-overlay">model-viewerを読み込み中…</p>});
export function LabRouter({slug}:{slug:string}){ if(slug==="threejs")return <ThreeLab/>; if(slug==="r3f")return <R3FLab/>; if(slug==="babylonjs")return <BabylonLab/>; return <ModelViewerLab/>; }
