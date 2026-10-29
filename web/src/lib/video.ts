/** Turns a pasted YouTube/Vimeo link into an embeddable player URL, or null if unrecognised. */
export function toEmbedUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}?rel=0`;
    if (host === "youtube.com") {
      const id = url.searchParams.get("v") ?? url.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/)?.[2];
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
    }
    if (host === "player.vimeo.com") return raw;
    if (host === "vimeo.com") {
      // vimeo.com/123456 or unlisted vimeo.com/123456/abcdef (privacy hash)
      const [id, hash] = url.pathname.split("/").filter(Boolean);
      if (!id || !/^\d+$/.test(id)) return null;
      return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`;
    }
  } catch {
    /* not a URL */
  }
  return null;
}
