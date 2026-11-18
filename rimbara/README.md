# RIMBARA Atelier

Situs katalog konsep parfum RIMBARA yang menampilkan Embun Rimba, Teduh Iris, dan Senja Kayu. Dibuat dengan HTML, CSS, JavaScript, Vite, dan Three.js.

## Jalankan di komputer

Gunakan Node.js 20.19+ pada seri 20 atau Node.js 22.12 ke atas, beserta npm. Jalankan perintah dari folder `rimbara`.

```sh
npm ci
npm run dev
```

Buka [http://127.0.0.1:5173/](http://127.0.0.1:5173/) atau alamat yang ditampilkan Vite jika port tersebut sedang dipakai.

## Build dan pemeriksaan

```sh
node check.mjs
npm run build
npm run preview
```

`check.mjs` memeriksa validasi tas, batas jumlah, harga, dan pergerakan botol saat halaman digulir. `npm run build` menghasilkan situs statis di `dist/`. `npm run preview` membuka hasil build secara lokal.

## Bagian proyek

| Lokasi | Isi |
| --- | --- |
| `index.html` | Struktur halaman, koleksi, dan panel informasi |
| `src/style.css` | Tipografi Cormorant Garamond dan Manrope, warna, serta layout responsif |
| `src/main.js` dan `src/cart.js` | Interaksi halaman, pilihan produk, dan logika tas |
| `src/scene.js` dan `src/motion.js` | Tampilan dan animasi botol 3D |
| `public/assets/` | Gambar WebP, `bottle.glb`, dan gambar pengganti jika WebGL tidak tersedia |
| `public/fonts/` | Font web dan lisensinya |
| `../assets/` | Gambar sumber dan file Blender yang dapat diedit |

Tas pilihan tersimpan di browser dan bisa diunduh sebagai file teks. Pembayaran dan pengiriman belum tersedia. Preview bisa dijalankan tanpa backend dan tanpa variabel lingkungan.
