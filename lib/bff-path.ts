const ALLOWED =
  /^(?:lists|lists\/[^/]+|lists\/[^/]+\/items|lists\/[^/]+\/items\/reorder|lists\/[^/]+\/categories|lists\/[^/]+\/categories\/reorder|categories\/[^/]+|items\/[^/]+|items\/[^/]+\/refresh|items\/[^/]+\/image)$/;

/** Paths under the FastAPI `/api` prefix that this phase may proxy. */
export function allowedBackendPath(segments: string[]): string | null {
  if (segments.some((segment) => segment === "" || segment === "." || segment === ".."))
    return null;
  const path = segments.map((segment) => decodeURIComponent(segment)).join("/");
  if (path.includes("\\") || !ALLOWED.test(path)) return null;
  return path;
}
