# TikTok Downloader (tanpa watermark)

Struktur:
- index.html      -> halaman utama: form download, cara pakai, fitur, FAQ, footer
- api/download.js -> ambil info video (API tikwm.com)
- api/file.js     -> proxy supaya file langsung ter-download
- package.json

## Deploy ke Vercel (bisa dari HP)
1. Upload semua file ini ke repo GitHub baru (pertahankan folder `api/`).
2. Di vercel.com klik Add New > Project > pilih repo tadi > Deploy.
3. Selesai, buka link .vercel.app-nya.

Catatan: tidak bisa dibuka langsung dari file HTML (tanpa server), karena butuh folder `api/`.

## Peringatan
- Pakai untuk video milik sendiri atau yang kreatornya mengizinkan. Hormati hak cipta.
- Memakai API pihak ketiga (tikwm.com); kalau mereka mengubah/menutup layanan, edit `api/download.js`.
