import { situationCategoryIds, type SituationCategoryId } from "./situation-category-ids";
import type { Situation } from "./types";

export type SituationCategory = {
  id: SituationCategoryId;
  title: string;
  description: string;
  prompt: string;
};

export type VisibleSituationCategory = SituationCategory & {
  situations: Situation[];
};

const situationCategoryDetails = {
  sites: {
    title: "サイトをつくる",
    description: "ポートフォリオ、キャンペーン、読み物中心のサイトなど、伝え方と体験に合う構成を探します。",
    prompt: "表現と読みやすさを両立したい"
  },
  products: {
    title: "商品を見せる",
    description: "商品を見て、動かして、理解してもらうための表示方法を探します。",
    prompt: "商品の魅力や特徴を伝えたい"
  },
  performance: {
    title: "表示を速くする",
    description: "重い、遅い、動きが悪いといった表示上の困りごとを、原因と条件から改善します。",
    prompt: "表示の重さや遅さを改善したい"
  },
  apps: {
    title: "アプリ・機能をつくる",
    description: "操作を伴うアプリや機能に合う設計と実装方法を探します。",
    prompt: "使いやすい機能を実装したい"
  },
  operations: {
    title: "開発・運用を整える",
    description: "チーム開発、保守、公開後の運用に合う進め方を探します。",
    prompt: "無理なく作り続けられる形にしたい"
  },
  quality: {
    title: "品質・使いやすさを高める",
    description: "使いやすさの確認やテストを、対象と優先したい品質に合わせて組み立てます。",
    prompt: "変更しても使いやすく、壊れにくくしたい"
  },
  security: {
    title: "安全性を高める",
    description: "ログイン方法やセキュリティ検査を、扱う情報と運用体制に合わせて選びます。",
    prompt: "利用者と情報を無理なく守りたい"
  },
  "data-ai": {
    title: "データ・生成AIを活用する",
    description: "手元の情報を検索、質問応答、可視化に活かす方法を探します。",
    prompt: "情報を分かりやすく役立つ機能にしたい"
  },
  measurement: {
    title: "計測して改善する",
    description: "公開後の表示品質や画面エラーを把握し、改善につなげる方法を選びます。",
    prompt: "実際の利用状況を継続して把握したい"
  }
} satisfies Record<SituationCategoryId, Omit<SituationCategory, "id">>;

export const situationCategories: readonly SituationCategory[] = situationCategoryIds.map((id) => ({
  id,
  ...situationCategoryDetails[id]
}));

export function getVisibleSituationCategories(situations: Situation[]): VisibleSituationCategory[] {
  return situationCategories
    .map((category) => ({
      ...category,
      situations: situations.filter((situation) => situation.category === category.id)
    }))
    .filter((category) => category.situations.length > 0);
}

export function getFeaturedSituationChoices(categories: VisibleSituationCategory[], limit = 12) {
  const choices: Array<{ situation: Situation; categoryTitle: string }> = [];

  for (let index = 0; choices.length < limit; index += 1) {
    let found = false;
    for (const category of categories) {
      const situation = category.situations[index];
      if (!situation) continue;
      found = true;
      choices.push({ situation, categoryTitle: category.title });
      if (choices.length === limit) break;
    }
    if (!found) break;
  }

  return choices;
}
