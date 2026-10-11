import type { Metadata } from "next";
export const metadata: Metadata = { title: "運営方針" };
export default function GovernancePage() {
  return <article className="shell prose-page"><p className="eyebrow">運営方針</p><h1>AIは候補を作り、仕組みが公開条件を確認する。</h1>
    <h2>5段階で役割を分ける</h2><ol><li>調査：一次情報を優先して事実候補を集める。</li><li>執筆：決められた形式に沿って候補データを作る。</li><li>独立レビュー：構成、反例、過剰な断定を点検する。</li><li>事実確認：根拠資料が主張を本当に支えているかを確認する。</li><li>公開判定：参照関係、更新権限、禁止事項をプログラムで確認する。</li></ol>
    <h2>AIが直接できないこと</h2><ul><li>主要ブランチへの直接反映</li><li>手入力した性能測定値の公開</li><li>根拠のない判定基準の公開</li><li>既存の判断記録の無断上書き</li><li>未確認資料を「確認済み」にすること</li></ul>
    <h2>訂正</h2><p>訂正は履歴として残し、判断を変更した理由を隠しません。GitHubの課題または変更提案から受け付けます。</p>
  </article>;
}
