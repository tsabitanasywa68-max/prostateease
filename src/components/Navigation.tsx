'use client'; // Wajib karena kita pakai hooks

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Untuk redirect saat logout
import { Activity, Home, FileText, Book, User, LogOut } from 'lucide-react';

export default function Navigation() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ambil data user saat website dimuat
  useEffect(() => {
    setIsMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name);
      } catch (e) {
        console.error("Gagal parsing user", e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Hapus semua jejak login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserName(null);
    
    // Paksa refresh dan kembali ke login
    router.push('/login');
    router.refresh();
  };

  // Mencegah error hydration (perbedaan server/client)
  if (!isMounted) return null;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 hidden md:block">ProstatEase</span>
          </Link>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link href="/dashboard" className="flex flex-col md:flex-row items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Home size={20} />
              <span className="text-xs md:text-sm">Dashboard</span>
            </Link>
            
            <Link href="/ipss" className="flex flex-col md:flex-row items-center space-x-1 text-gray-600 hover:text-blue-600">
              <FileText size={20} />
              <span className="text-xs md:text-sm">Asesmen</span>
            </Link>
            
            <Link href="/edukasi" className="flex flex-col md:flex-row items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Book size={20} />
              <span className="text-xs md:text-sm">Edukasi</span>
            </Link>

            {/* Bagian Profil & Logout */}
            <div className="border-l pl-4 ml-4 flex items-center space-x-4">
              {userName ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">Pasien</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                    title="Keluar / Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-blue-600 font-medium text-sm">
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}