// Proxy download supaya file langsung ter-unduh (bukan cuma terbuka di tab baru)
import { Readable } from 'node:stream';

const ALLOWED = ['tikwm.com', 'tiktokcdn.com', 'tiktokcdn-us.com', 'tiktokv.com', 'tiktokv.us', 'muscdn.com', 'byteicdn.com'];
const ok = (h) => ALLOWED.some((d) => h === d || h.endsWith('.' + d));

export default async function handler(req, res) {
  try {
    const u = new URL(String(req.query.url || ''));
    if (u.protocol !== 'https:' || !ok(u.hostname)) return res.status(400).send('URL tidak diizinkan');
    const name = String(req.query.name || 'tiktok.mp4').replace(/[^\w.\-]/g, '_').slice(0, 80);

    const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.tiktok.com/' } });
    if (!r.ok || !r.body || !ok(new URL(r.url).hostname)) return res.status(502).send('Gagal mengambil file');

    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/octet-stream');
    const len = r.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    Readable.fromWeb(r.body).pipe(res);
  } catch {
    res.status(500).send('Error');
  }
} 
