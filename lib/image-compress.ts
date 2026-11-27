import sharp from "sharp";

const MAX_EDGE = 1600;

export async function compressImage(
  payload: ArrayBuffer,
  contentType: string,
  accept: string,
): Promise<{ body: Buffer; type: string } | null> {
  if (!contentType.startsWith("image/") || contentType.includes("svg")) return null;
  const wantsAvif = accept.includes("image/avif");
  const wantsWebp = accept.includes("image/webp");
  if (!wantsAvif && !wantsWebp) return null;
  if (contentType.includes("avif")) return null;
  if (contentType.includes("webp") && !wantsAvif) return null;

  const pipeline = sharp(Buffer.from(payload), { failOn: "none" })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  if (wantsAvif) {
    return { body: await pipeline.avif({ quality: 50 }).toBuffer(), type: "image/avif" };
  }
  return { body: await pipeline.webp({ quality: 72 }).toBuffer(), type: "image/webp" };
}
