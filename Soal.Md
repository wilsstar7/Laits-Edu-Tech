# DOKUMENTASI SPESIFIKASI ASESMEN PSIKOLOGI - PERSONA ACADEMY

---

## BAGIAN 1: KONTEKS EKOSISTEM & VISI PRODUK (BLUEPRINT SUMMARY)

### 1.1 Konsep Utama

**Persona Academy** adalah layanan pendidikan privat premium (_assessment-led tutoring_) yang menggabungkan diagnostik psikologi dengan bimbingan belajar personal[cite: 1]. Layanan ini memetakan kecerdasan dan cara belajar terbaik setiap anak terlebih dahulu, kemudian mencocokkannya dengan guru privat yang dilatih khusus untuk metode tersebut[cite: 1].

### 1.2 Produk Utama (Core Products)

1. **Fase 1: Diagnostic Assessment (Tes Pemetaan Diri)**
   Layanan tes komprehensif (_VAK, Dominasi Otak, MBTI, Multiple Intelligences, hingga Holland RIASEC_) untuk menemukan fondasi kognitif dan karakter belajar siswa[cite: 1].
2. **Fase 2: Personalized Private Tutoring (Kursus Privat)**
   Layanan bimbingan belajar jenjang SD, SMP, dan SMA untuk berbagai mata pelajaran yang kurikulum dan cara penyampaiannya dirancang khusus berdasarkan hasil tes asesmen di Fase 1[cite: 1].

### 1.3 Platform & Ekosistem Digital

- **Website Resmi Persona Academy:** Berfungsi sebagai _hub_ sentral yang terintegrasi (_End-to-End_), mencakup pendaftaran, pelaksanaan tes asesmen online, hingga portal pemantauan belajar siswa (_Monthly Progress Report_ & _Visual Dashboard_) yang dapat diakses oleh orang tua secara aman dan eksklusif[cite: 1, 2].

### 1.4 Nilai Jual Unik (3 Pilar Competitive Advantages)

1. **Intelligence-Based Matching (Pencocokan Berbasis Kecerdasan):** Metode pengajaran setiap mata pelajaran disesuaikan secara presisi dengan jalur kecerdasan dominan anak (contoh: anak Visual-Spasial diajarkan Matematika menggunakan peta pikiran dan grafik, bukan sekadar hafalan rumus)[cite: 1].
2. **Specialized Trained Tutors (Tutor Tersertifikasi Metode):** Guru melalui pelatihan khusus untuk mengubah gaya mengajar (_shapeshifting_) secara dinamis menyesuaikan tipe kecerdasan dan kepribadian (_MBTI_) murid[cite: 1].
3. **Comprehensive Visual Dashboard (Dasbor Analitik Estetik):** Digitalisasi progres belajar ke dalam dashboard UI/UX modern yang mengubah data akademik, perkembangan karakter belajar, tingkat fokus, dan rekomendasi psikologis tutor menjadi grafik yang mudah dipahami orang tua[cite: 2].

---

## BAGIAN 2: ARSITEKTUR 3 PAKET ASESMEN (KATALOG SISTEM)

Tabel berikut memetakan struktur ketiga paket asesmen di dalam sistem website Persona Academy:

| Kode Paket  | Nama Paket                                                          | Status Implementasi    | Jenis Asesmen                            | Sub-Instrumen / Modul Tes                                                                                                                                                                | Target Usia                   | Deliverables (Keluaran)                                                                                                                    | Peran Operasional & Komersial                                                                                                                                                                                              |
| :---------- | :------------------------------------------------------------------ | :--------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PAKET 1** | **Persona Modality** _(Fondasi Teknis & Cara Belajar)_[cite: 3]     | **ACTIVE (Tahap 1)**   | Kuesioner _(Cukup Akurat)_[cite: 3]      | 1. Sensory Modality (VAK) (`PM-VAK-01`)<br>2. Brain Dominance (`PM-HEM-02`)<br>3. Screening Kebiasaan Belajar (`PM-SKB-03`)[cite: 3, 14, 19]                                             | SD, SMP, SMA[cite: 5, 14, 19] | Hasil Asesmen + Rekomendasi Penataan Lingkungan Belajar di Rumah[cite: 3].                                                                 | Produk pembuka (_entry-level_)[cite: 3]. Menyelesaikan 100% masalah hambatan belajar teknis harian dan menjadi instruksi dasar guru les privat mengenai cara mempresentasikan materi agar anak tidak cepat bosan[cite: 3]. |
| **PAKET 2** | **Persona Potential** _(Eksplorasi Karakter & Kecerdasan)_[cite: 3] | **UPCOMING (Tahap 2)** | Semi Practical _(Akurat)_[cite: 3]       | • Seluruh modul Paket 1 (`Persona Modality`)<br>4. Tipologi Kepribadian / Adaptasi MBTI (`PP-MBTI-02`)<br>5. Multiple Intelligences / 8 Kecerdasan Majemuk (`PP-MI-03`)[cite: 3, 23, 29] | SD hingga SMP[cite: 4]        | Deliverables Paket 1 + Sesi Konsultasi Edukatif (45 menit)[cite: 3].                                                                       | Produk utama (_hero product_)[cite: 4]. Menjawab siapa anak ini sebenarnya dan di mana letak bakatnya, serta mencegah bentrok emosional antara guru/orang tua dengan anak[cite: 3, 4].                                     |
| **PAKET 3** | **Persona Mastery** _(Spesialisasi & Peta Jalan Karier)_[cite: 4]   | **UPCOMING (Tahap 3)** | Practical _(Keakuratan Tinggi)_[cite: 4] | • Seluruh modul Paket 1 & Paket 2<br>6. Holland RIASEC (Peminatan Studi & Karier)<br>7. Academic Goal Setting (Pemetaan Target Jurusan & _Gap Analysis_ Rapor)[cite: 4]                  | SMP Akhir & SMA[cite: 4]      | Master Learning & Pathway Portfolio (10–12 halaman) + Sesi Konsultasi Mendalam (60 menit) + Akses Prioritas _Senior Tutor Match_[cite: 4]. | Paket premium (_high-ticket_) yang berfokus pada strategi menembus jurusan sekolah/kampus impian dan landasan program les privat kontrak panjang (semesteran/tahunan)[cite: 4].                                            |

---

## BAGIAN 3: SPESIFIKASI LENGKAP PAKET 1 — PERSONA MODALITY

Paket 1 terdiri dari **3 Modul Asesmen Berurutan** dengan total keseluruhan maksimal **65 butir soal** (untuk jenjang SMA)[cite: 6, 14, 19].

---

### MODUL 1.1: SENSORY MODALITY (VAK)

- **Kode Modul:** `PM-VAK-01`
- **Fokus Pengukuran:** Penerimaan dan Pemrosesan Informasi[cite: 6]
- **Waktu Pengerjaan:** 7–10 menit (maksimal 15 menit)[cite: 5]
- **Target Subjek & Aturan Administrasi:** Siswa usia 8–18 tahun (SD Kelas 3 hingga SMA Kelas 12)[cite: 5]. Untuk usia SD bawah (Kelas 1–2), instrumen dibacakan oleh konselor atau didampingi orang tua[cite: 5].
- **Aturan Filter Jumlah Soal Berdasarkan Jenjang (Leveling Rule):**
  - **SD:** 15 Soal (Menampilkan Soal Nomor 1 s.d. 15)[cite: 6]
  - **SMP:** 20 Soal (Menampilkan Soal Nomor 1 s.d. 20)[cite: 6]
  - **SMA:** 30 Soal (Menampilkan Soal Nomor 1 s.d. 30)[cite: 6]

#### A. Landasan Teori & Definisi Operasional Variabel

Instrumen ini didasarkan pada model modalitas belajar sensori Fleming (_VARK Model_) yang disederhanakan menjadi tri-modalitas (_Visual, Auditory, Kinesthetic_) untuk kebutuhan diagnostik edukatif dasar pada jenjang usia sekolah (SD hingga SMA)[cite: 5]. Asumsinya adalah setiap anak memiliki preferensi biologis dan neurologis dalam menerima, memproses, dan menyimpan informasi baru melalui salah satu atau kombinasi gerbang sensori[cite: 5].

1. **Visual (`V`):** Kecenderungan kognitif anak yang mengandalkan indra penglihatan[cite: 5]. Anak membutuhkan representasi grafis, teks tertulis, warna, spasial, dan demonstrasi visual untuk mengonstruksi pemahaman[cite: 5].
2. **Auditory (`A`):** Kecenderungan kognitif anak yang mengandalkan indra pendengaran dan komunikasi verbal[cite: 5]. Anak memproses konsep secara optimal melalui diskusi, penjelasan lisan, ritme suara, dan pengulangan verbal[cite: 5].
3. **Kinesthetic (`K`):** Kecenderungan kognitif anak yang mengandalkan integrasi fisik, sensasi taktil, dan memori motorik[cite: 5]. Anak membutuhkan pengalaman langsung, manipulasi objek nyata, dan gerakan tubuh untuk mempertahankan fokus serta memvalidasi materi[cite: 5].

#### B. Instruksi Pengerjaan (Ditampilkan di Layar Siswa)

> _"Pilihlah satu jawaban yang paling sering kamu lakukan saat sedang belajar atau menghadapi sesuatu yang baru. Pilihlah jawaban yang paling membuatmu merasa nyaman, bukan jawaban yang menurutmu 'paling pintar'."_[cite: 6]

#### C. Bank Soal Lengkap `PM-VAK-01` (30 Butir)

##### Bagian Dasar (Soal 1–15 | Untuk SD, SMP, SMA)

**1. Ketika kamu belajar materi baru di kelas, hal apa yang membuatmu paling cepat mengerti?**[cite: 6]

- [ ] **A.** Memperhatikan tulisan, gambar, atau video yang ditunjukkan guru `[Indikator: V]`[cite: 6]
- [ ] **B.** Mendengarkan suara penjelasan guru dengan saksama `[Indikator: A]`[cite: 6]
- [ ] **C.** Mencoba langsung mempraktikkan atau mengerjakan contoh soalnya `[Indikator: K]`[cite: 6]

**2. Jika kamu harus merakit mainan baru atau menggunakan barang yang belum pernah kamu pakai, apa yang kamu lakukan?**[cite: 6]

- [ ] **A.** Melihat gambar petunjuk atau menonton video tutorialnya `[Indikator: V]`[cite: 6]
- [ ] **B.** Meminta orang lain membacakan petunjuknya atau bertanya cara pakainya `[Indikator: A]`[cite: 6]
- [ ] **C.** Langsung membongkar dan mencoba-coba memainkannya dengan tangan `[Indikator: K]`[cite: 7]

**3. Saat kamu mencoba mengingat cara mengeja atau menulis kata bahasa Inggris yang sulit, caramu mengingatnya adalah...**[cite: 7]

- [ ] **A.** Membayangkan bentuk tulisan kata tersebut di dalam kepalamu `[Indikator: V]`[cite: 7]
- [ ] **B.** Mengeja huruf-hurufnya dengan suara pelan atau membacanya keras-keras `[Indikator: A]`[cite: 7]
- [ ] **C.** Menuliskan kata itu di atas kertas berkali-kali sampai tanganmu terbiasa `[Indikator: K]`[cite: 7]

**4. Jika kamu harus menghafal banyak materi untuk ulangan besok, caramu belajar adalah...**[cite: 7]

- [ ] **A.** Membaca catatan sambil memberi garis bawah atau stabilo warna-warni `[Indikator: V]`[cite: 7]
- [ ] **B.** Menghafal sambil bersuara atau meminta orang tua/teman memberikan tanya jawab lisan `[Indikator: A]`[cite: 7]
- [ ] **C.** Menghafal sambil berjalan mondar-mandir di kamar atau memainkan pena di tangan `[Indikator: K]`[cite: 7]

**5. Apa hal yang paling sering membuat konsentrasimu langsung buyar saat sedang serius belajar?**[cite: 7]

- [ ] **A.** Meja yang sangat berantakan atau ada orang yang mondar-mandir di depanmu `[Indikator: V]`[cite: 7]
- [ ] **B.** Suara TV, obrolan orang, atau suara bising dari luar rumah `[Indikator: A]`[cite: 7]
- [ ] **C.** Kursi yang tidak nyaman atau dilarang bergerak sama sekali dalam waktu lama `[Indikator: K]`[cite: 7]

**6. Ketika temanmu bertanya jalan menuju suatu tempat, bagaimana caramu menjelaskannya?**[cite: 7]

- [ ] **A.** Menggambarkan peta di kertas atau mencontohkan denahnya pakai tangan `[Indikator: V]`[cite: 7]
- [ ] **B.** Memberitahu arahnya lewat ucapan secara detail (misal: "nanti belok kanan di lampu merah") `[Indikator: A]`[cite: 7]
- [ ] **C.** Menunjuk arahnya dengan gerakan tubuh atau mengajaknya jalan bersama `[Indikator: K]`[cite: 7]

**7. Setelah pulang dari jalan-jalan atau liburan sekolah, hal apa yang paling kamu ingat dari tempat tersebut?**[cite: 7]

- [ ] **A.** Pemandangannya, warna bangunannya, atau foto-foto yang diambil `[Indikator: V]`[cite: 7]
- [ ] **B.** Suara suasananya, lagu yang diputar, atau obrolan seru selama di jalan `[Indikator: A]`[cite: 7]
- [ ] **C.** Aktivitas yang dilakukan, makanan yang dicoba, atau rasa lelah/senangnya `[Indikator: K]`[cite: 8]

**8. Jika disuruh memilih tugas atau PR dari sekolah, mana yang paling kamu sukai?**[cite: 8]

- [ ] **A.** Membuat poster, peta pikiran (mind map), atau presentasi bergambar `[Indikator: V]`[cite: 8]
- [ ] **B.** Membuat rekaman suara, mengikuti debat, atau presentasi berbicara `[Indikator: A]`[cite: 8]
- [ ] **C.** Membuat kerajinan tangan, eksperimen sains, atau tugas olahraga `[Indikator: K]`[cite: 8]

**9. Saat kamu sedang membaca buku cerita atau novel, apa yang terjadi saat kamu membacanya?**[cite: 8]

- [ ] **A.** Kamu membayangkan adegan ceritanya seperti menonton film di dalam pikiran `[Indikator: V]`[cite: 8]
- [ ] **B.** Kamu seolah-olah mendengar suara tokoh-tokohnya berbicara di kepalamu `[Indikator: A]`[cite: 8]
- [ ] **C.** Kamu ikut merasa tegang, sering mengubah posisi duduk, atau ikut menggerakkan tangan saat adegan seru `[Indikator: K]`[cite: 8]

**10. Jika ada dua temanmu yang sedang bertengkar di kelas, hal apa yang pertama kali kamu perhatikan?**[cite: 8]

- [ ] **A.** Ekspresi wajah marah mereka atau gerakan tubuh mereka `[Indikator: V]`[cite: 8]
- [ ] **B.** Nada suara mereka yang meninggi atau kata-kata yang mereka ucapkan `[Indikator: A]`[cite: 8]
- [ ] **C.** Suasana kelas yang jadi tegang atau dorong-dorongan fisik yang terjadi `[Indikator: K]`[cite: 8]

**11. Saat kamu ingin membantu menjelaskan pelajaran matematika yang sulit kepada temanmu, kamu biasanya...**[cite: 8]

- [ ] **A.** Menuliskan cara hitungnya di kertas agar temanmu bisa melihat rumusnya `[Indikator: V]`[cite: 8]
- [ ] **B.** Menjelaskan langkah-langkah hitungannya secara lisan pelan-pelan `[Indikator: A]`[cite: 8]
- [ ] **C.** Memberikan contoh benda nyata atau meminta temanmu memegang pensil untuk ikut menghitung bersamamu `[Indikator: K]`[cite: 8]

**12. Ketika kamu harus fokus mengerjakan PR matematika yang susah, apa kebiasaan yang tidak sadar sering kamu lakukan?**[cite: 8]

- [ ] **A.** Mencoret-coret kertas buram di bagian pinggirnya `[Indikator: V]`[cite: 8]
- [ ] **B.** Berbicara atau bergumam pada diri sendiri saat menghitung `[Indikator: A]`[cite: 8]
- [ ] **C.** Menggigit ujung pensil, mengetuk meja, atau menggoyang-goyangkan kaki `[Indikator: K]`[cite: 8]

**13. Kalau kamu harus belajar permainan baru (seperti permainan papan atau kartu), kamu paling suka jika...**[cite: 9]

- [ ] **A.** Melihat orang lain memainkannya terlebih dahulu sampai selesai `[Indikator: V]`[cite: 9]
- [ ] **B.** Mendengarkan temanmu membacakan peraturan permainannya `[Indikator: A]`[cite: 9]
- [ ] **C.** Langsung ikut bermain sambil perlahan-lahan memahami aturannya di tengah jalan `[Indikator: K]`[cite: 9]

**14. Bagaimana caramu mengecek apakah jawaban di lembar ujianmu sudah benar atau belum?**[cite: 9]

- [ ] **A.** Membaca ulang bentuk tulisan jawabannya secara keseluruhan untuk mencari yang aneh `[Indikator: V]`[cite: 9]
- [ ] **B.** Membaca jawabannya dengan suara berbisik untuk mendengar apakah kalimatnya sudah pas `[Indikator: A]`[cite: 9]
- [ ] **C.** Menghitung ulang dengan jari atau mengecek ulang coretan perhitunganmu di kertas buram `[Indikator: K]`[cite: 9]

**15. Pujian seperti apa dari guru atau orang tua yang paling membuatmu merasa usahamu dihargai?**[cite: 9]

- [ ] **A.** Mendapat nilai bagus yang tertulis di kertas atau diberi stiker/bintang `[Indikator: V]`[cite: 9]
- [ ] **B.** Mendengar ucapan "Kerja bagus, kamu hebat!" langsung di depanmu `[Indikator: A]`[cite: 9]
- [ ] **C.** Mendapat tepukan bangga di pundak atau ajakan tos tangan `[Indikator: K]`[cite: 9]

##### Lanjutan Sektor 1: Situasi Akademik di Kelas (Soal 16–19 | Untuk SMP & SMA)

**16. Saat mendapat tugas kelompok dari guru, peran apa yang paling kamu sukai?**[cite: 9]

- [ ] **A.** Bagian membuat desain presentasi, poster, atau merangkum tulisan `[Indikator: V]`[cite: 9]
- [ ] **B.** Bagian menjadi pembicara yang mempresentasikan tugas di depan kelas `[Indikator: A]`[cite: 9]
- [ ] **C.** Bagian mencari bahan, merakit alat, atau memperagakan hasilnya `[Indikator: K]`[cite: 10]

**17. Pada pelajaran Sejarah atau IPS, cara belajar mana yang paling membuatmu tidak mudah mengantuk?**[cite: 10]

- [ ] **A.** Menonton film dokumenter atau melihat foto-foto sejarah di buku `[Indikator: V]`[cite: 10]
- [ ] **B.** Mendengarkan guru bercerita atau mengadakan sesi debat di kelas `[Indikator: A]`[cite: 10]
- [ ] **C.** Melakukan drama/sosiodrama di kelas atau kunjungan langsung ke museum `[Indikator: K]`[cite: 10]

**18. Saat berkenalan dengan teman baru di sekolah, hal apa yang biasanya paling mudah kamu ingat dari mereka?**[cite: 10]

- [ ] **A.** Wajahnya, gaya rambutnya, atau barang yang dia pakai `[Indikator: V]`[cite: 10]
- [ ] **B.** Nama panggilannya atau cara nada suaranya berbicara `[Indikator: A]`[cite: 10]
- [ ] **C.** Hal yang kalian lakukan bersama saat pertama kali bertemu atau cara dia berjabat tangan `[Indikator: K]`[cite: 10]

**19. Jika kamu harus presentasi di depan kelas, apa yang kamu lakukan agar tidak lupa?**[cite: 10]

- [ ] **A.** Membuat slide yang bagus dan membaca kartu catatan kecil bergaris bawah `[Indikator: V]`[cite: 10]
- [ ] **B.** Menghafalkan kalimat pembukanya dengan membacanya keras-keras sebelum maju `[Indikator: A]`[cite: 10]
- [ ] **C.** Latihan presentasi sambil menggerakkan tangan atau berlatih sambil berjalan-jalan `[Indikator: K]`[cite: 10]

##### Sektor 2: Situasi Belajar Mandiri & Pemecahan Masalah (Soal 20 Untuk SMP & SMA | Soal 21–23 Khusus SMA)

**20. Ketika kamu belajar sesuatu yang baru dari internet, apa yang pertama kali kamu cari?**[cite: 10]

- [ ] **A.** Infografis, gambar ringkasan, atau artikel dengan banyak ilustrasi `[Indikator: V]`[cite: 10]
- [ ] **B.** Siniar (podcast) atau video penjelasan (meskipun kamu hanya mendengarkan suaranya) `[Indikator: A]`[cite: 10]
- [ ] **C.** Video tutorial interaktif di mana kamu bisa langsung ikut mempraktikkannya `[Indikator: K]`[cite: 10]

**21. Jika kamu mendapat tugas membuat karangan cerita atau esai yang panjang, bagaimana caramu memulainya?**[cite: 10]

- [ ] **A.** Membuat kerangka tulisan atau peta konsep (mind map) di kertas terlebih dahulu `[Indikator: V]`[cite: 10]
- [ ] **B.** Mengucapkan ide-ide ceritamu sendiri secara lisan sebelum mulai menuliskannya `[Indikator: A]`[cite: 11]
- [ ] **C.** Langsung mengetik/menulis saja apa yang ada di pikiran, nanti baru diperbaiki sambil jalan `[Indikator: K]`[cite: 11]

**22. Saat kamu benar-benar kesulitan mengingat rumus fisika atau matematika, trik apa yang sering berhasil membantumu?**[cite: 11]

- [ ] **A.** Menulis rumus tersebut besar-besar dengan spidol warna dan menempelkannya di dinding kamar `[Indikator: V]`[cite: 11]
- [ ] **B.** Membuat singkatan kata yang lucu atau melagukan rumus tersebut `[Indikator: A]`[cite: 11]
- [ ] **C.** Mencoret-coret udara dengan jari seolah sedang menulis, atau menggunakan alat peraga sederhana `[Indikator: K]`[cite: 11]

**23. Bagaimana caramu mengingat tugas harian atau PR agar tidak lupa dikerjakan?**[cite: 11]

- [ ] **A.** Menulisnya dengan rapi di buku agenda khusus atau menandai kalender `[Indikator: V]`[cite: 11]
- [ ] **B.** Memasang alarm suara di HP atau meminta orang tua/teman untuk mengingatkan `[Indikator: A]`[cite: 11]
- [ ] **C.** Menulis di secarik kertas kecil yang selalu kamu bawa di saku atau tas `[Indikator: K]`[cite: 11]

##### Sektor 3: Situasi Ujian & Tekanan Mental (Soal 24–27 | Khusus SMA)

**24. Lima menit sebelum ujian dimulai dan kamu sedang menunggu di luar kelas, apa yang kamu lakukan?**[cite: 11]

- [ ] **A.** Membaca cepat buku catatan atau melihat-lihat kembali rangkuman berwarnamu `[Indikator: V]`[cite: 11]
- [ ] **B.** Saling melempar pertanyaan dan tanya jawab lisan dengan teman di sebelahmu `[Indikator: A]`[cite: 11]
- [ ] **C.** Berdiri, berjalan mondar-mandir sebentar, atau melakukan peregangan untuk menghilangkan grogi `[Indikator: K]`[cite: 11]

**25. Di tengah ujian, kamu tiba-tiba lupa jawaban dari satu soal. Apa refleks spontan yang kamu lakukan?**[cite: 11]

- [ ] **A.** Memejamkan mata dan mencoba membayangkan letak tulisan tersebut di halaman bukumu `[Indikator: V]`[cite: 11]
- [ ] **B.** Mengingat-ingat kembali suara guru saat menjelaskan materi tersebut di kelas `[Indikator: A]`[cite: 11]
- [ ] **C.** Memutar-mutar pulpen di jari, mengetuk meja, atau memijat pelipis/dahi `[Indikator: K]`[cite: 12]

**26. Ketika kamu mendapatkan nilai ulangan yang jelek, apa reaksi fisik pertamamu?**[cite: 12]

- [ ] **A.** Menatap kertas ulangan itu lama-lama dengan ekspresi kesal `[Indikator: V]`[cite: 12]
- [ ] **B.** Mengeluh, menggerutu, atau langsung ingin menceritakan kekesalan itu pada teman `[Indikator: A]`[cite: 12]
- [ ] **C.** Secara refleks ingin meremas kertasnya, melempar alat tulis, atau membanting tas `[Indikator: K]`[cite: 12]

**27. Jika ada soal ujian cerita yang instruksinya sangat panjang, bagaimana caramu memahaminya?**[cite: 12]

- [ ] **A.** Membaca soalnya sambil menggarisbawahi atau melingkari kata-kata yang penting `[Indikator: V]`[cite: 12]
- [ ] **B.** Membaca soal tersebut dalam hati dengan bibir yang ikut bergerak mengeja `[Indikator: A]`[cite: 12]
- [ ] **C.** Langsung melihat ke pilihan jawabannya dulu atau mencoret-coret kertas buram `[Indikator: K]`[cite: 12]

##### Sektor 4: Situasi Sosial & Preferensi Keseharian (Soal 28–30 | Khusus SMA)

**28. Ketika kamu pergi ke mal untuk membeli sepatu atau tas baru, apa yang paling memengaruhi keputusanmu?**[cite: 12]

- [ ] **A.** Warna, model, dan desain barangnya terlihat sangat keren `[Indikator: V]`[cite: 12]
- [ ] **B.** Rekomendasi dari teman atau penjelasan dari penjual tokonya `[Indikator: A]`[cite: 12]
- [ ] **C.** Saat barang itu dicoba terasa sangat nyaman dan pas di badan/kaki `[Indikator: K]`[cite: 12]

**29. Saat sedang bersantai menggunakan media sosial atau gawai, konten apa yang paling sering kamu nikmati?**[cite: 12]

- [ ] **A.** Melihat-lihat foto yang bagus di Instagram, Pinterest, atau membaca komik web `[Indikator: V]`[cite: 12]
- [ ] **B.** Mendengarkan musik, mendengarkan orang bercerita, atau bergabung di forum diskusi suara `[Indikator: A]`[cite: 12]
- [ ] **C.** Bermain game yang butuh kecepatan tangan atau mencoba tren tarian/gerakan di TikTok `[Indikator: K]`[cite: 12]

**30. Jika kamu diberi hadiah liburan akhir pekan ke mana saja, aktivitas liburan seperti apa yang kamu pilih?**[cite: 12]

- [ ] **A.** Pergi ke tempat dengan pemandangan alam yang indah untuk berfoto `[Indikator: V]`[cite: 13]
- [ ] **B.** Pergi menonton konser musik atau pertunjukan hiburan bersama teman-teman `[Indikator: A]`[cite: 13]
- [ ] **C.** Pergi ke taman hiburan untuk naik wahana ekstrem, berenang, atau mendaki `[Indikator: K]`[cite: 13]

#### D. Algoritma Skoring & Kriteria Dominasi (`PM-VAK-01`)

- **Aturan Dasar:** Setiap nomor hanya boleh memilih 1 jawaban[cite: 5].
  - Jawaban `A` = +1 Poin **Visual (`V`)**[cite: 6, 9]
  - Jawaban `B` = +1 Poin **Auditory (`A`)**[cite: 6, 9]
  - Jawaban `C` = +1 Poin **Kinesthetic (`K`)**[cite: 6, 9]
- **Total Poin Maksimal ($N$):** SD = 15 poin, SMP = 20 poin, SMA = 30 poin[cite: 6, 13].
- **Kriteria Penentuan Kategori Dominasi (Mengacu pada Baseline 15 Soal & Ekuivalensi Persentase):**
  Urutkan skor tertinggi pertama ($S_1$), tertinggi kedua ($S_2$), dan tertinggi ketiga ($S_3$):
  1. **Multimodal (Seimbang):** Selisih antara ketiga skor modalitas sangat kecil ($S_1 - S_3 \le 1$ poin pada skala 15 soal, atau $\le 2$ poin pada skala 20–30 soal; contoh pada 15 soal: $V=5, A=5, K=5$)[cite: 6].
  2. **Dominasi Tunggal:** Skor modalitas tertinggi mencapai $\ge 8$ poin (pada skala 15 soal / $\ge 53.3\%$ dari total soal) **ATAU** memiliki selisih $\ge 3$ poin dari modalitas tertinggi kedua ($S_1 - S_2 \ge 3$)[cite: 6].
  3. **Bimodal (Campuran Dua Jalur):** Selisih antara skor tertinggi pertama dan kedua $\le 2$ poin ($S_1 - S_2 \le 2$), namun tidak memenuhi syarat Multimodal (contoh: _Visual-Auditory_ atau _Visual-Kinesthetic_)[cite: 6].

---

### MODUL 1.2: DOMINASI HEMISFER OTAK (OTAK KIRI VS OTAK KANAN)

- **Kode Modul:** `PM-HEM-02`[cite: 14]
- **Format Instrumen:** Kuesioner _forced-choice_ (pilihan ganda paksaan) dengan 2 opsi jawaban (A dan B) yang merupakan dikotomi gaya berpikir[cite: 14].
- **Aturan Filter Jumlah Soal Berdasarkan Jenjang (Leveling Rule):**
  - **SD:** 10 Soal (Menampilkan Soal Nomor 1 s.d. 10)[cite: 14]
  - **SMP:** 15 Soal (Menampilkan Soal Nomor 1 s.d. 15)[cite: 14]
  - **SMA:** 20 Soal (Menampilkan Soal Nomor 1 s.d. 20)[cite: 14]

#### A. Landasan Teori & Definisi Operasional Variabel

Instrumen ini didasarkan pada Teori Lateralisasi Otak (_Split-Brain Theory_) yang dikembangkan oleh pemenang Nobel, Roger W. Sperry[cite: 14]. Teori ini memetakan bagaimana dua belahan otak manusia memproses informasi dengan cara yang bertolak belakang namun saling melengkapi[cite: 14]. Dalam konteks pendidikan, mengetahui dominasi belahan otak anak sangat krusial untuk menentukan cara penyampaian silabus (apakah materi diberikan dari detail ke konsep besar, atau dari konsep besar baru dipecah ke detail)[cite: 14].

1. **Otak Kiri (`LEFT_BRAIN`):** Pemroses informasi yang bersifat rasional, analitis, sekuensial (berurutan), dan logis[cite: 14]. Anak dominan otak kiri melihat "pohon sebelum hutan"[cite: 14]. Mereka menyukai kepastian, angka, fakta, jadwal terstruktur, dan instruksi langkah demi langkah[cite: 14].
2. **Otak Kanan (`RIGHT_BRAIN`):** Pemroses informasi yang bersifat intuitif, holistik, spasial, dan kreatif[cite: 14]. Anak dominan otak kanan melihat "hutan secara keseluruhan sebelum melihat pohonnya"[cite: 14]. Mereka menyukai kebebasan, warna, imajinasi, gambaran besar, dan sering menyelesaikan masalah dengan cara tidak biasa[cite: 14].

#### B. Instruksi Pengerjaan (Ditampilkan di Layar Siswa)

> _"Pilihlah satu jawaban yang paling spontan dan menggambarkan dirimu apa adanya. Jangan terlalu lama berpikir, pilih yang paling sering kamu rasakan atau lakukan di keseharian."_[cite: 15]

#### C. Bank Soal Lengkap `PM-HEM-02` (20 Butir)

> **CATATAN PENTING UNTUK DEVELOPER:** Posisi indikator `(Kiri)` dan `(Kanan)` pada opsi A dan B di bawah ini telah diacak sesuai naskah asli instrumen[cite: 15, 16, 17, 18]. Sistem wajib melakukan skoring berdasarkan tag `[Indikator: LEFT_BRAIN]` dan `[Indikator: RIGHT_BRAIN]` pada tiap opsi.

##### Bagian 1 (Soal 1–10 | Untuk SD, SMP, SMA)

**1. Saat kamu mulai belajar bab baru di sekolah, mana yang lebih kamu sukai?**[cite: 15]

- [ ] **A.** Membuka-buka seluruh halaman bab tersebut dengan cepat untuk melihat gambar dan ringkasan akhirnya terlebih dahulu. `[Indikator: RIGHT_BRAIN]`[cite: 15]
- [ ] **B.** Membaca materinya pelan-pelan dari halaman pertama sampai akhir secara berurutan. `[Indikator: LEFT_BRAIN]`[cite: 15]

**2. Kondisi meja belajar atau kamarmu biasanya...**[cite: 15]

- [ ] **A.** Rapi, barang-barang tertata pada tempatnya, dan kamu tahu persis di mana meletakkan alat tulismu. `[Indikator: LEFT_BRAIN]`[cite: 15]
- [ ] **B.** Sering berantakan atau penuh dengan barang, tetapi anehnya kamu tahu di mana letak barang yang kamu cari. `[Indikator: RIGHT_BRAIN]`[cite: 15]

**3. Ketika kamu harus menyelesaikan tugas atau PR, bagaimana caramu mengatur waktu?**[cite: 15]

- [ ] **A.** Sering menunda-nunda di awal, lalu mengebut mengerjakannya saat sudah sangat mepet waktu (Sistem SKS). `[Indikator: RIGHT_BRAIN]`[cite: 15]
- [ ] **B.** Membuat jadwal yang jelas, mengerjakannya dicicil, dan selesai jauh sebelum tenggat waktu. `[Indikator: LEFT_BRAIN]`[cite: 15]

**4. Jika kamu diminta memberikan petunjuk arah jalan ke sebuah tempat, kamu akan...**[cite: 15]

- [ ] **A.** Memberikan petunjuk arah yang pasti seperti nama jalan, belok kanan/kiri, dan jarak meternya. `[Indikator: LEFT_BRAIN]`[cite: 15]
- [ ] **B.** Memberikan petunjuk menggunakan patokan tempat (misalnya: "nanti di sebelah minimarket warna biru, kamu belok ke arah gedung tinggi"). `[Indikator: RIGHT_BRAIN]`[cite: 15]

**5. Saat kamu bertemu dengan orang baru, hal apa yang lebih mudah kamu ingat darinya?**[cite: 15]

- [ ] **A.** Wajah orang tersebut atau perasaannya saat mengobrol denganmu (meskipun kamu lupa namanya). `[Indikator: RIGHT_BRAIN]`[cite: 15]
- [ ] **B.** Nama orang tersebut atau asal sekolah/rumahnya. `[Indikator: LEFT_BRAIN]`[cite: 16]

**6. Dalam pelajaran Matematika atau Eksakta, mana yang paling sering terjadi padamu?**[cite: 16]

- [ ] **A.** Sangat teliti mengikuti rumus langkah demi langkah untuk mendapatkan jawaban pasti. `[Indikator: LEFT_BRAIN]`[cite: 16]
- [ ] **B.** Sering menemukan jawaban akhirnya dengan caramu sendiri (menebak logikanya), tapi bingung kalau disuruh menuliskan langkah-langkah rumusnya. `[Indikator: RIGHT_BRAIN]`[cite: 16]

**7. Ketika kamu berdebat atau berdiskusi dengan teman, kamu lebih sering...**[cite: 16]

- [ ] **A.** Menggunakan perasaan, intuisi, dan mencoba menjaga agar temanmu tidak terlalu sakit hati. `[Indikator: RIGHT_BRAIN]`[cite: 16]
- [ ] **B.** Menggunakan fakta, data, atau aturan yang ada untuk membuktikan bahwa kamu benar. `[Indikator: LEFT_BRAIN]`[cite: 16]

**8. Jika kamu merakit barang baru seperti mainan LEGO atau perabotan, kamu akan...**[cite: 16]

- [ ] **A.** Membaca buku panduannya dari langkah 1, 2, 3 sampai selesai tanpa terlewat. `[Indikator: LEFT_BRAIN]`[cite: 16]
- [ ] **B.** Melihat gambar hasil akhirnya di kotak, lalu langsung mencoba merakitnya sendiri tanpa banyak membaca buku panduan. `[Indikator: RIGHT_BRAIN]`[cite: 16]

**9. Saat mencatat pelajaran di kelas, bentuk catatanmu biasanya...**[cite: 16]

- [ ] **A.** Penuh coretan, menggunakan peta pikiran (mind map), anak panah ke mana-mana, atau ada gambar di pinggir buku. `[Indikator: RIGHT_BRAIN]`[cite: 16]
- [ ] **B.** Rapi, terstruktur ke bawah, menggunakan nomor (1, 2, 3), atau bullet points. `[Indikator: LEFT_BRAIN]`[cite: 16]

**10. Menghadapi aturan di sekolah atau di rumah, sikap aslimu adalah...**[cite: 16]

- [ ] **A.** Aturan itu ada untuk ditaati agar semuanya berjalan tertib dan aman. `[Indikator: LEFT_BRAIN]`[cite: 16]
- [ ] **B.** Aturan itu kadang terlalu kaku, ada kalanya kita bisa mencari celah jika tujuannya baik. `[Indikator: RIGHT_BRAIN]`[cite: 16]

##### Bagian 2 (Soal 11–15 | Untuk SMP & SMA)

**11. Saat sedang melamun atau membayangkan masa depan, apa yang ada di pikiranmu?**[cite: 16]

- [ ] **A.** Cita-cita yang sangat besar, imajinasi yang liar, atau petualangan yang tidak terduga. `[Indikator: RIGHT_BRAIN]`[cite: 16]
- [ ] **B.** Target yang realistis, rencana sekolah, atau hal-hal yang pasti bisa kamu capai. `[Indikator: LEFT_BRAIN]`[cite: 17]

**12. Jika kamu sedang mengerjakan soal pilihan ganda dan tidak tahu jawabannya, kamu biasanya...**[cite: 17]

- [ ] **A.** Menganalisis pilihan jawabannya dan mencoret opsi yang sudah pasti salah satu per satu secara logis. `[Indikator: LEFT_BRAIN]`[cite: 17]
- [ ] **B.** Mengandalkan feeling atau insting batinmu untuk memilih jawaban yang "terasa" paling benar. `[Indikator: RIGHT_BRAIN]`[cite: 17]

**13. Saat kamu menonton film, bagian mana yang paling menarik perhatianmu?**[cite: 17]

- [ ] **A.** Efek visualnya, musiknya, dan emosi para pemainnya. `[Indikator: RIGHT_BRAIN]`[cite: 17]
- [ ] **B.** Alur ceritanya yang masuk akal dan urutan kejadiannya yang jelas. `[Indikator: LEFT_BRAIN]`[cite: 17]

**14. Jika kamu diberi tugas kelompok, kamu lebih suka mengambil peran sebagai...**[cite: 17]

- [ ] **A.** Ketua yang membagi tugas, menyusun jadwal pengerjaan, dan memastikan semua selesai tepat waktu. `[Indikator: LEFT_BRAIN]`[cite: 17]
- [ ] **B.** Pemikir ide, pendesain presentasi, atau orang yang mencairkan suasana saat kelompok mulai stres. `[Indikator: RIGHT_BRAIN]`[cite: 17]

**15. Mana pernyataan yang paling cocok dengan caramu mengekspresikan diri?**[cite: 17]

- [ ] **A.** Saya berbicara menggunakan banyak gerakan tangan, ekspresi wajah, dan kadang melompat-lompat antar topik. `[Indikator: RIGHT_BRAIN]`[cite: 17]
- [ ] **B.** Saya berbicara dengan kata-kata yang jelas, tepat, dan langsung pada intinya (to the point). `[Indikator: LEFT_BRAIN]`[cite: 17]

##### Bagian 3 (Soal 16–20 | Khusus SMA)

**16. Dalam hal bermain musik atau kesenian, kamu lebih mengutamakan...**[cite: 17]

- [ ] **A.** Teknik yang benar, membaca partitur nada dengan tepat, atau presisi proporsi gambar. `[Indikator: LEFT_BRAIN]`[cite: 17]
- [ ] **B.** Penghayatan lagu, improvisasi, atau memadukan warna-warna unik secara bebas. `[Indikator: RIGHT_BRAIN]`[cite: 17]

**17. Kalau kamu menulis karangan cerita, masalah yang paling sering kamu alami adalah...**[cite: 17]

- [ ] **A.** Ide ceritanya banyak sekali sampai bingung cara menyusunnya menjadi kalimat yang rapi. `[Indikator: RIGHT_BRAIN]`[cite: 17]
- [ ] **B.** Tulisannya terlalu kaku dan kurang ekspresif/kurang berimajinasi. `[Indikator: LEFT_BRAIN]`[cite: 18]

**18. Menurutmu, hal apa yang paling membuatmu merasa nyaman?**[cite: 18]

- [ ] **A.** Kepastian, jadwal yang terencana, dan rutinitas yang teratur. `[Indikator: LEFT_BRAIN]`[cite: 18]
- [ ] **B.** Kejutan, fleksibilitas, dan hal-hal baru yang spontan. `[Indikator: RIGHT_BRAIN]`[cite: 18]

**19. Ketika kamu menyusun barang di lemari atau koper, caramu adalah...**[cite: 18]

- [ ] **A.** Menjejalkannya asalkan semuanya muat, tidak terlalu peduli dengan kategori barangnya. `[Indikator: RIGHT_BRAIN]`[cite: 18]
- [ ] **B.** Mengelompokkannya secara sistematis (baju dengan baju, buku dengan buku) dengan sangat presisi. `[Indikator: LEFT_BRAIN]`[cite: 18]

**20. Jika kamu sedang bermain puzzle, cara yang paling sering kamu lakukan adalah...**[cite: 18]

- [ ] **A.** Menyortir dulu kepingan yang ujungnya lurus (bingkainya) lalu memisahkan berdasarkan warnanya. `[Indikator: LEFT_BRAIN]`[cite: 18]
- [ ] **B.** Mengambil kepingan secara acak dan langsung mencoba mencocokkan mana yang terlihat pas. `[Indikator: RIGHT_BRAIN]`[cite: 18]

#### D. Tabel Referensi Kunci Jawaban `PM-HEM-02`

Gunakan tabel pemetaan ini untuk validasi skoring di _backend_:

| No. Soal |         Opsi A          |         Opsi B          | No. Soal |         Opsi A          |         Opsi B          |
| :------: | :---------------------: | :---------------------: | :------: | :---------------------: | :---------------------: |
|  **1**   | `RIGHT_BRAIN`[cite: 15] | `LEFT_BRAIN`[cite: 15]  |  **11**  | `RIGHT_BRAIN`[cite: 16] | `LEFT_BRAIN`[cite: 17]  |
|  **2**   | `LEFT_BRAIN`[cite: 15]  | `RIGHT_BRAIN`[cite: 15] |  **12**  | `LEFT_BRAIN`[cite: 17]  | `RIGHT_BRAIN`[cite: 17] |
|  **3**   | `RIGHT_BRAIN`[cite: 15] | `LEFT_BRAIN`[cite: 15]  |  **13**  | `RIGHT_BRAIN`[cite: 17] | `LEFT_BRAIN`[cite: 17]  |
|  **4**   | `LEFT_BRAIN`[cite: 15]  | `RIGHT_BRAIN`[cite: 15] |  **14**  | `LEFT_BRAIN`[cite: 17]  | `RIGHT_BRAIN`[cite: 17] |
|  **5**   | `RIGHT_BRAIN`[cite: 15] | `LEFT_BRAIN`[cite: 16]  |  **15**  | `RIGHT_BRAIN`[cite: 17] | `LEFT_BRAIN`[cite: 17]  |
|  **6**   | `LEFT_BRAIN`[cite: 16]  | `RIGHT_BRAIN`[cite: 16] |  **16**  | `LEFT_BRAIN`[cite: 17]  | `RIGHT_BRAIN`[cite: 17] |
|  **7**   | `RIGHT_BRAIN`[cite: 16] | `LEFT_BRAIN`[cite: 16]  |  **17**  | `RIGHT_BRAIN`[cite: 17] | `LEFT_BRAIN`[cite: 18]  |
|  **8**   | `LEFT_BRAIN`[cite: 16]  | `RIGHT_BRAIN`[cite: 16] |  **18**  | `LEFT_BRAIN`[cite: 18]  | `RIGHT_BRAIN`[cite: 18] |
|  **9**   | `RIGHT_BRAIN`[cite: 16] | `LEFT_BRAIN`[cite: 16]  |  **19**  | `RIGHT_BRAIN`[cite: 18] | `LEFT_BRAIN`[cite: 18]  |
|  **10**  | `LEFT_BRAIN`[cite: 16]  | `RIGHT_BRAIN`[cite: 16] |  **20**  | `LEFT_BRAIN`[cite: 18]  | `RIGHT_BRAIN`[cite: 18] |

#### E. Algoritma Skoring & SOP Tindak Lanjut Guru Privat (`PM-HEM-02`)

- **Rumus Perhitungan:**
  - $\text{Persentase Kiri} = \left(\frac{\text{Total Skor LEFT\_BRAIN}}{\text{Total Soal Jenjang}}\right) \times 100\%$
  - $\text{Persentase Kanan} = \left(\frac{\text{Total Skor RIGHT\_BRAIN}}{\text{Total Soal Jenjang}}\right) \times 100\%$
- **Kriteria Dominasi:**
  - **Dominan Otak Kiri:** Jika $\text{Persentase Kiri} > 65\%$ (SD: $\ge 7$ dari 10 soal; SMP: $\ge 10$ dari 15 soal; SMA: $\ge 14$ dari 20 soal)[cite: 14].
  - **Dominan Otak Kanan:** Jika $\text{Persentase Kanan} > 65\%$ (SD: $\ge 7$ dari 10 soal; SMP: $\ge 10$ dari 15 soal; SMA: $\ge 14$ dari 20 soal)[cite: 14].
  - **Seimbang (Whole-Brain):** Jika kedua sisi berada pada $\le 65\%$ (selisih sangat kecil, menandakan anak fleksibel menggunakan kedua sisi otaknya tergantung situasi)[cite: 14].

- **Output Aplikasi Konseling & SOP Tindak Lanjut Guru Privat:**
  - **Jika Hasil = Dominan Otak Kiri:**
    > Guru privat wajib memberikan silabus atau target harian di awal sesi (_"Hari ini kita akan belajar 3 rumus ini"_)[cite: 18]. Anak otak kiri benci disuruh menebak-nebak tujuan belajar[cite: 18]. Jika hasil ujiannya salah, guru harus menunjukkan secara pasti di langkah nomor berapa ia keliru[cite: 18]. Jangan berikan tugas terbuka yang instruksinya mengambang[cite: 18].
  - **Jika Hasil = Dominan Otak Kanan:**
    > Guru privat dilarang langsung menyuruh anak mengerjakan 10 soal hitungan berturut-turut tanpa menjelaskan konsep besarnya[cite: 18]. Guru wajib menceritakan fungsi materi tersebut di dunia nyata (_"Kenapa kita belajar gravitasi?"_)[cite: 18]. Berikan keleluasaan jika anak ini menemukan cara cepat (_shortcut_) sendiri dalam memecahkan soal, jangan dimarahi hanya karena caranya berbeda dengan buku cetak asalkan logikanya benar[cite: 18].
  - **Jika Hasil = Seimbang (Whole-Brain):**
    > Guru privat dapat menggunakan metode kombinasi[cite: 18]. Buka sesi dengan cerita/visual (untuk otak kanan), lalu masuk ke pengerjaan soal presisi langkah demi langkah (untuk otak kiri)[cite: 18]. Anak tipe ini adalah pembelajar yang paling adaptif[cite: 18].

---

### MODUL 1.3: SCREENING KEBIASAAN & LINGKUNGAN BELAJAR

- **Kode Modul:** `PM-SKB-03`[cite: 19]
- **Target Subjek:** Universal — SD, SMP, dan SMA mengerjakan seluruh **15 butir soal**[cite: 19].
- **Waktu Pengerjaan:** 5–7 menit[cite: 19]
- **Format Instrumen:** 15 Butir pertanyaan yang dibagi menjadi 3 bagian situasi (masing-masing 5 soal)[cite: 19].

#### A. Landasan Teori & Definisi Operasional Variabel

Instrumen ini dirancang menggunakan sintesis dari tiga pendekatan psikologi pendidikan[cite: 19]:

1. **Kronobiologi (_Chronobiology_):** Memetakan ritme sirkadian kognitif anak untuk menemukan puncak kesiagaan mental (_Morning Lark_ vs _Night Owl_)[cite: 19].
2. **Model Gaya Belajar Dunn & Dunn (_Environmental Preferences_):** Menilai sensitivitas anak terhadap elemen fisik lingkungan (suara, pencahayaan, posisi duduk, dan asupan) yang memengaruhi kemampuan otak mempertahankan gelombang Alpha (kondisi optimal untuk belajar)[cite: 19].
3. **Teori Beban Kognitif (_Cognitive Load & Attention Span_):** Mendiagnosis batas ketahanan fokus (_span of attention_) untuk menentukan frekuensi dan jenis jeda istirahat (misalnya apakah anak cocok dengan Teknik Pomodoro)[cite: 19].

**3 Klaster Pengukuran:**

- **Klaster A — Jam Biologis (Kapan otak paling tajam?):** Menentukan waktu terbaik untuk menyerap materi eksakta (berat) dan materi hafalan (ringan)[cite: 19].
- **Klaster B — Toleransi Lingkungan (Bagaimana kondisi ruangannya?):** Menentukan tingkat sensitivitas terhadap kebisingan (butuh keheningan mutlak vs butuh _white noise_/musik) dan ergonomi belajar (duduk formal vs santai)[cite: 19].
- **Klaster C — Rentang Ketahanan Fokus (Seberapa lama bisa duduk diam?):** Membagi tipe anak ke dalam pembelajar Maraton (tahan 1–2 jam tanpa jeda) atau pembelajar Sprint (butuh jeda fisik setiap 20–30 menit)[cite: 19].

#### B. Instruksi Pengerjaan (Ditampilkan di Layar Siswa)

> _"Jawablah pertanyaan ini sesuai dengan apa yang paling membuatmu merasa nyaman saat belajar di rumah. Pilihlah satu jawaban yang paling menggambarkan kebiasaan aslimu."_[cite: 19]

#### C. Bank Soal Lengkap `PM-SKB-03` (15 Butir)

##### Bagian 1: Waktu Belajar / Jam Biologis (Soal 1–5)

**1. Kapan kamu merasa paling mudah menghafal atau memahami pelajaran yang sulit?**[cite: 20]

- [ ] **A.** Pagi hari atau sebelum berangkat sekolah. `[Klaster: BIO | Skor: A]`[cite: 20]
- [ ] **B.** Siang atau sore hari setelah pulang sekolah. `[Klaster: BIO | Skor: B]`[cite: 20]
- [ ] **C.** Malam hari atau saat hari sudah gelap dan tenang. `[Klaster: BIO | Skor: C]`[cite: 20]

**2. Saat bangun tidur di pagi hari untuk bersiap sekolah, apa yang biasanya kamu rasakan?**[cite: 20]

- [ ] **A.** Langsung merasa segar, sadar penuh, dan siap beraktivitas. `[Klaster: BIO | Skor: A]`[cite: 20]
- [ ] **B.** Butuh waktu pemanasan sebentar (mandi/sarapan) baru bisa berpikir jernih. `[Klaster: BIO | Skor: B]`[cite: 20]
- [ ] **C.** Terasa sangat berat, mengantuk, dan malas berbicara di pagi hari. `[Klaster: BIO | Skor: C]`[cite: 20]

**3. Jika kamu memiliki PR Matematika yang cukup rumit, kapan waktu terbaikmu untuk menyelesaikannya?**[cite: 20]

- [ ] **A.** Langsung dikerjakan di pagi hari saat akhir pekan. `[Klaster: BIO | Skor: A]`[cite: 20]
- [ ] **B.** Dikerjakan sore hari setelah istirahat siang. `[Klaster: BIO | Skor: B]`[cite: 20]
- [ ] **C.** Dikerjakan malam hari menjelang tidur. `[Klaster: BIO | Skor: C]`[cite: 20]

**4. Kapan ide-ide paling cemerlang atau keinginan alamimu untuk membaca buku/belajar biasanya muncul?**[cite: 20]

- [ ] **A.** Pagi hari (jam 05.00–09.00). `[Klaster: BIO | Skor: A]`[cite: 20]
- [ ] **B.** Siang/Sore hari (jam 13.00–17.00). `[Klaster: BIO | Skor: B]`[cite: 20]
- [ ] **C.** Malam hari (jam 19.00 – ke atas). `[Klaster: BIO | Skor: C]`[cite: 20]

**5. Saat masa libur sekolah dan tidak ada jadwal pasti, jam berapa kamu lebih suka mulai mengerjakan tugas yang tertunda?**[cite: 20]

- [ ] **A.** Tetap di pagi hari agar cepat selesai. `[Klaster: BIO | Skor: A]`[cite: 20]
- [ ] **B.** Agak santai di siang atau sore hari. `[Klaster: BIO | Skor: B]`[cite: 20]
- [ ] **C.** Menunggu malam hari karena terasa lebih sunyi. `[Klaster: BIO | Skor: C]`[cite: 20]

##### Bagian 2: Suasana & Lingkungan Fisik (Soal 6–10)

**6. Kondisi suara seperti apa yang paling membantumu untuk fokus?**[cite: 20]

- [ ] **A.** Sangat sunyi dan hening mutlak (kamar tertutup rapat). `[Klaster: ENV | Skor: A]`[cite: 20]
- [ ] **B.** Ada sedikit suara aktivitas orang di rumah atau suara alam, tapi tidak berisik. `[Klaster: ENV | Skor: B]`[cite: 20]
- [ ] **C.** Harus ada suara latar seperti musik, lagu favorit, atau suara TV dari kejauhan. `[Klaster: ENV | Skor: C]`[cite: 20]

**7. Jika sedang ada orang yang mengobrol di ruangan sebelah saat kamu belajar, apa reaksimu?**[cite: 20]

- [ ] **A.** Sangat terganggu, marah, atau tidak bisa konsentrasi sama sekali. `[Klaster: ENV | Skor: A]`[cite: 20]
- [ ] **B.** Bisa mengabaikannya selama suaranya tidak terlalu keras. `[Klaster: ENV | Skor: B]`[cite: 20]
- [ ] **C.** Tidak terlalu peduli, atau malah kadang ikut mendengarkan obrolan mereka. `[Klaster: ENV | Skor: C]`[cite: 20]

**8. Posisi fisik seperti apa yang paling sering kamu lakukan saat mengerjakan tugas berjam-jam?**[cite: 21]

- [ ] **A.** Duduk tegak di kursi belajar dengan meja yang rapi. `[Klaster: ENV | Skor: A]`[cite: 21]
- [ ] **B.** Duduk santai/lesehan di karpet dengan meja lipat. `[Klaster: ENV | Skor: B]`[cite: 21]
- [ ] **C.** Berpindah-pindah (kadang di kasur, kadang di lantai, kadang tengkurap). `[Klaster: ENV | Skor: C]`[cite: 21]

**9. Bagaimana kebiasaanmu dengan makanan atau minuman saat sedang fokus belajar?**[cite: 21]

- [ ] **A.** Tidak suka makan atau minum sama sekali karena takut mengotori buku/bikin tidak fokus. `[Klaster: ENV | Skor: A]`[cite: 21]
- [ ] **B.** Menyiapkan segelas air putih atau minuman segar di dekat meja. `[Klaster: ENV | Skor: B]`[cite: 21]
- [ ] **C.** Wajib ada camilan, permen, atau makanan ringan yang bisa dikunyah selama belajar. `[Klaster: ENV | Skor: C]`[cite: 21]

**10. Kondisi pencahayaan ruangan seperti apa yang membuat matamu tidak cepat lelah?**[cite: 21]

- [ ] **A.** Lampu ruangan yang sangat terang benderang. `[Klaster: ENV | Skor: A]`[cite: 21]
- [ ] **B.** Cahaya alami dari jendela di siang hari atau lampu ruangan standar. `[Klaster: ENV | Skor: B]`[cite: 21]
- [ ] **C.** Agak redup, misalnya hanya menyalakan lampu belajar kecil di atas meja. `[Klaster: ENV | Skor: C]`[cite: 21]

##### Bagian 3: Rentang Fokus & Jeda Istirahat (Soal 11–15)

**11. Biasanya, berapa lama kamu bisa benar-benar fokus membaca atau menghitung sebelum merasa ingin berhenti/bosan?**[cite: 21]

- [ ] **A.** Sangat lama, bisa lebih dari 1 jam penuh tanpa henti. `[Klaster: FOCUS | Skor: A]`[cite: 21]
- [ ] **B.** Sekitar 30 hingga 45 menit. `[Klaster: FOCUS | Skor: B]`[cite: 21]
- [ ] **C.** Sangat sebentar, kurang dari 20 menit sudah ingin melakukan hal lain. `[Klaster: FOCUS | Skor: C]`[cite: 21]

**12. Jika kamu dihadapkan pada tugas yang sangat banyak, bagaimana caramu menyelesaikannya?**[cite: 21]

- [ ] **A.** Duduk dan tidak akan beranjak sampai 100% tugas itu selesai (sistem maraton). `[Klaster: FOCUS | Skor: A]`[cite: 21]
- [ ] **B.** Mengerjakan setengahnya, istirahat sebentar, lalu lanjut lagi (dibagi 2–3 sesi). `[Klaster: FOCUS | Skor: B]`[cite: 21]
- [ ] **C.** Mengerjakan sedikit-sedikit, diselingi main gawai atau mengobrol, lalu dikerjakan lagi (sistem cicil). `[Klaster: FOCUS | Skor: C]`[cite: 21]

**13. Saat kamu mengambil waktu istirahat (jeda) di tengah belajar, apa yang biasanya kamu lakukan?**[cite: 21]

- [ ] **A.** Tetap di kursi, hanya meregangkan badan atau memejamkan mata sebentar. `[Klaster: FOCUS | Skor: A]`[cite: 21]
- [ ] **B.** Bangun dari kursi, berjalan ke dapur ambil minum atau pergi ke toilet. `[Klaster: FOCUS | Skor: B]`[cite: 21]
- [ ] **C.** Langsung mengecek gawai, bermain game, atau tiduran (dan kadang jadi malas lanjut belajar). `[Klaster: FOCUS | Skor: C]`[cite: 21]

**14. Jika kamu sudah "buntu" atau stuck saat memecahkan satu soal yang susah, apa yang kamu lakukan?**[cite: 21]

- [ ] **A.** Terus memaksa memikirkannya sampai jawabannya ketemu, pantang menyerah. `[Klaster: FOCUS | Skor: A]`[cite: 21]
- [ ] **B.** Bertanya kepada teman, guru, atau mencari rumus di internet. `[Klaster: FOCUS | Skor: B]`[cite: 21]
- [ ] **C.** Menutup buku, meninggalkan soal itu dulu, atau ganti mengerjakan pelajaran lain yang lebih mudah. `[Klaster: FOCUS | Skor: C]`[cite: 21]

**15. Mana pernyataan yang paling menggambarkan dirimu saat akhir pekan tiba?**[cite: 21]

- [ ] **A.** Saya membuat daftar rencana kegiatan apa saja yang akan saya lakukan hari ini. `[Klaster: FOCUS | Skor: A]`[cite: 21]
- [ ] **B.** Saya punya gambaran kasar mau ngapain, tapi kalau berubah tidak apa-apa. `[Klaster: FOCUS | Skor: B]`[cite: 21]
- [ ] **C.** Saya jalani saja hari ini mengalir tanpa rencana sama sekali. `[Klaster: FOCUS | Skor: C]`[cite: 21]

#### D. Algoritma Skoring Multi-Klaster & Panduan Intervensi Guru Privat (`PM-SKB-03`)

Asesmen ini **tidak** mencari 1 gaya dominan keseluruhan, melainkan menghasilkan **3 instruksi spesifik (1 per bagian/klaster)** berdasarkan opsi yang paling banyak dipilih (mayoritas dari 5 soal di masing-masing bagian)[cite: 21, 22].

- _Catatan Tie-Breaker untuk Sistem:_ Jika pada 5 soal terjadi nilai seri (misal: 2A, 2B, 1C), gunakan jawaban pada soal kunci (_anchor question_) di masing-masing bagian sebagai penentu:
  - Anchor Bagian 1: **Soal Nomor 1**
  - Anchor Bagian 2: **Soal Nomor 6**
  - Anchor Bagian 3: **Soal Nomor 11**

##### 1. Output Skoring Bagian 1 (Jam Biologis — Soal 1–5):

- **Dominan A = Morning Person**
  > Guru privat disarankan menjadwalkan les di pagi/siang hari, terutama akhir pekan[cite: 22]. Jika les terpaksa malam hari, berikan materi hafalan/review ringan saja, jangan berikan konsep rumit yang baru[cite: 22].
- **Dominan B = Afternoon Person**
  > Performa otak stabil di sore hari sepulang sekolah[cite: 22].
- **Dominan C = Night Owl**
  > Anak ini baru memiliki mood dan fokus tajam di malam hari[cite: 22]. Penjadwalan les privat jam 18.30 ke atas sangat direkomendasikan[cite: 22].

##### 2. Output Skoring Bagian 2 (Lingkungan Fisik — Soal 6–10):

- **Dominan A = Formal & Sensitive**
  > Guru les wajib menjaga keheningan, dilarang mengajak ngobrol di luar konteks pelajaran saat anak sedang fokus, dan pastikan meja bersih[cite: 22].
- **Dominan B = Moderate / Flexible**
  > Anak adaptif, guru les bisa mengajar di ruang tamu keluarga tanpa masalah[cite: 22].
- **Dominan C = Casual & Stimulated**
  > Guru les dilarang kaku[cite: 22]. Izinkan anak belajar sambil makan camilan, lesehan di karpet, atau pasang lagu instrumental dengan volume pelan agar anak tidak mengantuk atau bosan[cite: 22].

##### 3. Output Skoring Bagian 3 (Rentang Fokus — Soal 11–15):

- **Dominan A = Tipe Maraton**
  > Guru les bisa langsung memberikan ujian simulasi atau menerangkan bab panjang tanpa henti[cite: 22]. Anak ini benci diganggu jika sedang asyik belajar[cite: 22].
- **Dominan B = Tipe Pomodoro**
  > Terapkan jeda 5 menit setiap 30 menit[cite: 22]. Izinkan anak ke toilet atau sekadar minum air putih[cite: 22].
- **Dominan C = Tipe Sprint**
  > Rentang fokus sangat pendek[cite: 22]. Guru les wajib mengganti metode setiap 15 menit (15 menit teori, 15 menit tanya jawab, 15 menit games soal)[cite: 22]. Jangan pernah ceramah lebih dari 15 menit[cite: 22].

---

## BAGIAN 4: RINGKASAN SKEMA DATA & LOGIKA BACKEND (DEVELOPER NOTES)

Bagian ini merupakan panduan implementasi teknis untuk _software engineer_ saat membangun _database_ dan _scoring engine_ di platform website Persona Academy:

### 4.1 Tabel Konfigurasi Jumlah Soal per Jenjang (Paket 1)

| Jenjang Siswa |      `PM-VAK-01` (VAK)      | `PM-HEM-02` (Dominasi Otak)  | `PM-SKB-03` (Kebiasaan Belajar) | Total Soal Dikerjakan |
| :------------ | :-------------------------: | :--------------------------: | :-----------------------------: | :-------------------: |
| **SD**        | 15 Soal (No. 1–15)[cite: 6] | 10 Soal (No. 1–10)[cite: 14] |  15 Soal (No. 1–15)[cite: 19]   |      **40 Soal**      |
| **SMP**       | 20 Soal (No. 1–20)[cite: 6] | 15 Soal (No. 1–15)[cite: 14] |  15 Soal (No. 1–15)[cite: 19]   |      **50 Soal**      |
| **SMA**       | 30 Soal (No. 1–30)[cite: 6] | 20 Soal (No. 1–20)[cite: 14] |  15 Soal (No. 1–15)[cite: 19]   |      **65 Soal**      |

### 4.2 Contoh Struktur JSON Output Hasil Asesmen Paket 1 (Untuk Dashboard UI/UX)

```json
{
  "package_code": "PAKET_1_PERSONA_MODALITY",
  "student_level": "SMA",
  "modules": {
    "PM_VAK_01": {
      "total_questions": 30,
      "scores": {
        "V": 16,
        "A": 8,
        "K": 6
      },
      "percentages": {
        "V": 53.33,
        "A": 26.67,
        "K": 20.0
      },
      "dominance_type": "SINGLE_DOMINANCE",
      "primary_modality": "VISUAL",
      "secondary_modality": null
    },
    "PM_HEM_02": {
      "total_questions": 20,
      "scores": {
        "LEFT_BRAIN": 7,
        "RIGHT_BRAIN": 13
      },
      "percentages": {
        "LEFT_BRAIN": 35.0,
        "RIGHT_BRAIN": 65.0
      },
      "dominance_category": "WHOLE_BRAIN",
      "tutor_sop_key": "SOP_HEM_WHOLE_BRAIN"
    },
    "PM_SKB_03": {
      "total_questions": 15,
      "clusters": {
        "chronobiology": {
          "scores": { "A": 1, "B": 1, "C": 3 },
          "result": "NIGHT_OWL",
          "tutor_sop_key": "SOP_BIO_C"
        },
        "environment": {
          "scores": { "A": 4, "B": 1, "C": 0 },
          "result": "FORMAL_AND_SENSITIVE",
          "tutor_sop_key": "SOP_ENV_A"
        },
        "attention_span": {
          "scores": { "A": 1, "B": 3, "C": 1 },
          "result": "TIPE_POMODORO",
          "tutor_sop_key": "SOP_FOCUS_B"
        }
      }
    }
  }
}
```
