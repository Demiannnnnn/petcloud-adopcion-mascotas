export function buildMediaUrl(apiBase, raw) {
  if (!raw) return '';
  try {
    const s = String(raw).trim();
    if (!s) return '';
    // allow full URLs and data/blob URIs to pass through unchanged
    if (s.startsWith('http') || s.startsWith('data:') || s.startsWith('blob:') || s.startsWith('//')) return s;
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
