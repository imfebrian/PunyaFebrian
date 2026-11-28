# Klipora (dulu SaveTok) - TikTok downloader tanpa watermark

Struktur:
- index.html            -> halaman utama (UI baru, pratinjau otomatis, progress unduhan, riwayat, FAQ)
- api/download.js       -> ambil info video (tikwm.com), Edge Runtime + cache + retry
- api/file.js           -> proxy file, Edge Runtime, streaming + dukung Range (unduhan 4 jalur & seek video)
- vercel.json           -> header keamanan & cache
- robots.txt, sitemap.xml, manifest.webmanifest, favicon.svg, og.png -> SEO & PWA
- google344126db611d7a2d.html -> verifikasi Google Search Console (dipertahankan)

## Wajib diganti sebelum deploy
Cari `GANTI-DOMAIN.com` lalu ganti dengan domain asli kamu di: index.html (canonical, og:url, og:image, twitter:image, JSON-LD), robots.txt, sitemap.xml.

## Deploy ke Vercel
1. Upload semua file ke repo GitHub (pertahankan folder `api/`).
2. Vercel > Add New > Project > pilih repo > Deploy.
3. Beli/sambungkan domain sendiri di Vercel > Settings > Domains (SEO jauh lebih baik dengan domain sendiri).

## SEO: langkah setelah deploy
1. Google Search Console > tambahkan properti domainmu > kirim `https://domainkamu/sitemap.xml`.
2. Minta pengindeksan halaman utama (URL Inspection > Request indexing).
3. Daftar juga di Bing Webmaster Tools.
4. Bagikan link di sosial media / komunitas supaya dapat backlink. Ranking tidak bisa dijamin, butuh waktu.

## Catatan
- Memakai API pihak ketiga (tikwm.com). Kalau mereka berubah, edit `api/download.js`.
- Pakai untuk video milik sendiri atau yang kreatornya mengizinkan. Hormati hak cipta.
- Nama "Klipora" belum saya temukan dipakai produk lain, tapi cek sendiri ketersediaan domain & merek sebelum dipakai resmi.
