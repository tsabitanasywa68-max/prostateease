
"use client";
import React from 'react';
import Link from 'next/link'; // <--- 1. WAJIB IMPORT INI
import { Activity, BarChart3, FileText, Shield, TrendingUp, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ProstatEase</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#fitur" className="text-gray-600 hover:text-blue-600">Fitur</a>
              <a href="#tentang" className="text-gray-600 hover:text-blue-600">Tentang</a>
              <a href="#edukasi" className="text-gray-600 hover:text-blue-600">Edukasi</a>
            </div>
            <div className="flex space-x-4">
              {/* PERBAIKAN: Tombol Masuk */}
              <Link href="/login">
                <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                  Masuk
                </button>
              </Link>
              
              {/* PERBAIKAN: Tombol Daftar */}
              <Link href="/register">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Daftar Gratis
                </button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Pantau Kesehatan Prostat Anda dengan Mudah
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Platform digital berbasis IPSS untuk membantu Anda memantau gejala prostat, 
              mendapatkan rekomendasi edukatif, dan berkonsultasi dengan dokter secara lebih efektif.
            </p>
            <div className="flex space-x-4">
              {/* PERBAIKAN: Tombol Asesmen */}
              <Link href="/ipss">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg">
                  Mulai Asesmen IPSS
                </button>
              </Link>

              {/* PERBAIKAN: Tombol Demo */}
              <Link href="/dashboard">
                <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-lg">
                  Coba Demo
                </button>
              </Link>
            </div>
            <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-green-600 mr-2" />
                <span>Gratis untuk penggunaan pribadi</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-green-600 mr-2" />
                <span>Data pribadi aman</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Skor IPSS Terakhir</span>
                <span className="text-2xl font-bold text-green-600">8</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">Kategori</span>
                <span className="font-semibold text-yellow-700">Sedang</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Tren 6 Bulan</span>
                  <TrendingUp className="text-blue-600" />
                </div>
                <div className="h-24 flex items-end justify-between space-x-2">
                  {[12, 10, 9, 11, 8, 8].map((height, i) => (
                    <div 
                      key={i} 
                      className="bg-blue-400 rounded-t w-full"
                      style={{ height: `${height * 6}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600">
              Semua yang Anda butuhkan untuk memantau kesehatan prostat
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Kuesioner IPSS Digital
              </h3>
              <p className="text-gray-600">
                Isi kuesioner IPSS standar internasional dengan mudah. 
                Skor otomatis dihitung dan dikategorikan.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Grafik & Tren
              </h3>
              <p className="text-gray-600">
                Pantau perubahan gejala dari waktu ke waktu dengan visualisasi 
                grafik yang mudah dipahami.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Rekomendasi Personal
              </h3>
              <p className="text-gray-600">
                Dapatkan rekomendasi edukatif berbasis skor Anda dan panduan 
                kapan perlu konsultasi dokter.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Data Aman & Privat
              </h3>
              <p className="text-gray-600">
                Data kesehatan Anda dienkripsi dan hanya dapat diakses oleh Anda. 
                Keamanan adalah prioritas kami.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Export PDF
              </h3>
              <p className="text-gray-600">
                Unduh ringkasan IPSS dalam format PDF untuk dibawa saat 
                konsultasi dengan dokter Anda.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Modul Edukasi
              </h3>
              <p className="text-gray-600">
                Pelajari tentang BPH, LUTS, dan tanda bahaya yang memerlukan 
                perhatian medis segera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cara Menggunakan
            </h2>
            <p className="text-xl text-gray-600">
              Hanya 3 langkah sederhana untuk mulai memantau kesehatan Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Daftar Akun</h3>
              <p className="text-gray-600">
                Buat akun gratis dengan email Anda. Proses cepat dan mudah.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Isi Kuesioner IPSS</h3>
              <p className="text-gray-600">
                Jawab 7 pertanyaan singkat tentang gejala Anda dalam 5 menit.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pantau & Evaluasi</h3>
              <p className="text-gray-600">
                Lihat hasil, tren, dan dapatkan rekomendasi untuk langkah selanjutnya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Mulai Pantau Kesehatan Prostat Anda Hari Ini
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Gratis, mudah, dan membantu Anda berkonsultasi lebih efektif dengan dokter
          </p>
          {/* PERBAIKAN: Tombol Daftar (Bawah) */}
          <Link href="/register">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium text-lg">
              Daftar Sekarang - Gratis
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold text-white">ProstatEase</span>
              </div>
              <p className="text-sm">
                Platform monitoring gejala prostat berbasis IPSS untuk membantu 
                pria dewasa memantau kesehatan prostat.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Fitur</a></li>
                <li><a href="#" className="hover:text-white">Harga</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Sumber Daya</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Edukasi BPH</a></li>
                <li><a href="#" className="hover:text-white">Panduan IPSS</a></li>
                <li><a href="#" className="hover:text-white">Referensi Medis</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privasi</a></li>
                <li><a href="#" className="hover:text-white">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-white">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>© 2024 ProstatEase. Semua hak cipta dilindungi.</p>
            <p className="mt-2 text-gray-500">
              <strong>Disclaimer:</strong> Aplikasi ini bersifat edukatif dan bukan pengganti diagnosis atau terapi dari dokter profesional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}