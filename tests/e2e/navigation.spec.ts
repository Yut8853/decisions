import { test, expect, type Page } from "@playwright/test";
import content from "../../src/generated/content.json";
import { bookTopics, getBookTopicsWithCounts } from "../../src/lib/book-topics";
import { getFeaturedSituationChoices, getVisibleSituationCategories } from "../../src/lib/situation-categories";
import type { BookResource, Situation } from "../../src/lib/types";

const publishedSituations = content.situations.filter((situation) => situation.published) as Situation[];
const visibleCategories = getVisibleSituationCategories(publishedSituations);
const featuredSituations = getFeaturedSituationChoices(visibleCategories);
const bookResources = content.resources.filter((resource) => resource.type === "book") as BookResource[];
const bookTopicsWithCounts = getBookTopicsWithCounts(bookResources);

async function expectStableLayout(page: Page) {
  const layout = await page.evaluate(() => ({
    maxFontSize: Math.max(...Array.from(document.body.querySelectorAll("*")).filter((element) => {
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    }).map((element) => Number.parseFloat(getComputedStyle(element).fontSize))),
    overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  }));
  expect(layout.maxFontSize).toBeLessThanOrEqual(32);
  expect(layout.overflows).toBe(false);
}

test("home exposes representative goals and every category route", async ({ page }) => {
  await page.goto("/");

  const mainNavigation = page.getByRole("navigation", { name: "メインナビゲーション" });
  await expect(mainNavigation.getByRole("link", { name: "技術判断" })).toBeVisible();
  await expect(mainNavigation.getByRole("link", { name: "書籍" })).toBeVisible();
  await expect(mainNavigation.getByRole("link", { name: "判定方法" })).toBeVisible();

  const goals = page.getByRole("navigation", { name: "具体的な目的から選ぶ" });
  await expect(goals.getByRole("link")).toHaveCount(featuredSituations.length);
  for (const { situation } of featuredSituations) {
    const link = goals.locator(`a[href="/decisions/${situation.slug}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toContainText(situation.title);
  }

  const categories = page.getByRole("navigation", { name: "カテゴリーで絞る" });
  await expect(categories.getByRole("link")).toHaveCount(visibleCategories.length);
  await expect(categories.getByRole("heading", { name: "計測して改善する" })).toBeVisible();

  await expectStableLayout(page);

  await goals.getByRole("link", { name: /問い合わせフォームを安全に運用したい/ }).click();
  await expect(page).toHaveURL(/\/decisions\/secure-contact-form$/);
});

test("category links restore the selected directory from the URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "カテゴリーで絞る" }).getByRole("link", { name: /品質・使いやすさを高める/ }).click();

  await expect(page).toHaveURL(/\/decisions#category-quality$/);
  await expect(page.getByRole("radio", { name: /品質・使いやすさを高める/ })).toBeChecked();
  const purposeNavigation = page.getByRole("navigation", { name: "具体的な目的を選ぶ" });
  await expect(purposeNavigation.getByRole("link", { name: "Webサイトの使いやすさを検証したい", exact: true })).toBeVisible();
  await expect(purposeNavigation.getByRole("link", { name: "最初に整備するテストを選びたい", exact: true })).toBeVisible();
  await expect(purposeNavigation.getByRole("link")).toHaveCount(2);

  await page.getByRole("radio", { name: /安全性を高める/ }).check();
  await expect(page).toHaveURL(/\/decisions#category-security$/);
  await page.goBack();
  await expect(page.getByRole("radio", { name: /品質・使いやすさを高める/ })).toBeChecked();
  await expect(purposeNavigation.getByRole("link")).toHaveCount(2);
  await page.goForward();
  await expect(page.getByRole("radio", { name: /安全性を高める/ })).toBeChecked();
  await expect(purposeNavigation.getByRole("link")).toHaveCount(2);
});

test("category directory filters and searches decisions", async ({ page }) => {
  await page.goto("/decisions");
  const categoryFilter = page.getByRole("group", { name: "近い分野を選ぶ" });
  await expect(categoryFilter.getByRole("radio")).toHaveCount(visibleCategories.length + 1);
  const allCategories = categoryFilter.getByRole("radio", { name: new RegExp(`すべての分野.*${publishedSituations.length}件`) });
  await expect(allCategories).toBeChecked();

  const purposeNavigation = page.getByRole("navigation", { name: "具体的な目的を選ぶ" });
  await expect(purposeNavigation.getByRole("link")).toHaveCount(publishedSituations.length);
  const purposeHrefs = await purposeNavigation.getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(purposeHrefs).size).toBe(publishedSituations.length);
  await expectStableLayout(page);

  await allCategories.focus();
  await page.keyboard.press("ArrowRight");
  await expect(categoryFilter.getByRole("radio", { name: /サイトをつくる/ })).toBeChecked();
  await expect(page).toHaveURL(/\/decisions#category-sites$/);

  await page.getByRole("radio", { name: /商品を見せる/ }).check();
  await expect(purposeNavigation.getByRole("link")).toHaveCount(1);
  await expect(purposeNavigation.getByRole("link", { name: /3D商品ビューアを作りたい/ })).toBeVisible();
  await expect(purposeNavigation.getByRole("link", { name: /3Dポートフォリオサイトを作りたい/ })).toHaveCount(0);
  const search = page.getByRole("searchbox", { name: "キーワードで目的を探す" });
  await search.fill("商品");
  await expect(page.getByRole("status")).toHaveText("1件の目的が見つかりました");
  await expect(purposeNavigation.getByRole("link")).toHaveCount(1);
  await search.fill("該当しない検索語");
  await expect(page.getByRole("status")).toHaveText("0件の目的が見つかりました");
  await expect(purposeNavigation).toHaveCount(0);
  await page.getByRole("button", { name: "検索と絞り込みを解除する" }).click();
  await expect(page.getByRole("searchbox", { name: "キーワードで目的を探す" })).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(`${publishedSituations.length}件の目的が見つかりました`);
});

test("expanded categories expose real decisions", async ({ page }) => {
  await page.goto("/decisions");

  const expectations = [
    ["品質・使いやすさを高める", "Webサイトの使いやすさを検証したい", "最初に整備するテストを選びたい"],
    ["安全性を高める", "Webアプリのログイン方法を選びたい", "最初に導入するセキュリティ検査を選びたい"],
    ["データ・生成AIを活用する", "自社資料に答える質問機能を作りたい", "データを分かりやすく可視化したい"],
    ["計測して改善する", "実際の表示品質を継続して測りたい", "公開後の画面エラーを見つけたい"]
  ] as const;

  for (const [category, firstDecision, secondDecision] of expectations) {
    await page.getByRole("radio", { name: new RegExp(category) }).check();
    const purposeNavigation = page.getByRole("navigation", { name: "具体的な目的を選ぶ" });
    await expect(purposeNavigation.getByRole("link", { name: firstDecision, exact: true })).toBeVisible();
    await expect(purposeNavigation.getByRole("link", { name: secondDecision, exact: true })).toBeVisible();
  }
});

test("book library shows covers, authors and direct links", async ({ page }) => {
  await page.goto("/books");

  const cards = page.locator(".book-library-card");
  await expect(cards).toHaveCount(bookResources.length);
  await expect(page.getByRole("heading", { name: "分野から本を探す" })).toBeVisible();
  const topicFilter = page.getByRole("group", { name: "書籍の分野を選ぶ" });
  await expect(topicFilter.getByRole("radio")).toHaveCount(bookTopics.length + 1);

  for (const book of bookResources) {
    const card = cards.filter({ has: page.getByRole("heading", { name: book.title, exact: true }) });
    await expect(card).toHaveCount(1);
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator("img")).toHaveAttribute("src", /^https:\/\//);
    await expect(card.locator("img")).toHaveAttribute("alt", /.+/);
    await expect.poll(() => card.locator("img").evaluate((image) => {
      const cover = image as HTMLImageElement;
      return cover.complete && cover.naturalWidth > 0;
    })).toBe(true);
    await expect(card.getByRole("link", { name: /出版社・公式ページを開く/ })).toHaveAttribute("href", book.url);
    await expect(card.getByRole("link", { name: /出版社・公式ページを開く/ })).toContainText("新しいタブで開きます");
    await expect(card).toContainText("著者：");
  }
  await expectStableLayout(page);
});

test("book library filters by topic, search and URL history", async ({ page }) => {
  await page.goto("/books");
  const accessibilityCount = bookTopicsWithCounts.find((topic) => topic.id === "accessibility")?.count ?? 0;
  const cards = page.locator(".book-library-card");

  await page.getByRole("radio", { name: /アクセシビリティ/ }).check();
  await expect(page).toHaveURL(/\/books#book-topic-accessibility$/);
  await expect(cards).toHaveCount(accessibilityCount);
  await expect(page.getByRole("heading", { name: "具体例と解決策で学ぶ Webアクセシビリティの教科書", exact: true })).toBeVisible();

  await page.getByRole("radio", { name: /セキュリティ・認証/ }).check();
  await expect(page).toHaveURL(/\/books#book-topic-security-auth$/);
  await page.goBack();
  await expect(page.getByRole("radio", { name: /アクセシビリティ/ })).toBeChecked();

  await page.getByRole("radio", { name: /すべての分野/ }).check();
  const search = page.getByRole("searchbox", { name: "書名・著者・学びたい内容で探す" });
  await search.fill("OpenID Connect");
  await expect(page.getByRole("status")).toHaveText("1冊の書籍が見つかりました");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("OpenID Connect入門");
  await search.fill("該当しない検索語");
  await expect(page.getByRole("button", { name: "検索と絞り込みを解除する" })).toBeVisible();
  await page.getByRole("button", { name: "検索と絞り込みを解除する" }).click();
  await expect(search).toBeFocused();
  await expect(cards).toHaveCount(bookResources.length);
});

test("decision approaches show related book covers without expanding details", async ({ page }) => {
  await page.goto("/decisions/3d-portfolio");

  const relatedBooks = page.locator(".approach-books");
  await expect(relatedBooks.first()).toBeVisible();
  await expect(relatedBooks.first().locator("img")).toBeVisible();
  await expect(relatedBooks.first().getByRole("link", { name: /The Book of Shaders/ })).toHaveAttribute("href", "https://thebookofshaders.com/?lan=jp");
});

test("accessibility decision exposes implementation, evaluation and participant books", async ({ page }) => {
  await page.goto("/decisions/accessibility-evaluation");

  const relatedBooks = page.locator(".approach-books");
  await expect(relatedBooks.getByRole("link", { name: /Webアクセシビリティの教科書/ }).first()).toBeVisible();
  await expect(relatedBooks.getByRole("link", { name: /Webアプリケーションアクセシビリティ/ }).first()).toBeVisible();
  await expect(relatedBooks.getByRole("link", { name: /ウェブ・インクルーシブデザイン/ }).first()).toBeVisible();
});

test("decision page recalculates after a condition toggle", async ({ page }) => {
  await page.goto("/decisions/3d-product-viewer");
  await expect(page.getByRole("heading", { name: "3D商品ビューアを作りたい" })).toBeVisible();
  await page.locator(".condition-chip").filter({ hasText: "ARが必要" }).click();
  await page.locator(".condition-chip").filter({ hasText: "短納期" }).click();
  await page.locator(".condition-chip").filter({ hasText: "単純表示が中心" }).click();
  const cards = page.locator(".approach-card");
  await expect(cards.first()).toContainText("model-viewer");
});

test("labs expose a ready signal", async ({ page }) => {
  await page.goto("/labs/threejs");
  await page.waitForFunction(() => window.__VTD_READY__ === true);
  expect(await page.evaluate(() => window.__VTD_METRICS__?.drawCalls)).toBeGreaterThanOrEqual(1);
});
