"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeLab() {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d10);
    const camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0.3, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial({ color: 0xb6ff3b, roughness: 0.35, metalness: 0.15 }));
    scene.add(mesh);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 2.2));
    const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(3, 4, 5); scene.add(light);
    let raf = 0;
    const render = () => {
      mesh.rotation.y += 0.008; mesh.rotation.x += 0.003;
      renderer.render(scene, camera);
      window.__VTD_METRICS__ = { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
      window.__VTD_READY__ = true;
      raf = requestAnimationFrame(render);
    };
    render();
    const resize = () => { if (!host.clientWidth || !host.clientHeight) return; camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); host.replaceChildren(); window.__VTD_READY__ = false; };
  }, []);
  return <div ref={mount} className="lab-canvas" />;
}
