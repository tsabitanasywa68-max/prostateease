"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  AlertTriangle, 
  Activity, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  Info,
  Thermometer,
  Stethoscope
} from 'lucide-react';

// --- DATA STRUKTUR BARU (Tanpa Markdown Manual) ---

const educationTopics = [
  {
    id: 1,
    category: 'Dasar Pengetahuan',
    title: 'Apa itu BPH?',
    subtitle: 'Benign Prostatic Hyperplasia',
    icon: <BookOpen className="text-white" size={24} />,
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    content: [
      {
        type: 'text',
        text: 'BPH adalah pembesaran kelenjar prostat yang bersifat jinak (non-kanker). Kondisi ini sangat umum terjadi pada pria seiring bertambahnya usia.'
      },
      {
        type: 'list-box',
        title: 'Fakta Penting',
        items: [
          'Sekitar 50% pria usia 50-an mengalami BPH',
          'Meningkat menjadi 80-90% pada pria usia 70-80 tahun',
          'Tidak semua pembesaran prostat menyebabkan gejala',
          'BPH BUKAN kanker dan tidak meningkatkan risiko kanker prostat'
        ]
      },
      {
        type: 'section',
        title: 'Penyebab',
        text: 'Penyebab pasti BPH belum diketahui, tetapi faktor yang berperan meliputi perubahan hormonal seiring usia (testosteron & DHT), riwayat keluarga, dan gaya hidup (obesitas, kurang aktivitas fisik).'
      },
      {
        type: 'info-box',
        title: 'Anatomi Prostat',
        text: 'Prostat adalah kelenjar seukuran kenari yang terletak di bawah kandung kemih dan mengelilingi uretra (saluran kemih). Ketika prostat membesar, ia menekan uretra dan menyebabkan gangguan aliran urin.'
      }
    ]
  },
  {
    id: 2,
    category: 'Gejala & Tanda',
    title: 'Memahami Gejala LUTS',
    subtitle: 'Lower Urinary Tract Symptoms',
    icon: <Activity className="text-white" size={24} />,
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    content: [
      {
        type: 'text',
        text: 'Gejala saluran kemih bawah (LUTS) dibagi menjadi dua kategori utama. Memahami perbedaannya membantu dokter menentukan jenis pengobatan.'
      },
      {
        type: 'grid-comparison', // Tampilan kolom berdampingan
        columns: [
          {
            title: '1. Gejala Penyimpanan',
            subtitle: '(Storage Symptoms)',
            desc: 'Masalah saat kandung kemih menampung urin (mengganggu aktivitas harian & tidur).',
            items: [
              { term: 'Frequency', def: 'Buang air kecil sangat sering (>8x sehari).' },
              { term: 'Nocturia', def: 'Terbangun malam hari untuk kencing (>1x).' },
              { term: 'Urgency', def: 'Keinginan kencing mendadak yang sulit ditahan.' },
              { term: 'Urge Incontinence', def: 'Mengompol karena tidak sempat ke toilet.' }
            ]
          },
          {
            title: '2. Gejala Pengosongan',
            subtitle: '(Voiding Symptoms)',
            desc: 'Masalah saat mengeluarkan urin (biasanya akibat sumbatan prostat).',
            items: [
              { term: 'Hesitancy', def: 'Harus menunggu lama sebelum urin keluar.' },
              { term: 'Weak Stream', def: 'Pancaran urin lemah, tidak memancar jauh.' },
              { term: 'Intermittency', def: 'Aliran kencing terputus-putus.' },
              { term: 'Straining', def: 'Harus mengejan untuk memulai kencing.' },
              { term: 'Incomplete Emptying', def: 'Terasa masih ada sisa setelah selesai.' }
            ]
          }
        ]
      },
      {
        type: 'note',
        text: 'Catatan: Tidak semua LUTS disebabkan oleh BPH. Penyebab lain termasuk infeksi saluran kemih, batu kandung kemih, atau diabetes.'
      }
    ]
  },
  {
    id: 3,
    category: 'Peringatan Medis',
    title: 'Tanda Bahaya (Red Flags)',
    subtitle: 'Kapan Harus Segera ke IGD?',
    icon: <AlertTriangle className="text-white" size={24} />,
    color: 'bg-red-600',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-200',
    content: [
      {
        type: 'alert-section',
        title: 'Segera ke Unit Gawat Darurat (IGD) Jika:',
        items: [
          { title: 'Retensi Urin Akut', desc: 'Sama sekali tidak bisa kencing, disertai nyeri hebat di perut bawah.' },
          { title: 'Demam Tinggi Menggigil', desc: 'Disertai nyeri pinggang, curiga infeksi ginjal berat.' },
          { title: 'Gagal Ginjal Akut', desc: 'Mual muntah hebat, bengkak seluruh tubuh, produksi urin berhenti.' }
        ]
      },
      {
        type: 'warning-list',
        title: 'Segera Konsultasi ke Dokter (Urgent):',
        items: [
          { term: 'Hematuria', def: 'Kencing berdarah (merah terang/gumpalan).' },
          { term: 'Inkontinensia', def: 'Hilangnya kontrol kencing (mengompol) tiba-tiba.' },
          { term: 'Nyeri Menetap', def: 'Nyeri atau panas saat kencing yang tidak kunjung sembuh.' }
        ]
      },
      {
        type: 'info-box',
        title: 'Tentang PSA (Prostate Specific Antigen)',
        text: 'Tes darah PSA disarankan untuk pria >50 tahun dengan gejala, atau >45 tahun jika ada riwayat kanker prostat di keluarga. Ini adalah skrining awal, bukan diagnosis pasti kanker.'
      }
    ]
  },
  {
    id: 4,
    category: 'Diagnosis',
    title: 'Pemeriksaan & Evaluasi',
    subtitle: 'Apa yang Dokter Lakukan?',
    icon: <Search className="text-white" size={24} />,
    color: 'bg-purple-600',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    content: [
      {
        type: 'step-list',
        title: 'Pemeriksaan Dasar',
        steps: [
          { title: 'Anamnesis & IPSS', desc: 'Wawancara gejala dan pengisian kuesioner skor gejala.' },
          { title: 'Colok Dubur (DRE)', desc: 'Dokter meraba prostat untuk menilai ukuran dan konsistensi (lunak/keras).' },
          { title: 'Urinalisis', desc: 'Cek lab urin untuk melihat adanya infeksi, darah, atau gula.' },
          { title: 'USG / PVR', desc: 'Melihat sisa urin di kandung kemih setelah pasien kencing.' }
        ]
      },
      {
        type: 'step-list',
        title: 'Pemeriksaan Lanjutan (Jika Perlu)',
        steps: [
          { title: 'Uroflowmetry', desc: 'Mesin khusus untuk mengukur kecepatan pancaran urin.' },
          { title: 'USG Prostat (TRUS)', desc: 'USG lewat dubur untuk mengukur volume prostat secara akurat.' },
          { title: 'Biopsi Prostat', desc: 'Hanya dilakukan jika ada kecurigaan kanker (PSA tinggi atau DRE abnormal).' }
        ]
      }
    ]
  },
  {
    id: 5,
    category: 'Tatalaksana',
    title: 'Pilihan Pengobatan',
    subtitle: 'Dari Gaya Hidup hingga Operasi',
    icon: <Stethoscope className="text-white" size={24} />,
    color: 'bg-orange-600',
    lightColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    content: [
      {
        type: 'text',
        text: 'Pengobatan disesuaikan dengan tingkat keparahan gejala (Skor IPSS) dan ukuran prostat. Konsultasikan selalu dengan dokter.'
      },
      {
        type: 'accordion-list',
        items: [
          {
            title: '1. Observasi & Gaya Hidup (Gejala Ringan)',
            details: [
              'Kurangi kafein (kopi/teh) dan alkohol.',
              'Batasi minum 2 jam sebelum tidur (untuk kurangi bangun malam).',
              'Latihan kandung kemih (Bladder Training) dan senam Kegel.',
              'Hindari obat pilek yang mengandung dekongestan (bisa bikin macet kencing).'
            ]
          },
          {
            title: '2. Obat-obatan (Gejala Sedang)',
            details: [
              'Alpha-blocker (Tamsulosin, dll): Melebarkan saluran kencing. Efek cepat.',
              '5-ARI (Finasteride/Dutasteride): Mengecilkan prostat. Butuh waktu 3-6 bulan.',
              'Kombinasi keduanya untuk hasil maksimal pada prostat besar.'
            ]
          },
          {
            title: '3. Operasi (Gejala Berat/Komplikasi)',
            details: [
              'TURP: "Mengerok" prostat lewat saluran kencing (Gold Standard).',
              'Laser Prostatectomy: Lebih sedikit pendarahan.',
              'Operasi Terbuka: Hanya untuk prostat yang sangat besar (>80-100 gram).'
            ]
          }
        ]
      }
    ]
  }
];

const faqs = [
  { q: 'Apakah BPH bisa menyebabkan kanker prostat?', a: 'TIDAK. BPH dan kanker prostat adalah dua kondisi berbeda. Namun, keduanya bisa terjadi bersamaan pada pria lanjut usia.' },
  { q: 'Apakah obat BPH harus diminum seumur hidup?', a: 'Umumnya ya, terutama untuk menjaga agar saluran kencing tetap terbuka. Jika obat dihentikan, gejala seringkali kembali.' },
  { q: 'Apakah sering menahan kencing menyebabkan BPH?', a: 'Tidak menyebabkan BPH, tetapi bisa memperburuk fungsi kandung kemih dan meningkatkan risiko infeksi.' },
  { q: 'Kapan waktu terbaik minum obat prostat?', a: 'Obat golongan Alpha-blocker (Tamsulosin) sebaiknya diminum setelah makan malam atau sebelum tidur untuk mengurangi efek pusing.' }
];

export default function EducationModule() {
  const router = useRouter();
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleTopic = (id: number) => {
    setExpandedTopic(expandedTopic === id ? null : id);
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // --- KOMPONEN RENDERER (Agar tampilan rapi sesuai tipe data) ---
  const renderContent = (section: any, index: number) => {
    switch (section.type) {
      case 'text':
        return <p key={index} className="text-gray-700 leading-relaxed mb-4">{section.text}</p>;
      
      case 'list-box':
        return (
          <div key={index} className="bg-white border-l-4 border-blue-500 shadow-sm p-4 rounded-r-lg mb-6">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center">
              <Info size={18} className="mr-2 text-blue-500" /> {section.title}
            </h4>
            <ul className="space-y-1">
              {section.items.map((item: string, i: number) => (
                <li key={i} className="flex items-start text-gray-700 text-sm">
                  <span className="mr-2 text-blue-500">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'section':
        return (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
            <p className="text-gray-700 leading-relaxed">{section.text}</p>
          </div>
        );

      case 'info-box':
        return (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h4 className="font-bold text-gray-800 mb-1">{section.title}</h4>
            <p className="text-sm text-gray-600">{section.text}</p>
          </div>
        );

      case 'grid-comparison':
        return (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {section.columns.map((col: any, colIdx: number) => (
              <div key={colIdx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="border-b border-gray-300 pb-2 mb-3">
                  <h4 className="font-bold text-gray-900">{col.title}</h4>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{col.subtitle}</span>
                </div>
                <p className="text-xs text-gray-600 mb-3 italic">{col.desc}</p>
                <ul className="space-y-3">
                  {col.items.map((item: any, i: number) => (
                    <li key={i} className="text-sm">
                      <span className="font-bold text-gray-800 block">{item.term}</span>
                      <span className="text-gray-600">{item.def}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'alert-section':
        return (
          <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
            <h4 className="font-bold text-red-700 mb-3 flex items-center">
              <AlertTriangle size={20} className="mr-2" /> {section.title}
            </h4>
            <div className="space-y-3">
              {section.items.map((item: any, i: number) => (
                <div key={i} className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-red-100">
                  <div className="min-w-[120px] font-bold text-red-800 text-sm">{item.title}</div>
                  <div className="text-sm text-gray-700">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'warning-list':
        return (
           <div key={index} className="mb-6">
             <h4 className="font-bold text-gray-900 mb-3">{section.title}</h4>
             <ul className="grid grid-cols-1 gap-2">
               {section.items.map((item: any, i: number) => (
                 <li key={i} className="flex items-center text-sm p-2 bg-white rounded border border-gray-100 shadow-sm">
                   <span className="font-bold text-gray-800 mr-2 min-w-[100px]">{item.term}:</span>
                   <span className="text-gray-600">{item.def}</span>
                 </li>
               ))}
             </ul>
           </div>
        );

      case 'step-list':
        return (
          <div key={index} className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3 pb-1 border-b">{section.title}</h4>
            <div className="space-y-4">
              {section.steps.map((step: any, i: number) => (
                <div key={i} className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    {i !== section.steps.length - 1 && <div className="h-full w-0.5 bg-blue-50 my-1"></div>}
                  </div>
                  <div className="pb-4">
                    <h5 className="font-bold text-gray-800 text-sm">{step.title}</h5>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'accordion-list':
        return (
          <div key={index} className="space-y-3 mb-6">
            {section.items.map((item: any, i: number) => (
              <div key={i} className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-2">{item.title}</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 pl-1">
                  {item.details.map((detail: string, dIdx: number) => (
                    <li key={dIdx}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'note':
        return <p key={index} className="text-xs text-gray-500 italic mt-4 border-t pt-2">{section.text}</p>;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navbar Simple */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-blue-600 transition"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="font-medium">Kembali</span>
            </button>
            <span className="font-bold text-gray-800">Pusat Edukasi</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Kesehatan Prostat & BPH
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Informasi medis terpercaya untuk membantu Anda memahami gejala, penyebab, dan pilihan penanganan pembesaran prostat.
          </p>
        </div>

        {/* Education Topics Cards */}
        <div className="space-y-6 mb-16">
          {educationTopics.map((topic) => (
            <div 
              key={topic.id} 
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
                expandedTopic === topic.id ? `ring-2 ring-opacity-50 ${topic.borderColor.replace('border-', 'ring-')}` : 'border-gray-100 hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <button
                onClick={() => toggleTopic(topic.id)}
                className="w-full flex items-center justify-between p-5 text-left bg-white focus:outline-none"
              >
                <div className="flex items-center space-x-5">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${topic.color}`}>
                    {topic.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      {topic.category}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {topic.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{topic.subtitle}</p>
                  </div>
                </div>
                <div className={`transform transition-transform duration-300 ${expandedTopic === topic.id ? 'rotate-180' : ''}`}>
                  <ChevronDown className="text-gray-400" />
                </div>
              </button>

              {/* Card Content (Expandable) */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  expandedTopic === topic.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`p-6 border-t border-gray-100 ${topic.lightColor}`}>
                   {topic.content.map((section, idx) => renderContent(section, idx))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Info className="mr-3 text-blue-600" />
            Pertanyaan Umum (FAQ)
          </h2>
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, index) => (
              <div key={index} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start justify-between text-left focus:outline-none group"
                >
                  <span className={`font-semibold pr-4 transition-colors ${expandedFAQ === index ? 'text-blue-600' : 'text-gray-800 group-hover:text-blue-600'}`}>
                    {faq.q}
                  </span>
                  {expandedFAQ === index ? (
                    <ChevronUp className="text-blue-600 flex-shrink-0 mt-1" size={18} />
                  ) : (
                    <ChevronDown className="text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1" size={18} />
                  )}
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${
                  expandedFAQ === index ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <p className="text-gray-600 text-sm leading-relaxed pl-1 border-l-2 border-blue-100">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-10 text-center pb-10">
          <p className="text-gray-500 text-sm mb-4">Punya keluhan yang tidak tercantum di sini?</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
          >
            Kembali ke Dashboard Utama
          </button>
        </div>

      </div>
    </div>
  );
}