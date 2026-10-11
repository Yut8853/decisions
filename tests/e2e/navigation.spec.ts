import { test, expect, type Page } from "@playwright/test";
import content from "../../src/generated/content.json";
import { getBookTopicsWithCounts } from "../../src/lib/book-topics";
import { getVisibleSituationCategories } from "../../src/lib/situation-categories";
import type { BookResource, Situation } from "../../src/lib/types";

const publishedSituations = content.situations.filter((situation) => situation.published) as Situation[];
const publishedGoals = content.goals.filter((goal) => goal.published);
const visibleCategories = getVisibleSituationCategories(publishedSituations);
const bookResources = content.resources.filter((resource) => resource.type === "book") as BookResource[];
const japaneseBookResources = bookResources.filter((book) => book.language.startsWith("日本語"));
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

test("home starts from goals and links to learning routes", async ({ page }) => {
  await page.goto("/");

  const mainNavigation = page.getByRole("navigation", { name: "メインナビゲーション" });
  await expect(mainNavigation.getByRole("link", { name: "学ぶ順番" })).toBeVisible();
  await expect(mainNavigation.getByRole("link", { name: "技術判断" })).toBeVisible();
  await expect(mainNavigation.getByRole("link", { name: "書籍" })).toBeVisible();

  const hero = page.locator(".hero");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(hero.getByRole("heading", { level: 1, name: /何をしたいですか？/ })).toBeVisible();
  await expect(hero.locator("ol > li")).toHaveCount(3);
  await expect(hero.getByRole("link", { name: "やりたいことを選ぶ" })).toHaveAttribute("href", "#goals");

  for (const goal of publishedGoals) {
    await expect(page.locator(`#goals a[href="/goals/${goal.slug}"]`)).toHaveCount(1);
  }
  await expectStableLayout(page);

  await page.locator('#goals a[href="/goals/homepage"]').click();
  await expect(page).toHaveURL(/\/goals\/homepage$/);
});

test("home hero stays readable at 320px and honors reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expectStableLayout(page);

  const primaryAction = page.locator(".hero").getByRole("link", { name: "やりたいことを選ぶ" });
  const actionBox = await primaryAction.boundingBox();
  expect(actionBox).not.toBeNull();
  expect(actionBox!.height).toBeGreaterThanOrEqual(44);

  await primaryAction.focus();
  const focusStyle = await primaryAction.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: Number.parseFloat(style.outlineWidth) };
  });
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);

  const scrollBehavior = await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior);
  expect(scrollBehavior).toBe("auto");

  await primaryAction.click();
  await expect(page).toHaveURL(/\/#goals$/);
  const headingBox = await page.getByRole("heading", { level: 2, name: "近いものを選んでください" }).boundingBox();
  expect(headingBox).not.toBeNull();
  expect(headingBox!.y).toBeGreaterThanOrEqual(50);
  expect(headingBox!.y).toBeLessThan(180);
});

test("goal page shows ordered steps, a branch, detours, version cautions and the school guidance", async ({ page }) => {
  await page.goto("/goals/homepage");
  await expect(page.getByRole("heading", { level: 1, name: "お店や会社のホームページを作りたい" })).toBeVisible();

  const steps = page.locator("section.route-section > ol > li.route-step h3");
  await expect(steps).toHaveText(["Webの仕組み", "HTML", "CSS", "JavaScriptの基礎"]);

  await expect(page.getByRole("heading", { name: "必要に応じて、WordPressを学ぶ" })).toBeVisible();
  const wordpress = page.locator(".branch-section .resource-card").filter({ hasText: "WordPress" });
  await expect(wordpress.locator(".resource-caution")).toContainText("現行は7.0");

  const skip = page.locator(".skip-list");
  await expect(skip).toContainText("jQuery");
  await expect(skip).toContainText("Ruby");

  await expect(page.locator(".school-cta")).toHaveCount(2);
  await expect(page.locator(".school-cta a").first()).toHaveAttribute("href", /school\.junkbranding\.com.*utm_content=homepage-/);
  await expectStableLayout(page);
});

test("non-web goals do not show the school guidance", async ({ page }) => {
  await page.goto("/goals/company-security");
  await expect(page.locator(".school-cta")).toHaveCount(0);
  await expect(page.locator(".resource-card").filter({ hasText: "情報セキュリティマネジメント試験" }).locator(".resource-caution")).toContainText("2027年度");
});

test("legacy skill page explains why it is not in the route", async ({ page }) => {
  await page.goto("/skills/jquery");
  await expect(page.locator(".legacy-box")).toContainText("これから学ぶ順番には入れていません");
  await expect(page.getByRole("link", { name: /お店や会社のホームページを作りたい/ })).toBeVisible();
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
  await expect(categoryFilter.getByRole("radio", { name: /商品を見せる/ })).toBeChecked();
  await expect(page).toHaveURL(/\/decisions#category-products$/);

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

test("book library shows covers, authors and direct links", async ({ page }) => {
  await page.goto("/books");

  const cards = page.locator(".book-library-card");
  await expect(cards).toHaveCount(bookResources.length);
  await expect(page.locator(".book-library-note")).toContainText(`現在${japaneseBookResources.length}冊`);
  await expect(page.getByRole("heading", { name: "分野から本を探す" })).toBeVisible();
  const topicFilter = page.getByRole("group", { name: "書籍の分野を選ぶ" });
  await expect(topicFilter.getByRole("radio")).toHaveCount(bookTopicsWithCounts.filter((topic) => topic.count > 0).length + 1);

  for (const book of bookResources) {
    const card = cards.filter({ has: page.getByRole("heading", { name: book.title, exact: true }) });
    await expect(card).toHaveCount(1);
    await card.scrollIntoViewIfNeeded();
    if (book.coverImageUrl) {
      await expect(card.locator("img")).toHaveAttribute("src", /^https:\/\//);
      await expect(card.locator("img")).toHaveAttribute("alt", /.+/);
      await expect.poll(() => card.locator("img").evaluate((image) => {
        const cover = image as HTMLImageElement;
        return cover.complete && cover.naturalWidth > 0;
      })).toBe(true);
    } else {
      await expect(card.locator(".book-cover-placeholder")).toHaveText(book.title);
    }
    await expect(card.getByRole("link", { name: /書籍の詳細を開く/ })).toHaveAttribute("href", book.url);
    await expect(card.getByRole("link", { name: /書籍の詳細を開く/ })).toContainText("新しいタブで開きます");
    await expect(card).toContainText("著者：");
  }

  for (const section of await page.locator(".book-topic-section").all()) {
    const languages = await section.locator(".book-library-labels li:first-child").allTextContents();
    const firstEnglishIndex = languages.findIndex((language) => !language.startsWith("日本語"));
    if (firstEnglishIndex >= 0) {
      expect(languages.slice(firstEnglishIndex).every((language) => !language.startsWith("日本語"))).toBe(true);
    }
  }
  await expectStableLayout(page);
});

test("each approach lists learning resources with a reason for that approach", async ({ page }) => {
  await page.goto("/decisions/3d-product-viewer");

  const paths = page.locator(".learning-path");
  await expect(paths.first()).toBeVisible();
  for (const path of await paths.all()) {
    await expect(path.locator(".learning-stage").first()).toContainText("最初に読む");
    for (const reason of await path.locator(".learning-reason").all()) {
      await expect(reason).not.toBeEmpty();
    }
  }
});

test("condition-specific books appear only after choosing the condition", async ({ page }) => {
  await page.goto("/decisions/3d-product-viewer");
  const threeCard = page.locator(".approach-card").filter({ hasText: "Three.js + glTFによる商品ビューア" });
  await expect(threeCard.locator(".learning-item").filter({ hasText: "The Book of Shaders" })).toHaveCount(0);

  await page.locator(".condition-chip").filter({ hasText: "高度な独自表現" }).click();
  const shaderBook = threeCard.locator(".learning-item").filter({ hasText: "The Book of Shaders" });
  await expect(shaderBook).toHaveCount(1);
  await expect(shaderBook).toContainText("「高度な独自表現」を選んだため表示");
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
