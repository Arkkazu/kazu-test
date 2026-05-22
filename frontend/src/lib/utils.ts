export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function stripHtml(html: string | null | undefined, maxLength = 160): string {
  return html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) ?? "";
}
