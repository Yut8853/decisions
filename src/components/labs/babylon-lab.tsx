"use client";
import { useEffect, useRef } from "react";
import { ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

export default function BabylonLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer:false, stencil:true }, true);
    const scene = new Scene(engine); scene.clearColor = new Color4(0.035,0.05,0.063,1);
    const camera = new ArcRotateCamera("camera", Math.PI/2, Math.PI/2.2, 5, Vector3.Zero(), scene); camera.attachControl(canvas, false);
    new HemisphericLight("hemi", new Vector3(0,1,0), scene).intensity = 1.5;
    const dir = new DirectionalLight("dir", new Vector3(-1,-2,-2), scene); dir.intensity=2;
    const box=MeshBuilder.CreateBox("box",{size:2},scene); const mat=new StandardMaterial("mat",scene); mat.diffuseColor=Color3.FromHexString("#b6ff3b"); mat.specularPower=64; box.material=mat;
    engine.runRenderLoop(()=>{ box.rotation.y += .008; box.rotation.x += .003; scene.render(); window.__VTD_METRICS__={ drawCalls:null, triangles:scene.getTotalVertices()/3, engineFps:engine.getFps() }; window.__VTD_READY__=true; });
    const resize=()=>engine.resize(); window.addEventListener("resize",resize);
    return()=>{window.removeEventListener("resize",resize);engine.stopRenderLoop();scene.dispose();engine.dispose();window.__VTD_READY__=false;};
  },[]);
  return <div className="lab-canvas"><canvas ref={canvasRef} /></div>;
}
