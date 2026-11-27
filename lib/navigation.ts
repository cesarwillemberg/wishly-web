const LEGACY_PATH = /^\/(?:list\/[^/?#]+|configuracoes|compartilhar|l\/[^/?#]+|c\/[^/?#]+|entrar)$/;

/** Maps a Flutter hash route (`#/list/...`) to a real path. Returns null when it should stay. */
export function pathFromLegacyHash(hash: string): string | null {
  if (!hash.startsWith("#/")) return null;
  const raw = hash.slice(1);
  const queryAt = raw.indexOf("?");
  let path = queryAt === -1 ? raw : raw.slice(0, queryAt);
  const query = queryAt === -1 ? "" : raw.slice(queryAt);
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path.includes("..") || path.includes("//") || path.includes("\\")) return null;
  if (!LEGACY_PATH.test(path)) return null;
  return `${path}${query}`;
}

/** Keeps post-login redirects inside this site. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  const path = value.split("?")[0] ?? "";
  if (path.includes("..")) return "/";
  if (path.startsWith("/entrar") || path.startsWith("/api")) return "/";
  return value;
}

export const HASH_REDIRECT_SCRIPT = `(function(){try{var hash=location.hash||"";if(hash.slice(0,2)!=="#/")return;var raw=hash.slice(1);var q=raw.indexOf("?");var path=q===-1?raw:raw.slice(0,q);var query=q===-1?"":raw.slice(q);if(path.length>1&&path.charAt(path.length-1)==="/")path=path.slice(0,-1);if(path.indexOf("..")!==-1||path.indexOf("//")!==-1||path.indexOf("\\\\")!==-1)return;if(!/^\\/(?:list\\/[^/?#]+|configuracoes|compartilhar|l\\/[^/?#]+|c\\/[^/?#]+|entrar)$/.test(path))return;var target=path+query;if(location.pathname+location.search===target)return;location.replace(target);}catch(e){}})();`;
