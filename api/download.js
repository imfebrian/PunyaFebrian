// Ambil info video TikTok lewat API pihak ketiga (tikwm.com).
// Jalan di Edge Runtime: cold start jauh lebih cepat daripada serverless Node.
export const config = { runtime: 'edge' };

const BASE = 'https://www.tikwm.com';
const abs = (u) => (u && u.startsWith('/') ? BASE + u : u || null);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Cache sementara di memori (per instance). Link yang sama tidak perlu ditanyakan ulang.
const cache = new Map();
const TTL = 5 * 60 * 1000;

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra }
  });

async function lookup(raw) {
  let last;
  for (let i = 0; i < 3; i++) {
    const r = await fetch(`${BASE}/api/?url=${encodeURIComponent(raw)}&hd=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(9000)
    });
    last = await r.json();
    if (last.code === 0 && last.data) return last;
    // tikwm membatasi ±1 request/detik. Kalau kena batas, tunggu sebentar lalu coba lagi.
    if (/limit/i.test(String(last.msg || ''))) { await wait(1100); continue; }
    break;
  }
  return last;
}

export default async function handler(req) {
  try {
    const raw = (new URL(req.url).searchParams.get('url') || '').trim();
    let host = '';
    try { host = new URL(raw).hostname.toLowerCase(); } catch {}
    if (!(host === 'tiktok.com' || host.endsWith('.tiktok.com'))) {
      return json({ error: 'Link harus dari tiktok.com (termasuk vm.tiktok.com / vt.tiktok.com).' }, 400);
    }

    const hit = cache.get(raw);
    if (hit && Date.now() - hit.t < TTL) {
      return json(hit.d, 200, { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600', 'x-cache': 'HIT' });
    }

    const j = await lookup(raw);
    if (!j || j.code !== 0 || !j.data) {
      return json({ error: 'Video tidak ditemukan, akunnya privat, atau sudah dihapus.' }, 404);
    }

    const d = j.data;
    const out = {
      id: d.id,
      title: d.title || '',
      cover: abs(d.cover),
      duration: d.duration,
      plays: d.play_count,
      likes: d.digg_count,
      author: { name: d.author?.nickname, id: d.author?.unique_id, avatar: abs(d.author?.avatar) },
      video: abs(d.play),        // tanpa watermark (SD)
      videoHd: abs(d.hdplay),    // tanpa watermark (HD), kalau ada
      size: d.size || 0,         // perkiraan ukuran (byte), dipakai untuk progress
      hdSize: d.hd_size || 0,
      music: abs(d.music),
      images: (d.images || []).map(abs)
    };

    if (cache.size > 200) cache.clear();
    cache.set(raw, { t: Date.now(), d: out });
    return json(out, 200, { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600', 'x-cache': 'MISS' });
  } catch {
    return json({ error: 'Server gagal memproses. Coba lagi sebentar.' }, 500);
  }
}
