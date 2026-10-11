import type { Resource } from "./types";

export function isJapaneseReadableBook(book: Pick<Resource, "language">) {
  return book.language?.startsWith("日本語") ?? false;
}

export function compareBooksByLanguage(
  left: Pick<Resource, "language">,
  right: Pick<Resource, "language">
) {
  return Number(!isJapaneseReadableBook(left)) - Number(!isJapaneseReadableBook(right));
}

export function compareBooksByLanguageAndTitle(
  left: Pick<Resource, "language" | "title">,
  right: Pick<Resource, "language" | "title">
) {
  return compareBooksByLanguage(left, right) || left.title.localeCompare(right.title, "ja");
}
