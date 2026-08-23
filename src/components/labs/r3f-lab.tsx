"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function Cube() {
  const ref = useRef<Mesh>(null);
  useFrame(({ gl }, delta) => {
    if (ref.current) { ref.current.rotation.y += delta * 0.48; ref.current.rotation.x += delta * 0.18; }
    window.__VTD_METRICS__ = { drawCalls: gl.info.render.calls, triangles: gl.info.render.triangles };
    window.__VTD_READY__ = true;
  });
  return <mesh ref={ref}><boxGeometry args={[2,2,2]} /><meshStandardMaterial color="#b6ff3b" roughness={0.35} metalness={0.15} /></mesh>;
}
export default function R3FLab() {
  return <div className="lab-canvas"><Canvas camera={{ position:[0,.3,5], fov:42 }} dpr={[1,2]} gl={{ antialias:true, powerPreference:"high-performance" }}><color attach="background" args={["#090d10"]}/><hemisphereLight intensity={2.2}/><directionalLight intensity={3} position={[3,4,5]}/><Cube/></Canvas></div>;
}
