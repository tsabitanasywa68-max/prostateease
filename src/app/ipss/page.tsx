"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // TAMBAHAN: Untuk redirect
import { ChevronLeft, ChevronRight, Info, FileText, Download, Home, Save, Loader2 } from 'lucide-react'; // TAMBAHAN: Icon baru

const ipssQuestions = [
  {
    id: 'q1',
    question: 'Seberapa sering Anda merasa masih ada sisa setelah selesai buang air kecil?',
    tooltip: 'Incomplete emptying: Sensasi bahwa kandung kemih tidak kosong sepenuhnya setelah berkemih',
  },
  {
    id: 'q2',
    question: 'Seberapa sering Anda harus kembali kencing dalam waktu kurang dari 2 jam setelah selesai kencing?',
    tooltip: 'Frequency: Frekuensi berkemih yang meningkat, biasanya lebih dari 8 kali dalam 24 jam',
  },
  {
    id: 'q3',
    question: 'Seberapa sering Anda mendapatkan bahwa Anda berhenti dan mulai lagi beberapa kali ketika Anda kencing?',
    tooltip: 'Intermittency: Aliran urin yang tidak kontinyu, berhenti dan mulai kembali selama proses berkemih',
  },
  {
    id: 'q4',
    question: 'Seberapa sering Anda merasa sulit untuk menahan kencing Anda?',
    tooltip: 'Urgency: Dorongan mendadak yang kuat dan sulit ditahan untuk segera berkemih',
  },
  {
    id: 'q5',
    question: 'Seberapa sering pancaran kencing Anda lemah?',
    tooltip: 'Weak stream: Pancaran urin yang berkurang kekuatannya dibandingkan kondisi normal',
  },
  {
    id: 'q6',
    question: 'Seberapa sering Anda harus mengejan untuk mulai kencing?',
    tooltip: 'Straining: Perlu mengejan atau mendorong untuk memulai atau mempertahankan aliran urin',
  },
  {
    id: 'q7',
    question: 'Seberapa sering Anda harus bangun untuk kencing, sejak mulai tidur pada malam hari hingga bangun di pagi hari?',
    tooltip: 'Nocturia: Terbangun pada malam hari untuk berkemih, mengganggu kualitas tidur',
  },
];

const answerOptions = [
  { value: 0, label: 'Tidak Pernah' },
  { value: 1, label: 'Kurang dari 1 dalam 5 kali' },
  { value: 2, label: 'Kurang dari setengah waktu' },
  { value: 3, label: 'Kira-kira setengah waktu' },
  { value: 4, label: 'Lebih dari setengah waktu' },
  { value: 5, label: 'Hampir selalu' },
];

const nocturiaOptions = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: '1 kali' },
  { value: 2, label: '2 kali' },
  { value: 3, label: '3 kali' },
  { value: 4, label: '4 kali' },
  { value: 5, label: '5 kali atau lebih' },
];

const qolOptions = [
  { value: 0, label: 'Senang sekali' },
  { value: 1, label: 'Senang' },
  { value: 2, label: 'Pada umumnya puas' },
  { value: 3, label: 'Campur antara puas dan tidak puas' },
  { value: 4, label: 'Pada umumnya tidak puas' },
  { value: 5, label: 'Tidak senang' },
  { value: 6, label: 'Buruk sekali' },
];

export default function IPSSForm() {
  const router = useRouter(); // TAMBAHAN: Hook Router
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({
    q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null, qol: null
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState('Pasien');
  const [isSaving, setIsSaving] = useState(false); // TAMBAHAN: State Loading

  // TAMBAHAN: Ambil user dari localStorage saat load agar nama di PDF benar
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name);
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }
  }, []);

  const totalSteps = 8;
  const isLastStep = currentStep === totalSteps - 1;
  const currentQuestion = currentStep < 7 ? ipssQuestions[currentStep] : null;

  const handleAnswer = (value: number) => {
    const key = currentStep < 7 ? `q${currentStep + 1}` : 'qol';
    setAnswers({ ...answers, [key]: value });
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setShowTooltip(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowTooltip(false);
    }
  };

  // --- PERBAIKAN UTAMA: FUNGSI SIMPAN KE DATABASE ---
  const saveAssessmentToDB = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        router.push('/login');
        return;
      }

      // Kirim data ke API Backend
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Wajib kirim token agar tidak jadi "Data Hantu"
        },
        body: JSON.stringify({
          ...answers, // q1, q2, dst...
          notes: 'Asesmen Mandiri via Web'
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan data ke server');
      }

      // Jika berhasil simpan, baru tampilkan hasil
      setShowResults(true);

    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data. Cek koneksi internet Anda.');
    } finally {
      setIsSaving(false);
    }
  };
  // --------------------------------------------------

  const handleSubmit = () => {
    const allAnswered = Object.values(answers).every(val => val !== null);
    if (!allAnswered) {
      alert('Mohon jawab semua pertanyaan terlebih dahulu');
      return;
    }
    // GANTI: Panggil fungsi simpan ke DB, bukan langsung showResults
    saveAssessmentToDB();
  };

  const calculateScore = () => {
    const symptomScore = (answers.q1 ?? 0) + (answers.q2 ?? 0) + (answers.q3 ?? 0) + 
                         (answers.q4 ?? 0) + (answers.q5 ?? 0) + (answers.q6 ?? 0) + (answers.q7 ?? 0);
    return symptomScore;
  };

  const getCategory = (score: number) => {
    if (score <= 7) return { name: 'Ringan', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-500', textColor: 'text-green-700' };
    if (score <= 19) return { name: 'Sedang', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-500', textColor: 'text-yellow-700' };
    return { name: 'Berat', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-500', textColor: 'text-red-700' };
  };

  const getDetailedRecommendation = (score: number, qolScore: number) => {
    if (score <= 7) {
      return {
        title: 'Hasil Asesmen: Gejala Ringan',
        interpretation: `Skor IPSS Anda adalah ${score} dari 35, yang mengindikasikan gejala Lower Urinary Tract Symptoms (LUTS) dalam kategori ringan. Dengan skor kualitas hidup ${qolScore} dari 6, kondisi Anda ${qolScore <= 2 ? 'tidak signifikan mengganggu' : 'mulai mempengaruhi'} aktivitas sehari-hari.`,
        clinicalSignificance: 'Pada kategori ini, gejala biasanya tidak memerlukan intervensi medis segera. Sebagian besar pasien dapat dikelola dengan modifikasi gaya hidup dan observasi berkala.',
        recommendations: [
          {
            category: 'Modifikasi Gaya Hidup',
            items: [
              'Batasi asupan cairan 2-3 jam sebelum waktu tidur untuk mengurangi nocturia',
              'Kurangi konsumsi kafein (kopi, teh, minuman bersoda) dan alkohol, terutama pada sore dan malam hari',
              'Hindari penggunaan dekongestan dan antihistamin yang dapat memperburuk gejala obstruktif',
              'Pertahankan berat badan ideal melalui diet seimbang dan aktivitas fisik teratur',
              'Lakukan teknik "double voiding": berkemih, tunggu beberapa detik, lalu coba berkemih lagi untuk memastikan pengosongan kandung kemih maksimal',
            ]
          },
          {
            category: 'Latihan Otot Dasar Panggul',
            items: [
              'Kegel exercises untuk pria: kontraksikan otot dasar panggul selama 5 detik, lepaskan 5 detik, ulangi 10-15 kali, 3 kali sehari',
              'Latihan ini dapat memperbaiki kontrol berkemih dan mengurangi gejala urgency',
            ]
          },
          {
            category: 'Monitoring dan Tindak Lanjut',
            items: [
              'Lakukan asesmen IPSS ulang setiap 6 bulan untuk memantau perkembangan gejala',
              'Catat pola berkemih dalam bladder diary selama 3-7 hari jika gejala memburuk',
              'Konsultasi dengan dokter jika skor meningkat lebih dari 3 poin atau muncul red flag symptoms',
            ]
          }
        ],
        followUp: 'Evaluasi ulang dalam 6 bulan. Jika gejala memburuk atau skor IPSS meningkat, pertimbangkan konsultasi dengan dokter umum atau urolog untuk evaluasi lebih lanjut.',
      };
    } else if (score <= 19) {
      return {
        title: 'Hasil Asesmen: Gejala Sedang',
        interpretation: `Skor IPSS Anda adalah ${score} dari 35, menunjukkan gejala LUTS kategori sedang. Skor kualitas hidup ${qolScore} dari 6 mengindikasikan bahwa gejala ${qolScore >= 3 ? 'secara signifikan mempengaruhi' : 'mulai mengganggu'} kualitas hidup Anda.`,
        clinicalSignificance: 'Pada kategori sedang, diperlukan evaluasi medis untuk menentukan etiologi dan mempertimbangkan terapi farmakologis. Kombinasi lifestyle modification dengan terapi medikamentosa biasanya memberikan hasil optimal.',
        recommendations: [
          {
            category: 'Evaluasi Medis yang Direkomendasikan',
            items: [
              'Konsultasi dengan dokter umum atau urolog untuk pemeriksaan fisik lengkap',
              'Digital Rectal Examination (DRE) untuk menilai ukuran, konsistensi, dan karakteristik prostat',
              'Urinalisis untuk menyingkirkan infeksi saluran kemih atau hematuria',
              'Pemeriksaan Post-Void Residual (PVR) urin untuk menilai pengosongan kandung kemih',
              'Pertimbangkan uroflowmetry jika tersedia untuk evaluasi objektif aliran urin',
            ]
          },
          {
            category: 'Pemeriksaan Penunjang Lanjutan',
            items: [
              'PSA (Prostate-Specific Antigen) untuk pria usia di atas 50 tahun atau dengan faktor risiko',
              'Ultrasonografi prostat transabdominal atau transrektal untuk mengukur volume prostat',
              'Pencitraan ginjal (USG) jika terdapat kecurigaan obstruksi upper urinary tract',
            ]
          },
          {
            category: 'Opsi Terapi Farmakologis',
            items: [
              'Alpha-blocker (tamsulosin, alfuzosin): terapi lini pertama untuk memperbaiki gejala voiding',
              '5-Alpha Reductase Inhibitor (finasteride, dutasteride): dipertimbangkan jika volume prostat >30 cc',
              'Antimuskarinik atau beta-3 agonist: untuk gejala storage predominan (frequency, urgency)',
              'Terapi kombinasi: alpha-blocker + 5-ARI untuk BPH dengan volume prostat besar',
            ]
          },
          {
            category: 'Modifikasi Gaya Hidup (Tetap Penting)',
            items: [
              'Terapkan semua rekomendasi untuk kategori ringan',
              'Bladder training: latihan menunda berkemih secara bertahap untuk meningkatkan kapasitas kandung kemih',
              'Hindari mengejan berlebihan saat berkemih untuk mencegah komplikasi',
            ]
          }
        ],
        followUp: 'Evaluasi ulang dalam 3 bulan setelah memulai terapi. Penilaian respons terapi menggunakan IPSS dan assessment kualitas hidup. Jika tidak ada perbaikan setelah 3-6 bulan terapi optimal, pertimbangkan rujukan ke urolog untuk evaluasi terapi lanjutan.',
      };
    } else {
      return {
        title: 'Hasil Asesmen: Gejala Berat',
        interpretation: `Skor IPSS Anda adalah ${score} dari 35, yang termasuk dalam kategori gejala LUTS berat. Skor kualitas hidup ${qolScore} dari 6 menunjukkan dampak signifikan terhadap kualitas hidup sehari-hari. Kondisi ini memerlukan evaluasi dan manajemen medis segera.`,
        clinicalSignificance: 'Gejala berat memerlukan evaluasi urologi komprehensif. Pasien dengan skor tinggi memiliki risiko lebih besar untuk komplikasi seperti retensi urin akut, infeksi saluran kemih berulang, atau deteriorasi fungsi ginjal. Intervensi aktif biasanya diperlukan.',
        recommendations: [
          {
            category: 'Tindakan Segera yang Diperlukan',
            items: [
              'Konsultasi dengan dokter urolog dalam waktu dekat (tidak menunggu)',
              'Pemeriksaan fungsi ginjal (ureum, kreatinin) untuk menilai adanya obstruksi upper tract',
              'Evaluasi komplikasi: retensi urin kronik, hidronefrosis, batu kandung kemih',
              'Pertimbangkan kateterisasi jika terdapat retensi urin atau PVR >300 mL',
            ]
          },
          {
            category: 'Evaluasi Diagnostik Komprehensif',
            items: [
              'Semua pemeriksaan untuk kategori sedang (DRE, urinalisis, PVR, PSA)',
              'Uroflowmetry dan pressure-flow study untuk konfirmasi obstruksi',
              'Ultrasonografi ginjal dan kandung kemih untuk deteksi hidronefrosis atau batu',
              'Cystoscopy jika dicurigai striktur uretra atau patologi kandung kemih',
              'Prostate volume assessment (TRUS) untuk perencanaan terapi',
            ]
          },
          {
            category: 'Opsi Manajemen Terapeutik',
            items: [
              'Terapi medis maksimal: kombinasi alpha-blocker + 5-ARI',
              'Evaluasi untuk terapi invasif minimal (TUMT, TUNA, UroLift, Rezum)',
              'Pertimbangkan TURP (Transurethral Resection of Prostate) sebagai gold standard',
              'Prostatektomi terbuka/laparoskopi untuk prostat sangat besar (>80-100 cc)',
              'Laser prostatectomy (HoLEP, PVP) sebagai alternatif dengan morbiditas lebih rendah',
            ]
          },
          {
            category: 'Indikasi Absolut untuk Intervensi Bedah',
            items: [
              'Retensi urin akut berulang yang gagal trial without catheter',
              'Gagal ginjal akibat obstruksi prostat (obstructive uropathy)',
              'Hematuria rekuren yang persisten akibat BPH',
              'Batu kandung kemih sekunder akibat residual urin',
              'Infeksi saluran kemih berulang yang refrakter terapi',
              'Divertikula kandung kemih besar simptomatik',
            ]
          }
        ],
        followUp: 'Rujukan ke urolog untuk evaluasi komprehensif dan perencanaan terapi definitif. Monitoring ketat diperlukan, terutama jika memilih terapi konservatif awal. Re-asesmen dalam 4-6 minggu atau lebih cepat jika terdapat perburukan gejala.',
      };
    }
  };

  const getRedFlags = () => {
    return [
      {
        title: 'Retensi Urin Akut',
        description: 'Ketidakmampuan total untuk berkemih disertai nyeri suprapubik hebat. Merupakan kegawatdaruratan urologi yang memerlukan kateterisasi segera.',
        action: 'Segera ke Unit Gawat Darurat'
      },
      {
        title: 'Hematuria Makroskopik',
        description: 'Urin berwarna merah atau kecoklatan yang terlihat jelas. Dapat mengindikasikan perdarahan dari prostat, kandung kemih, atau sistem urogenital lainnya.',
        action: 'Konsultasi urologi dalam 24-48 jam'
      },
      {
        title: 'Febris dengan Tanda Urosepsis',
        description: 'Demam tinggi (suhu >38.5°C), menggigil, nyeri pinggang, atau tanda syok. Dapat mengindikasikan pielonefritis atau prostatitis bakterial akut.',
        action: 'Segera ke Unit Gawat Darurat'
      },
      {
        title: 'Nyeri Pinggang Bilateral',
        description: 'Nyeri pada kedua sisi pinggang dapat mengindikasikan hidronefrosis bilateral akibat obstruksi outlet kandung kemih yang prolonged.',
        action: 'Evaluasi urologi segera dalam 24-48 jam'
      },
      {
        title: 'Azotemia/Gagal Ginjal',
        description: 'Peningkatan ureum dan kreatinin serum, oliguria, edema, atau gangguan elektrolit. Dapat merupakan komplikasi obstruksi kronik.',
        action: 'Konsultasi nefrologi dan urologi segera'
      }
    ];
  };

  const exportToPDF = () => {
    const score = calculateScore();
    const category = getCategory(score);
    const qolScore = answers.qol ?? 0;
    const recommendation = getDetailedRecommendation(score, qolScore);

    // Create PDF content
    const pdfContent = `
LAPORAN HASIL ASESMEN IPSS
International Prostate Symptom Score

═══════════════════════════════════════════════════════

IDENTITAS PASIEN
Nama: ${userName}
Tanggal Asesmen: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}

═══════════════════════════════════════════════════════

HASIL SKOR

Skor Total IPSS: ${score} / 35
Kategori: ${category.name}
Skor Kualitas Hidup: ${qolScore} / 6

Interpretasi Skor:
- 0-7: Gejala Ringan
- 8-19: Gejala Sedang  
- 20-35: Gejala Berat

═══════════════════════════════════════════════════════

RINCIAN JAWABAN

1. Incomplete Emptying: ${answers.q1}
2. Frequency: ${answers.q2}
3. Intermittency: ${answers.q3}
4. Urgency: ${answers.q4}
5. Weak Stream: ${answers.q5}
6. Straining: ${answers.q6}
7. Nocturia: ${answers.q7}

Quality of Life Score: ${qolScore}

═══════════════════════════════════════════════════════

INTERPRETASI KLINIS

${recommendation.interpretation}

${recommendation.clinicalSignificance}

═══════════════════════════════════════════════════════

REKOMENDASI

${recommendation.recommendations.map((rec, idx) => `
${rec.category}:
${rec.items.map((item, i) => `${i + 1}. ${item}`).join('\n')}
`).join('\n')}

═══════════════════════════════════════════════════════

TINDAK LANJUT

${recommendation.followUp}

═══════════════════════════════════════════════════════

DISCLAIMER

Hasil asesmen ini bersifat edukatif dan merupakan alat bantu penilaian
gejala Lower Urinary Tract Symptoms (LUTS). Hasil ini BUKAN merupakan
diagnosis medis definitif dan tidak menggantikan pemeriksaan klinis
oleh dokter.

Keputusan terapi harus dibuat oleh dokter berdasarkan evaluasi klinis
komprehensif yang mencakup anamnesis, pemeriksaan fisik, dan pemeriksaan
penunjang yang sesuai.

Segera hubungi fasilitas kesehatan jika mengalami:
- Ketidakmampuan berkemih (retensi urin)
- Demam tinggi dengan menggigil
- Nyeri hebat
- Hematuria masif

═══════════════════════════════════════════════════════

Dokumen ini dihasilkan oleh ProstatEase
Platform Monitoring Gejala Prostat Berbasis IPSS

www.prostateease.com
    `;

    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IPSS_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Laporan berhasil diunduh. Untuk format PDF yang lebih baik, silakan gunakan fitur print dan pilih "Save as PDF" pada browser Anda.');
  };

  if (showResults) {
    const score = calculateScore();
    const category = getCategory(score);
    const qolScore = answers.qol ?? 0;
    const recommendation = getDetailedRecommendation(score, qolScore);
    const redFlags = getRedFlags();

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h1 className="text-3xl font-bold text-white text-center">
                Hasil Asesmen IPSS
              </h1>
              <p className="text-blue-100 text-center mt-2">
                International Prostate Symptom Score
              </p>
            </div>

            <div className="p-8">
              
              {/* TAMBAHAN: Indikator Sukses Simpan */}
              <div className="mb-8 text-center bg-green-50 p-6 rounded-xl border border-green-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                    <Save className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Data Berhasil Disimpan!</h2>
                  <p className="text-gray-600">Hasil asesmen Anda telah direkam ke database.</p>
              </div>

              {/* Score Summary */}
              <div className={`${category.bgColor} border-2 ${category.borderColor} rounded-xl p-8 mb-8`}>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-gray-900 mb-2">{score}</div>
                  <div className="text-xl text-gray-600 mb-3">dari 35 poin</div>
                  <div className={`inline-block px-6 py-3 ${category.bgColor} ${category.textColor} rounded-full text-lg font-semibold border-2 ${category.borderColor}`}>
                    Kategori: {category.name}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Skor Kualitas Hidup</div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{qolScore}</div>
                    <div className="text-sm text-gray-600">dari 6 poin</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                      <div 
                        className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(qolScore / 6) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Tanggal Asesmen</div>
                    <div className="text-2xl font-semibold text-gray-900 mb-2">
                      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-600">Pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Score Breakdown */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2" size={24} />
                  Rincian Jawaban Kuesioner
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ipssQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">{q.question.substring(0, 50)}...</div>
                      <div className="text-2xl font-bold text-blue-600">{answers[`q${idx + 1}`]} / 5</div>
                    </div>
                  ))}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Kualitas Hidup Secara Keseluruhan</div>
                    <div className="text-2xl font-bold text-purple-600">{qolScore} / 6</div>
                  </div>
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{recommendation.title}</h2>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interpretasi Hasil</h4>
                    <p className="text-gray-700 leading-relaxed">{recommendation.interpretation}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Signifikansi Klinis</h4>
                    <p className="text-gray-700 leading-relaxed">{recommendation.clinicalSignificance}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Rekomendasi Tatalaksana</h2>
                
                {recommendation.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{rec.category}</h3>
                    <ul className="space-y-2">
                      {rec.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start text-gray-700">
                          <span className="text-blue-600 mr-3 mt-1">•</span>
                          <span className="flex-1 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Follow-up */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                  <Info className="mr-2" size={20} />
                  Rencana Tindak Lanjut
                </h3>
                <p className="text-gray-700 leading-relaxed">{recommendation.followUp}</p>
              </div>

              {/* Red Flags */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                  <Info className="mr-2 text-red-600" size={24} />
                  Tanda Bahaya yang Memerlukan Evaluasi Segera
                </h3>
                <p className="text-gray-700 mb-4">Segera hubungi fasilitas kesehatan atau Unit Gawat Darurat jika mengalami salah satu kondisi berikut:</p>
                
                <div className="space-y-4">
                  {redFlags.map((flag, idx) => (
                    <div key={idx} className="bg-white border-l-4 border-red-500 p-4 rounded-r-lg">
                      <h4 className="font-bold text-red-900 mb-2">{flag.title}</h4>
                      <p className="text-gray-700 text-sm mb-2">{flag.description}</p>
                      <div className="bg-red-100 px-3 py-1 rounded inline-block">
                        <span className="text-red-800 text-xs font-semibold">{flag.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* TOMBOL DASHBOARD (PENTING AGAR GRAFIK UPDATE) */}
                <button 
                  onClick={() => {
                    router.push('/dashboard');
                    router.refresh();
                  }}
                  className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-lg"
                >
                  <Home className="mr-2" size={20} />
                  Lihat Grafik
                </button>

                <button 
                  onClick={exportToPDF}
                  className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all shadow-lg"
                >
                  <Download className="mr-2" size={20} />
                  Unduh Laporan
                </button>

                <button 
                  onClick={() => window.print()}
                  className="flex items-center justify-center px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-all"
                >
                  <FileText className="mr-2" size={20} />
                  Cetak / Save PDF
                </button>
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3">Disclaimer Medis</h4>
                <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
                  <p>Hasil asesmen International Prostate Symptom Score (IPSS) ini merupakan alat bantu penilaian gejala Lower Urinary Tract Symptoms (LUTS) yang terstandarisasi dan tervalidasi secara internasional.</p>
                  
                  <p>Hasil ini bersifat edukatif dan BUKAN merupakan diagnosis medis definitif. Skor IPSS tidak dapat menentukan penyebab pasti gejala Anda dan tidak menggantikan pemeriksaan klinis komprehensif oleh dokter yang meliputi anamnesis lengkap, pemeriksaan fisik, dan pemeriksaan penunjang yang sesuai.</p>
                  
                  <p>Keputusan tatalaksana dan terapi harus dibuat oleh dokter yang merawat berdasarkan evaluasi klinis menyeluruh dengan mempertimbangkan kondisi medis individual, komorbiditas, preferensi pasien, dan guideline klinis terkini.</p>
                  
                  <p>Platform ProstatEase dan pembuat aplikasi ini tidak bertanggung jawab atas keputusan medis yang dibuat berdasarkan hasil asesmen ini tanpa konsultasi dengan tenaga kesehatan profesional.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentAnswer = currentStep < 7 
    ? answers[`q${currentStep + 1}`] 
    : answers.qol;

  // Determine which options to use for Q7 (nocturia)
  const currentOptions = currentStep === 6 ? nocturiaOptions : (currentStep === 7 ? qolOptions : answerOptions);
  const currentQText = currentStep < 7 ? currentQuestion : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Pertanyaan {currentStep + 1} dari {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Selesai
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {currentStep < 7 ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <div className="text-sm font-semibold text-blue-600 mb-2">
                    Pertanyaan {currentStep + 1}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {currentQuestion.question}
                  </h2>
                </div>
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="flex-shrink-0 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Lihat penjelasan"
                >
                  <Info size={24} />
                </button>
              </div>

              {showTooltip && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                  <div className="flex items-start">
                    <Info className="text-blue-600 mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Penjelasan Istilah Medis</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{currentQuestion.tooltip}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Periode penilaian:</span> Berdasarkan pengalaman Anda dalam satu bulan terakhir
                </p>
              </div>

              <div className="space-y-3">
                {currentOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                      currentAnswer === option.value
                        ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                          currentAnswer === option.value
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {currentAnswer === option.value && (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900 flex-1">{option.label}</span>
                      </div>
                      <span className={`text-2xl font-bold ml-4 ${
                        currentAnswer === option.value ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {option.value}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="text-sm font-semibold text-purple-600 mb-2">
                  Penilaian Kualitas Hidup
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-4">
                  Jika Anda harus menghabiskan sisa hidup dengan kondisi berkemih seperti sekarang, bagaimana perasaan Anda?
                </h2>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold text-purple-900">Quality of Life Assessment:</span> Pertanyaan ini mengukur dampak gejala berkemih terhadap kualitas hidup dan kesejahteraan Anda secara keseluruhan.
                </p>
              </div>

              <div className="space-y-3">
                {qolOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                      currentAnswer === option.value
                        ? 'border-purple-600 bg-purple-50 shadow-md transform scale-[1.02]'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                          currentAnswer === option.value
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {currentAnswer === option.value && (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900 flex-1">{option.label}</span>
                      </div>
                      <span className={`text-2xl font-bold ml-4 ${
                        currentAnswer === option.value ? 'text-purple-600' : 'text-gray-400'
                      }`}>
                        {option.value}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all"
            >
              <ChevronLeft size={20} className="mr-2" />
              Sebelumnya
            </button>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={currentAnswer === null || isSaving}
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
              >
                {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Menyimpan...
                    </>
                ) : (
                    <>
                      <FileText size={20} className="mr-2" />
                      Simpan & Lihat Hasil
                    </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentAnswer === null}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
              >
                Selanjutnya
                <ChevronRight size={20} className="ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Help Box */}
        <div className="bg-blue-50 rounded-xl p-5 shadow-sm">
          <div className="flex items-start">
            <Info className="text-blue-600 mr-3 mt-1 flex-shrink-0" size={20} />
            <div className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-900">Panduan Pengisian:</span> Jawab berdasarkan pengalaman Anda dalam satu bulan terakhir. Tidak ada jawaban yang benar atau salah. Kejujuran Anda akan membantu evaluasi kondisi kesehatan yang lebih akurat.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}