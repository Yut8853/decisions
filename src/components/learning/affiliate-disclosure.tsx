import { affiliateConfig, isAffiliateEnabled } from "@/lib/site";

// 景品表示法（ステルスマーケティング規制）とAmazonアソシエイトの規約に沿った広告表記。
export function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  if (!isAffiliateEnabled()) return null;
  return (
    <p className={compact ? "affiliate-disclosure compact" : "affiliate-disclosure"} role="note">
      <strong>広告について</strong>
      このページには、Amazonアソシエイトの広告リンクが含まれます。{affiliateConfig.disclosure}本の選定は報酬の有無と関係なく、学ぶ順番・内容・バージョンの基準で行っています。
    </p>
  );
}
