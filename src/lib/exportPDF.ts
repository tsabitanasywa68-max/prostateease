// lib/exportPDF.ts
// Implementasi lengkap export PDF dengan jsPDF dan autoTable

import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Assessment {
  date: string;
  totalScore: number;
  qol: number;
  category: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
}

interface UserInfo {
  name: string;
  email?: string;
  age?: number;
}

export function generateIPSSReport(user: UserInfo, assessment: Assessment) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // =============== HEADER ===============
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN ASESMEN IPSS', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('International Prostate Symptom Score', pageWidth / 2, 25, { align: 'center' });
  
  yPos = 45;

  // =============== PATIENT INFO ===============
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Identitas Pasien', 15, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nama: ${user.name}`, 15, yPos);
  
  if (user.email) {
    yPos += 6;
    doc.text(`Email: ${user.email}`, 15, yPos);
  }
  
  if (user.age) {
    yPos += 6;
    doc.text(`Usia: ${user.age} tahun`, 15, yPos);
  }
  
  yPos += 6;
  const assessmentDate = new Date(assessment.date);
  doc.text(
    `Tanggal Asesmen: ${assessmentDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`,
    15,
    yPos
  );

  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, pageWidth - 15, yPos);

  // =============== SCORE SUMMARY BOX ===============
  yPos += 10;
  
  // Determine color based on category
  let bgColor: [number, number, number] = [34, 197, 94]; // Green
  let borderColor: [number, number, number] = [22, 163, 74];
  
  if (assessment.category === 'Sedang') {
    bgColor = [234, 179, 8]; // Yellow
    borderColor = [202, 138, 4];
  } else if (assessment.category === 'Berat') {
    bgColor = [239, 68, 68]; // Red
    borderColor = [220, 38, 38];
  }

  // Background box
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2], 0.1);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'FD');

  // Score display
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.totalScore.toString(), 40, yPos + 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('/ 35 poin', 60, yPos + 20);

  // Category badge
  doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(100, yPos + 10, 50, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.category.toUpperCase(), 125, yPos + 18, { align: 'center' });

  // QoL Score
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kualitas Hidup: ${assessment.qol} / 6`, pageWidth - 60, yPos + 18);

  yPos += 45;

  // =============== INTERPRETATION ===============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretasi Hasil', 15, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const interpretation = getInterpretation(assessment.totalScore, assessment.qol);
  const interpretationLines = doc.splitTextToSize(interpretation, pageWidth - 30);
  doc.text(interpretationLines, 15, yPos);
  yPos += interpretationLines.length * 5 + 5;

  // =============== DETAILED SCORES TABLE ===============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Rincian Jawaban Kuesioner', 15, yPos);
  yPos += 5;

  const questions = [
    'Incomplete Emptying (Sensasi tidak kosong)',
    'Frequency (Frekuensi berkemih meningkat)',
    'Intermittency (Aliran terputus-putus)',
    'Urgency (Dorongan mendesak)',
    'Weak Stream (Pancaran lemah)',
    'Straining (Harus mengejan)',
    'Nocturia (Bangun malam untuk BAK)',
  ];

  const tableData = questions.map((q, idx) => [
    `Q${idx + 1}`,
    q,
    `${assessment[`q${idx + 1}` as keyof Assessment]}`,
    '5'
  ]);

  tableData.push(['QoL', 'Quality of Life Score', `${assessment.qol}`, '6']);

  (doc as any).autoTable({
    startY: yPos,
    head: [['No', 'Parameter', 'Skor', 'Maks']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 100 },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 20, halign: 'center' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if need new page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  // =============== RECOMMENDATIONS ===============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Rekomendasi Tatalaksana', 15, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const recommendations = getRecommendations(assessment.totalScore);
  recommendations.forEach(rec => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`• ${rec.category}`, 15, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    rec.items.forEach(item => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
      const itemLines = doc.splitTextToSize(`  - ${item}`, pageWidth - 30);
      doc.text(itemLines, 15, yPos);
      yPos += itemLines.length * 4 + 2;
    });
    
    yPos += 3;
  });

  // =============== RED FLAGS (NEW PAGE) ===============
  doc.addPage();
  yPos = 20;

  doc.setFillColor(254, 226, 226); // Red-100
  doc.rect(0, yPos - 5, pageWidth, 15, 'F');
  
  doc.setTextColor(185, 28, 28); // Red-700
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ TANDA BAHAYA - SEGERA KE FASILITAS KESEHATAN', pageWidth / 2, yPos + 5, { align: 'center' });
  
  yPos += 20;
  doc.setTextColor(0, 0, 0);

  const redFlags = [
    {
      title: 'Retensi Urin Akut',
      desc: 'Tidak bisa berkemih sama sekali dengan nyeri perut hebat',
      action: 'Segera ke UGD'
    },
    {
      title: 'Hematuria Makroskopik',
      desc: 'Urin berwarna merah atau coklat yang jelas terlihat',
      action: 'Evaluasi urologi 24-48 jam'
    },
    {
      title: 'Demam Tinggi + Menggigil',
      desc: 'Suhu >38.5°C dengan nyeri pinggang atau tanda infeksi berat',
      action: 'Segera ke UGD'
    },
    {
      title: 'Nyeri Pinggang Bilateral',
      desc: 'Nyeri kedua sisi pinggang yang mungkin menandakan hidronefrosis',
      action: 'Evaluasi urologi segera'
    },
  ];

  redFlags.forEach(flag => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text(`• ${flag.title}`, 15, yPos);
    
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const descLines = doc.splitTextToSize(flag.desc, pageWidth - 35);
    doc.text(descLines, 20, yPos);
    
    yPos += descLines.length * 4 + 2;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`→ ${flag.action}`, 20, yPos);
    
    yPos += 8;
  });

  // =============== DISCLAIMER ===============
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 10;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;

  doc.setFillColor(249, 250, 251); // Gray-50
  doc.roundedRect(15, yPos, pageWidth - 30, 40, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Disclaimer Medis', 20, yPos + 8);
  
  yPos += 14;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  const disclaimerText = 
    'Hasil asesmen IPSS ini merupakan alat bantu penilaian gejala LUTS yang terstandarisasi. ' +
    'Hasil ini bersifat edukatif dan BUKAN diagnosis medis definitif. Keputusan tatalaksana ' +
    'harus dibuat oleh dokter berdasarkan evaluasi klinis komprehensif. Platform ProstatEase ' +
    'tidak bertanggung jawab atas keputusan medis yang dibuat tanpa konsultasi profesional.';
  
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 40);
  doc.text(disclaimerLines, 20, yPos);

  // =============== FOOTER ===============
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Dihasilkan oleh ProstatEase | www.prostateease.com | ${new Date().toLocaleDateString('id-ID')}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // =============== SAVE PDF ===============
  const fileName = `Laporan_IPSS_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function getInterpretation(score: number, qol: number): string {
  if (score <= 7) {
    return `Skor IPSS ${score} menunjukkan gejala LUTS kategori ringan. Dengan skor kualitas hidup ${qol}, ` +
           `kondisi Anda ${qol <= 2 ? 'tidak signifikan mengganggu' : 'mulai mempengaruhi'} aktivitas sehari-hari. ` +
           `Pada kategori ini, gejala umumnya dapat dikelola dengan modifikasi gaya hidup dan observasi berkala.`;
  } else if (score <= 19) {
    return `Skor IPSS ${score} menunjukkan gejala LUTS kategori sedang. Skor kualitas hidup ${qol} mengindikasikan ` +
           `gejala ${qol >= 3 ? 'signifikan mempengaruhi' : 'mulai mengganggu'} kualitas hidup. Diperlukan evaluasi ` +
           `medis untuk menentukan etiologi dan mempertimbangkan terapi farmakologis.`;
  } else {
    return `Skor IPSS ${score} termasuk kategori gejala LUTS berat. Skor kualitas hidup ${qol} menunjukkan dampak ` +
           `signifikan terhadap kualitas hidup. Kondisi ini memerlukan evaluasi urologi komprehensif dan intervensi aktif.`;
  }
}

function getRecommendations(score: number) {
  if (score <= 7) {
    return [
      {
        category: 'Modifikasi Gaya Hidup',
        items: [
          'Batasi asupan cairan 2-3 jam sebelum tidur',
          'Kurangi konsumsi kafein dan alkohol',
          'Pertahankan berat badan ideal',
          'Lakukan double voiding technique',
        ]
      },
      {
        category: 'Monitoring',
        items: [
          'Asesmen IPSS ulang setiap 6 bulan',
          'Catat bladder diary jika gejala memburuk',
        ]
      }
    ];
  } else if (score <= 19) {
    return [
      {
        category: 'Evaluasi Medis',
        items: [
          'Konsultasi dokter umum atau urolog',
          'Digital Rectal Examination (DRE)',
          'Urinalisis dan Post-Void Residual (PVR)',
          'Pertimbangkan PSA untuk pria >50 tahun',
        ]
      },
      {
        category: 'Terapi Farmakologis (sesuai indikasi)',
        items: [
          'Alpha-blocker untuk gejala voiding',
          '5-ARI jika volume prostat >30 cc',
          'Antimuskarinik untuk gejala storage',
        ]
      }
    ];
  } else {
    return [
      {
        category: 'Tindakan Segera',
        items: [
          'Konsultasi urolog dalam waktu dekat',
          'Pemeriksaan fungsi ginjal',
          'Evaluasi komplikasi (retensi, hidronefrosis)',
        ]
      },
      {
        category: 'Evaluasi Diagnostik',
        items: [
          'DRE, urinalisis, PVR, PSA',
          'Uroflowmetry dan pressure-flow study',
          'USG ginjal dan kandung kemih',
          'Cystoscopy jika dicurigai patologi lain',
        ]
      },
      {
        category: 'Opsi Terapi',
        items: [
          'Terapi medis maksimal',
          'Pertimbangkan terapi invasif minimal',
          'TURP sebagai gold standard',
          'Laser prostatectomy sebagai alternatif',
        ]
      }
    ];
  }
}

// Export untuk digunakan di komponen React
export default generateIPSSReport;