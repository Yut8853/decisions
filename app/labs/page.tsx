import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "検証環境" };
const labs = [
  ["threejs", "Three.js 基準構成"], ["r3f", "React Three Fiber 基準構成"], ["babylonjs", "Babylon.js 基準構成"], ["model-viewer", "model-viewer 基準構成"]
];
export default function LabsPage() { return <section className="shell page-shell"><p className="eyebrow">再現できる検証環境</p><h1 className="page-title">判断に使う前に、同じ条件で測る。</h1><p className="page-intro">ここにある簡易3D画面は、測定機能の動作確認用です。公開する判断の根拠にする前に、実際の商品モデル、実機、複数回の測定で確認します。</p><div className="lab-grid">{labs.map(([slug,title])=><Link href={`/labs/${slug}`} key={slug}><small>検証環境 / {slug}</small><h2>{title}</h2><p>準備完了の状態、毎秒の描画回数、描画命令数などを自動測定へ渡す最小構成。</p><span>開く ↗</span></Link>)}</div></section>; }
