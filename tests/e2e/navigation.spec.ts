import { test, expect } from "@playwright/test";
import content from "../../src/generated/content.json";

const publishedSituations = content.situations.filter((situation) => situation.published);

test("home exposes every current goal and keeps category routes", async ({ page }) => {
  await page.goto("/");

  const goals = page.getByRole("navigation", { name: "やりたいことから探す" });
  await expect(goals.getByRole("link")).toHaveCount(publishedSituations.length);
  for (const situation of publishedSituations) {
    const link = goals.locator(`a[href="/decisions/${situation.slug}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toContainText(situation.title);
  }

  const categories = page.getByRole("navigation", { name: "カテゴリで絞る" });
  await expect(categories.getByRole("link")).toHaveCount(5);
  await expect(categories.getByRole("heading", { name: "開発・運用を整える" })).toBeVisible();

  await goals.getByRole("link", { name: /問い合わせフォームを安全に運用したい/ }).click();
  await expect(page).toHaveURL(/\/decisions\/secure-contact-form$/);
});

test("category directory filters and searches decisions", async ({ page }) => {
  await page.goto("/decisions");
  await expect(page.getByRole("heading", { name: "サイトをつくる" })).toBeVisible();
  await page.getByRole("button", { name: /商品を見せる/ }).click();
  await expect(page.getByRole("heading", { name: "3D商品ビューアを作りたい" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "3Dポートフォリオサイトを作りたい" })).toBeHidden();
  await page.getByRole("searchbox", { name: "キーワードで探す" }).fill("商品");
  await expect(page.getByText("1件の技術判断が見つかりました")).toBeVisible();
});

test("new app and operations categories are discoverable", async ({ page }) => {
  await page.goto("/decisions");

  await page.getByRole("button", { name: /アプリ・機能をつくる/ }).click();
  await expect(page.getByRole("heading", { name: "サイト内検索を実装したい" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "問い合わせフォームを安全に運用したい" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Webサイト・アプリの公開先を選びたい" })).toBeHidden();

  await page.getByRole("button", { name: /開発・運用を整える/ }).click();
  await expect(page.getByRole("heading", { name: "Webサイト・アプリの公開先を選びたい" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "更新しやすいCMS構成を選びたい" })).toBeVisible();
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
