# L'Atelier d'Ana - Charm & Jewelry Customizer ✦

Aplikasi web kriya perhiasan mewah kustomisasi penuh yang dirancang secara estetis menggunakan **React (TypeScript)**, **Vite**, **Tailwind CSS**, dan **Express Backend**.

## 🚀 Panduan Membuka Project di VSCode (Agar Tidak Merah/Error)

Jika Anda mengunduh project ini dalam bentuk **ZIP** dan membukanya di **VSCode**, silakan ikuti langkah-langkah mudah di bawah ini agar semua library terpasang dengan benar dan VSCode tidak menampilkan garis merah (error tipe data):

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal **Node.js** di komputer Anda (Disarankan versi 18 atau 20+). Anda bisa mengunduhnya dari [nodejs.org](https://nodejs.org/).

### 2. Memasang Dependensi (Install Dependencies)
Buka terminal di VSCode (`Ctrl + ~` atau `Cmd + ~` di Mac), lalu jalankan perintah berikut untuk menginstal semua library dan file definisi tipe data TypeScript:

```bash
npm install
```

> **Catatan:** Langkah ini wajib dilakukan segera setelah mengekstrak ZIP agar folder `node_modules` terbentuk dan mendeteksi semua library seperti `react`, `leaflet`, `lucide-react`, dan `motion`.

### 3. Menjalankan Server Pengembangan (Dev Server)
Untuk melihat aplikasi berjalan di browser komputer Anda, jalankan perintah berikut di terminal:

```bash
npm run dev
```

Aplikasi akan otomatis berjalan di alamat:  
👉 **`http://localhost:3000`**

---

## 🛠️ Struktur Project Utama

- `server.ts` - Entry point backend Express (REST API untuk produk, pesanan, asuransi, dll.).
- `/src/App.tsx` - Komponen utama antarmuka pengguna (UI) dengan interaksi real-time.
- `/src/serverDb.ts` - Database kriya lokal berbasis file JSON (`db.json`) untuk asuransi dan ketersediaan stok yang presisi.
- `/src/types.ts` - Definisi tipe TypeScript yang kokoh (Type-safe) agar VSCode mendeteksi kesalahan secara instan.
- `/src/components/` - Sub-komponen modular (Atelier builder, maps, checkout, dll.).
- `/src/assets/images/` - Asset gambar mahakarya kriya hasil regenerasi.

---

## ✨ Fitur-Fitur Premium yang Tersedia

1. **Atelier Customizer Virtual**: Rancang perhiasan dasar Anda sendiri (kalung, gelang, cincin, anting) dengan hiasan charm yang indah dan dinamis.
2. **Peta Pengiriman Kargo Real-time (Leaflet)**: Klik atau geser koordinat peniti pink di peta dunia nyata untuk memperkirakan jarak, estimasi tiba, serta asuransi kargo gratis.
3. **Gerbang Checkout QRIS Premium**: Dilengkapi simulasi verifikasi transfer QRIS mewah bersertifikasi kriya.
4. **Dashboard Admin**: Kelola stok kriya perhiasan dan pantau seluruh transaksi kustomisasi pelanggan secara langsung.

Selamat menikmati karya seni digital kriya perhiasan Anda! ✦
