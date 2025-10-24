export function buildMediaUrl(apiBase, raw) {
  if (!raw) return '';
  try {
    const s = String(raw).trim();
    if (!s) return '';
    // If it's an absolute URL, allow passthrough except when it points to /uploads/ on any host
    if (s.startsWith('http') || s.startsWith('//')) {
      try {
        const u = new URL(s, window.location.href);
        // If the absolute URL points to an uploads path, rewrite to proxy endpoint to avoid adblockers
        if (u.pathname && u.pathname.startsWith('/uploads/')) {
          return `${apiBase}/api/media/${u.pathname.substring('/uploads/'.length)}`;
        }
        return s;
      } catch (err) {
        // if URL parsing fails, fallthrough and treat as normal string
        return s;
      }
    }
    // allow data/blob URIs to pass through unchanged
    if (s.startsWith('data:') || s.startsWith('blob:')) return s;
    // If already an absolute path starting with /uploads/, map to /api/media/:file
    if (s.startsWith('/uploads/')) {
      return `${apiBase}/api/media/${s.substring('/uploads/'.length)}`;
    }
    // If starts with any other absolute path, just prefix API base
    if (s.startsWith('/')) return `${apiBase}${s}`;
    // Otherwise assume it's a filename stored in uploads and map to proxy endpoint
    return `${apiBase}/api/media/${s}`;
  } catch (e) {
    return '';
  }
}
