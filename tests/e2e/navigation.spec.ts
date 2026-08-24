import { test, expect } from "@playwright/test";
import content from "../../src/generated/content.json";
import { getFeaturedSituationChoices, getVisibleSituationCategories } from "../../src/lib/situation-categories";
import type { Situation } from "../../src/lib/types";

const publishedSituations = content.situations.filter((situation) => situation.published) as Situation[];
const visibleCategories = getVisibleSituationCategories(publishedSituations);
const featuredSituations = getFeaturedSituationChoices(visibleCategories);

test("home exposes representative goals and every category route", async ({ page }) => {
  await page.goto("/");

  const mainNavigation = page.getByRole("navigation", { name: "メインナビゲーション" });
  await expect(mainNavigation.getByRole("link", { name: "技術判断" })).toBeVisible();
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

  const layout = await page.evaluate(() => ({
    maxFontSize: Math.max(...Array.from(document.body.querySelectorAll("*")).filter((element) => {
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    }).map((element) => Number.parseFloat(getComputedStyle(element).fontSize))),
    overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  }));
  expect(layout.maxFontSize).toBeLessThanOrEqual(32);
  expect(layout.overflows).toBe(false);

  await goals.getByRole("link", { name: /問い合わせフォームを安全に運用したい/ }).click();
  await expect(page).toHaveURL(/\/decisions\/secure-contact-form$/);
});

test("category links restore the selected directory from the URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "カテゴリーで絞る" }).getByRole("link", { name: /品質・使いやすさを高める/ }).click();

  await expect(page).toHaveURL(/\/decisions#category-quality$/);
  await expect(page.getByRole("button", { name: "品質・使いやすさを高める", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Webサイトの使いやすさを検証したい", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "最初に整備するテストを選びたい", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "安全性を高める", exact: true }).click();
  await expect(page).toHaveURL(/\/decisions#category-security$/);
  await page.goBack();
  await expect(page.getByRole("button", { name: "品質・使いやすさを高める", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.goForward();
  await expect(page.getByRole("button", { name: "安全性を高める", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("category directory filters and searches decisions", async ({ page }) => {
  await page.goto("/decisions");
  await expect(page.getByRole("group", { name: "やりたいことから絞る" }).getByRole("button")).toHaveCount(visibleCategories.length + 1);
  await page.getByRole("button", { name: /商品を見せる/ }).click();
  await expect(page.getByRole("heading", { name: "3D商品ビューアを作りたい" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "3Dポートフォリオサイトを作りたい" })).toBeHidden();
  await page.getByRole("searchbox", { name: "キーワードで探す" }).fill("商品");
  await expect(page.getByText("1件の技術判断が見つかりました")).toBeVisible();
  await page.getByRole("searchbox", { name: "キーワードで探す" }).fill("該当しない検索語");
  await expect(page.getByRole("status")).toHaveText("0件の技術判断が見つかりました");
  await page.getByRole("button", { name: "絞り込みを解除する" }).click();
  await expect(page.getByRole("searchbox", { name: "キーワードで探す" })).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(`${publishedSituations.length}件の技術判断が見つかりました`);
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
    await page.getByRole("button", { name: category, exact: true }).click();
    await expect(page.getByRole("heading", { name: firstDecision, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: secondDecision, exact: true })).toBeVisible();
  }
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
