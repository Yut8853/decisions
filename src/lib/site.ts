export const siteConfig = {
  name: "技術判断集",
  brand: "JUNKBRANDING",
  description: "状況と条件から、根拠・検証日・非推奨条件つきで実装アプローチを比較する技術判断サイト。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://decisions.junkbranding.com"
};

// 運営元のスクール。Web・ホームページ制作の分野（domains.yml の schoolEligible: true）にだけ案内を出す。
// 面談予約のページが決まったら、path を変更してください。
export const schoolConfig = {
  name: "JUNKBRANDINGのWeb制作スクール",
  url: "https://school.junkbranding.com/",
  path: ""
};

export function schoolLink(goalSlug: string, placement: string) {
  const url = new URL(schoolConfig.path || "/", schoolConfig.url);
  url.searchParams.set("utm_source", "decisions");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "learning-route");
  url.searchParams.set("utm_content", `${goalSlug}-${placement}`);
  return url.toString();
}


// Amazonアソシエイト。トラッキングIDは環境変数 AMAZON_ASSOCIATE_TAG（例: xxxxx-22）で設定する。
// 未設定のあいだは、Amazonへのリンクと広告表記を出さない。
export const affiliateConfig = {
  associateTag: process.env.AMAZON_ASSOCIATE_TAG ?? "",
  disclosure: `Amazonのアソシエイトとして、${siteConfig.name}（${siteConfig.brand}）は適格販売により収入を得ています。`
};

export const isAffiliateEnabled = () => /^[a-z0-9-]+-2[0-9]$/i.test(affiliateConfig.associateTag);
