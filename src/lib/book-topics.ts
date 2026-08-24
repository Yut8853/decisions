import { bookTopicIds, type BookTopicId } from "./book-topic-ids";
import type { BookResource } from "./types";

export type BookTopic = {
  id: BookTopicId;
  title: string;
  description: string;
};

export type BookTopicWithCount = BookTopic & {
  count: number;
};

const bookTopicDetails = {
  accessibility: {
    title: "アクセシビリティ",
    description: "規格への対応、実装、評価、障害のある利用者との確認を学びます。"
  },
  "design-ux": {
    title: "UI・UX・情報設計",
    description: "画面、操作、情報の組み立て方と、利用者に伝わる設計を学びます。"
  },
  frontend: {
    title: "フロントエンド設計",
    description: "画面を保守しやすく実装するための、部品化と状態管理を学びます。"
  },
  "testing-quality": {
    title: "テスト・品質",
    description: "壊れにくい開発を続けるための、テスト設計と品質の考え方を学びます。"
  },
  "security-auth": {
    title: "セキュリティ・認証",
    description: "Webアプリの脅威、対策、ログイン設計を安全性の根拠から学びます。"
  },
  "performance-graphics": {
    title: "性能・3D・描画",
    description: "表示速度、描画処理、3D表現を、仕組みと計測方法から学びます。"
  },
  "architecture-operations": {
    title: "アーキテクチャ・運用",
    description: "構成の選択、変更への備え、公開後の運用までを学びます。"
  },
  "data-ai-search": {
    title: "データ・検索・生成AI",
    description: "データの扱い、検索、可視化、生成AI機能の設計と評価を学びます。"
  }
} satisfies Record<BookTopicId, Omit<BookTopic, "id">>;

export const bookTopics: readonly BookTopic[] = bookTopicIds.map((id) => ({
  id,
  ...bookTopicDetails[id]
}));

export function getBookTopicsWithCounts(books: BookResource[]): BookTopicWithCount[] {
  return bookTopics.map((topic) => ({
    ...topic,
    count: books.filter((book) => book.bookTopicIds.includes(topic.id)).length
  }));
}
