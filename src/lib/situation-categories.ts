import type { Situation, SituationCategoryId } from "./types";

export type SituationCategory = {
  id: SituationCategoryId;
  title: string;
  description: string;
  prompt: string;
};

export const situationCategories: readonly SituationCategory[] = [
  {
    id: "sites",
    title: "サイトをつくる",
    description: "ポートフォリオ、キャンペーン、読み物中心のサイトなど、伝え方と体験に合う構成を探します。",
    prompt: "表現と読みやすさを両立したい"
  },
  {
    id: "products",
    title: "商品を見せる",
    description: "商品を見て、動かして、理解してもらうための表示方法を探します。",
    prompt: "商品の魅力や特徴を伝えたい"
  },
  {
    id: "performance",
    title: "表示を速くする",
    description: "重い、遅い、動きが悪いといった表示上の困りごとを、原因と条件から改善します。",
    prompt: "表示の重さや遅さを改善したい"
  },
  {
    id: "apps",
    title: "アプリ・機能をつくる",
    description: "操作を伴うアプリや機能に合う設計と実装方法を探します。",
    prompt: "使いやすい機能を実装したい"
  },
  {
    id: "operations",
    title: "開発・運用を整える",
    description: "チーム開発、保守、公開後の運用に合う進め方を探します。",
    prompt: "無理なく作り続けられる形にしたい"
  }
];

export function getVisibleSituationCategories(situations: Situation[]) {
  return situationCategories
    .map((category) => ({
      ...category,
      situations: situations.filter((situation) => situation.category === category.id)
    }))
    .filter((category) => category.situations.length > 0);
}
