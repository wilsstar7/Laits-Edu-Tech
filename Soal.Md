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
