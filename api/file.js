// Proxy file: dipakai untuk pratinjau (streaming) dan unduhan.
// Edge Runtime + body di-stream langsung (tanpa buffering) + dukung header Range,
// sehingga browser bisa mengunduh beberapa potongan sekaligus dan video bisa di-seek.
export const config = { runtime: 'edge' };

const ALLOWED = ['tikwm.com', 'tiktokcdn.com', 'tiktokcdn-us.com', 'tiktokv.com', 'tiktokv.us', 'muscdn.com', 'byteicdn.com'];
const ok = (h) => ALLOWED.some((d) => h === d || h.endsWith('.' + d));

const MIME = { mp4: 'video/mp4', mp3: 'audio/mpeg', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export default async function handler(req) {
  try {
    const q = new URL(req.url).searchParams;
    let u;
    try { u = new URL(q.get('url') || ''); } catch { return new Response('URL tidak valid', { status: 400 }); }
    if (u.protocol !== 'https:' || !ok(u.hostname)) return new Response('URL tidak diizinkan', { status: 400 });

    const name = String(q.get('name') || 'klipora.mp4').replace(/[^\w.\-]/g, '_').slice(0, 80);
    const ext = (name.split('.').pop() || '').toLowerCase();

    const headers = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.tiktok.com/' };
    const range = req.headers.get('range');
    if (range) headers.Range = range;

    const r = await fetch(u, { headers, redirect: 'follow' });
    if (!(r.status === 200 || r.status === 206) || !r.body || !ok(new URL(r.url).hostname)) {
      return new Response('Gagal mengambil file', { status: 502 });
    }

    const out = new Headers();
    const up = r.headers.get('content-type') || '';
    out.set('content-type', MIME[ext] || (up && !/octet-stream/i.test(up) ? up : 'application/octet-stream'));
    out.set('accept-ranges', 'bytes');

    const len = r.headers.get('content-length');
    const cr = r.headers.get('content-range');
    if (len) out.set('content-length', len);
    if (cr) out.set('content-range', cr);
    // Ukuran total file (bukan ukuran potongan), dipakai untuk progress bar di browser.
    const total = cr ? cr.split('/')[1] : len;
    if (total && total !== '*') out.set('x-file-size', total);

    out.set(
      'content-disposition',
      q.get('inline') ? `inline; filename="${name}"` : `attachment; filename="${name}"`
    );
    out.set('cache-control', 'private, max-age=900');

    return new Response(r.body, { status: r.status, headers: out });
  } catch {
    return new Response('Error', { status: 500 });
  }
}
