"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Activity, Calendar, FileText, Download, User, Loader2, X, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Definisi Tipe Data sesuai Database
interface Assessment {
  id: number;
  date: string;
  total_score: number; // Perhatikan: dari DB biasanya pakai underscore
  category: string;
  qol: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
}

export default function Dashboard() {
  const router = useRouter();
  
  // State Data
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Pasien");
  
  // State untuk Modal Detail
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // --- 1. FETCH DATA DARI API (Supaya Grafik Update) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil User Info
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.name);
        }

        if (!token) {
          router.push('/login');
          return;
        }

        // Panggil API
        const res = await fetch('/api/assessments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Gagal mengambil data');

        const data = await res.json();
        
        // Urutkan data dari yang terlama ke terbaru untuk grafik (reverse)
        // Karena API biasanya return terbaru dulu (DESC)
        const sortedData = (data.assessments || []).sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setAssessments(sortedData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // --- LOGIKA HITUNGAN ---
  const latestAssessment = assessments.length > 0 ? assessments[assessments.length - 1] : null;
  const previousAssessment = assessments.length > 1 ? assessments[assessments.length - 2] : latestAssessment;

  const scoreChange = latestAssessment && previousAssessment 
    ? latestAssessment.total_score - previousAssessment.total_score 
    : 0;
  
  const isImproving = scoreChange <= 0; // Skor turun = Membaik

  // Data untuk Grafik (Mapping dari snake_case DB ke Label Grafik)
  const chartData = assessments.map(a => ({
    date: new Date(a.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    'Skor IPSS': a.total_score,
    'QoL': a.qol,
  }));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Ringan': return 'green';
      case 'Sedang': return 'yellow';
      case 'Berat': return 'red';
      default: return 'gray';
    }
  };

  const categoryColor = latestAssessment ? getCategoryColor(latestAssessment.category) : 'gray';

  // --- 2. EXPORT EXCEL LENGKAP (Per Soal) ---
  const handleExport = () => {
    if (assessments.length === 0) return alert("Belum ada data untuk diekspor");

    // Header CSV (Sesuai permintaan: Poin per soal & Total)
    const headers = [
      "No",
      "Tanggal",
      "Jam",
      "Q1 (Sisa)",
      "Q2 (Frekuensi)",
      "Q3 (Terputus)",
      "Q4 (Menahan)",
      "Q5 (Pancaran Lemah)",
      "Q6 (Mengejan)",
      "Q7 (Bangun Malam)",
      "Total Skor IPSS",
      "Skor QoL (Kualitas Hidup)",
      "Kategori"
    ];

    // Baris Data
    const rows = assessments.map((a, index) => {
      const dateObj = new Date(a.date);
      const date = dateObj.toLocaleDateString('id-ID');
      const time = dateObj.toLocaleTimeString('id-ID');
      
      return [
        index + 1,
        date,
        time,
        a.q1, a.q2, a.q3, a.q4, a.q5, a.q6, a.q7, // Poin per soal
        a.total_score,
        a.qol,
        a.category
      ].join(",");
    });

    // Gabungkan & Download
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_IPSS_${userName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 3. KOMPONEN MODAL DETAIL ---
  const DetailModal = () => {
    if (!selectedAssessment) return null;

    const questions = [
      "Merasa ada sisa (Incomplete Emptying)",
      "Kembali kencing < 2 jam (Frequency)",
      "Kencing terputus-putus (Intermittency)",
      "Sulit menahan kencing (Urgency)",
      "Pancaran lemah (Weak Stream)",
      "Harus mengejan (Straining)",
      "Bangun malam (Nocturia)"
    ];

    // Mapping nilai q1..q7 ke array
    const answers = [
      selectedAssessment.q1, selectedAssessment.q2, selectedAssessment.q3,
      selectedAssessment.q4, selectedAssessment.q5, selectedAssessment.q6,
      selectedAssessment.q7
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Detail Asesmen</h3>
              <p className="text-sm text-gray-500">
                {new Date(selectedAssessment.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
              </p>
            </div>
            <button onClick={() => setSelectedAssessment(null)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="text-gray-500" />
            </button>
          </div>
          
          <div className="p-6">
            {/* Skor Utama */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <div className="text-sm text-gray-600 mb-1">Total Skor IPSS</div>
                <div className="text-3xl font-bold text-blue-700">{selectedAssessment.total_score}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-800 mt-1">{selectedAssessment.category}</div>
              </div>
              <div className="flex-1 bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                <div className="text-sm text-gray-600 mb-1">Kualitas Hidup (QoL)</div>
                <div className="text-3xl font-bold text-purple-700">{selectedAssessment.qol}</div>
                <div className="text-xs text-purple-800 mt-1">/ 6 Poin</div>
              </div>
            </div>

            {/* Tabel Rincian */}
            <h4 className="font-bold text-gray-800 mb-4">Rincian Jawaban:</h4>
            <div className="bg-gray-50 rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">No</th>
                    <th className="p-3 text-left">Pertanyaan Gejala</th>
                    <th className="p-3 text-center">Skor (0-5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {questions.map((q, idx) => (
                    <tr key={idx} className="hover:bg-white">
                      <td className="p-3 font-medium text-gray-500">{idx + 1}</td>
                      <td className="p-3 text-gray-800">{q}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{answers[idx]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-6 border-t bg-gray-50 flex justify-end">
            <button 
              onClick={() => setSelectedAssessment(null)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat Data Kesehatan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Modal Popup */}
      <DetailModal />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ProstatEase</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm hidden sm:block">Halo, {userName}</span>
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <User size={20} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Anda</h1>
          <p className="text-gray-600">Pantau perkembangan gejala prostat Anda dari waktu ke waktu</p>
        </div>

        {assessments.length === 0 ? (
          // TAMPILAN JIKA BELUM ADA DATA
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Data Asesmen</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Anda belum melakukan pengisian kuesioner IPSS. Silakan isi asesmen pertama Anda untuk melihat analisis kesehatan.</p>
            <button 
              onClick={() => router.push('/ipss')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg transition-all"
            >
              Mulai Asesmen Sekarang
            </button>
          </div>
        ) : (
          // TAMPILAN JIKA ADA DATA
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Latest Score */}
              <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${categoryColor}-500 transition hover:shadow-lg`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-600 font-medium">Skor Terakhir</div>
                  <Activity className={`text-${categoryColor}-500`} size={20} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {latestAssessment?.total_score || 0}
                </div>
                <div className={`inline-block px-3 py-1 bg-${categoryColor}-100 text-${categoryColor}-700 rounded-full text-sm font-medium`}>
                  {latestAssessment?.category || '-'}
                </div>
              </div>

              {/* Trend */}
              <div className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-600 font-medium">Perubahan</div>
                  {isImproving ? (
                    <TrendingDown className="text-green-500" size={20} />
                  ) : (
                    <TrendingUp className="text-red-500" size={20} />
                  )}
                </div>
                <div className={`text-3xl font-bold ${isImproving ? 'text-green-600' : 'text-red-600'} mb-1`}>
                  {scoreChange > 0 ? '+' : ''}{scoreChange}
                </div>
                <div className="text-sm text-gray-600">
                  {assessments.length > 1 
                    ? (isImproving ? 'Membaik dari sebelumnya' : 'Meningkat dari sebelumnya')
                    : 'Data awal'
                  }
                </div>
              </div>

              {/* Quality of Life */}
              <div className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-600 font-medium">Kualitas Hidup</div>
                  <FileText className="text-purple-500" size={20} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {latestAssessment?.qol || 0}<span className="text-lg text-gray-400 font-normal">/6</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((latestAssessment?.qol || 0) / 6) * 100}%` }}
                  />
                </div>
              </div>

              {/* Total Assessments */}
              <div className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-600 font-medium">Total Asesmen</div>
                  <Calendar className="text-blue-500" size={20} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {assessments.length}
                </div>
                <div className="text-sm text-gray-600">
                  Kali pengisian data
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Grafik Perkembangan Skor IPSS</h2>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#6B7280', fontSize: 12}}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#6B7280', fontSize: 12}}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Skor IPSS" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="QoL" 
                      stroke="#A855F7" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#A855F7', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <button 
                onClick={() => router.push('/ipss')}
                className="group bg-blue-600 text-white rounded-xl shadow-md p-6 hover:bg-blue-700 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Activity size={100} />
                </div>
                <FileText size={32} className="mb-3 relative z-10" />
                <h3 className="text-xl font-bold mb-2 relative z-10">Isi IPSS Baru</h3>
                <p className="text-blue-100 relative z-10">Mulai asesmen gejala bulan ini</p>
              </button>

              <button 
                onClick={handleExport}
                className="group bg-white border-2 border-gray-200 rounded-xl shadow-md p-6 hover:border-green-400 hover:shadow-lg transition-all text-left"
              >
                <Download size={32} className="mb-3 text-gray-700 group-hover:text-green-600 transition-colors" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ekspor Excel</h3>
                <p className="text-gray-600 text-sm">Unduh rekap lengkap semua jawaban (Q1-Q7)</p>
              </button>

              <button 
                onClick={() => router.push('/edukasi')}
                className="group bg-white border-2 border-gray-200 rounded-xl shadow-md p-6 hover:border-purple-400 hover:shadow-lg transition-all text-left"
              >
                <Activity size={32} className="mb-3 text-gray-700 group-hover:text-purple-600 transition-colors" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modul Edukasi</h3>
                <p className="text-gray-600 text-sm">Pelajari tentang penanganan BPH</p>
              </button>
            </div>

            {/* Tabel Riwayat */}
            <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Riwayat Asesmen Lengkap</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Skor IPSS</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">QoL</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Kategori</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Reverse agar yang terbaru di atas untuk tabel */}
                    {assessments.slice().reverse().map((assessment) => (
                      <tr key={assessment.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(assessment.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          <div className="text-xs text-gray-500">
                            Pukul {new Date(assessment.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-gray-900">
                          {assessment.total_score}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-700">
                          {assessment.qol}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`inline-block px-3 py-1 bg-${getCategoryColor(assessment.category)}-100 text-${getCategoryColor(assessment.category)}-700 rounded-full text-sm font-medium`}>
                            {assessment.category}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <button 
                            onClick={() => setSelectedAssessment(assessment)}
                            className="flex items-center justify-center mx-auto space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 transition-all"
                          >
                            <Eye size={16} />
                            <span>Lihat Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}