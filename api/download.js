// Mengambil info video TikTok lewat API pihak ketiga (tikwm.com)
const BASE = 'https://www.tikwm.com';
const abs = (u) => (u && u.startsWith('/') ? BASE + u : u || null);

export default async function handler(req, res) {
  try {
    const raw = String(req.query.url || '').trim();
    let host = '';
    try { host = new URL(raw).hostname.toLowerCase(); } catch {}
    if (!(host === 'tiktok.com' || host.endsWith('.tiktok.com'))) {
      return res.status(400).json({ error: 'Link harus dari tiktok.com (termasuk vm.tiktok.com / vt.tiktok.com).' });
    }

    const r = await fetch(`${BASE}/api/?url=${encodeURIComponent(raw)}&hd=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const j = await r.json();
    if (j.code !== 0 || !j.data) {
      return res.status(404).json({ error: j.msg || 'Video tidak ditemukan atau akunnya privat.' });
    }
    const d = j.data;
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({
      id: d.id,
      title: d.title || '',
      cover: abs(d.cover),
      duration: d.duration,
      plays: d.play_count,
      likes: d.digg_count,
      author: { name: d.author?.nickname, id: d.author?.unique_id, avatar: abs(d.author?.avatar) },
      video: abs(d.play),      // tanpa watermark (SD)
      videoHd: abs(d.hdplay),  // tanpa watermark (HD), kalau ada
      music: abs(d.music),
      images: (d.images || []).map(abs) // untuk postingan slideshow/foto
    });
  } catch (e) {
    return res.status(500).json({ error: 'Server gagal memproses. Coba lagi sebentar.' });
  }
} 
