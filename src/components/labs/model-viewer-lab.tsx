"use client";
import { useEffect, useState } from "react";
export default function ModelViewerLab() {
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{ let active=true; import("@google/model-viewer").then(()=>{if(active)setLoaded(true)}); return()=>{active=false;window.__VTD_READY__=false};},[]);
  useEffect(()=>{ if(loaded){window.__VTD_READY__=true;window.__VTD_METRICS__={drawCalls:null,triangles:12};}},[loaded]);
  return <div className="lab-canvas">{loaded ? <model-viewer src="/fixtures/cube.gltf" alt="測定用の立方体" camera-controls autoplay exposure="1" shadow-intensity="1" style={{width:"100%",height:"100%",background:"#090d10"}} /> : <p className="lab-overlay">読み込み中…</p>}</div>;
}
