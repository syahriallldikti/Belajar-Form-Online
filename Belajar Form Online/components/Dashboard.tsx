
import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AppConfig } from '../types';
import { analyzeAttendance } from '../services/geminiService';

interface DashboardProps {
  records: AttendanceRecord[];
  onClear: () => void;
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onClear, config, onUpdateConfig }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [sheetUrlInput, setSheetUrlInput] = useState(config.googleSheetUrl);
  const [currentUrl, setCurrentUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'data' | 'publikasi'>('data');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleAnalyze = async () => {
    if (records.length === 0) return;
    setIsAnalyzing(true);
    const result = await analyzeAttendance(records);
    setAnalysisResult(result || "Gagal mendapatkan analisis.");
    setIsAnalyzing(false);
  };

  const saveConfig = () => {
    if (!sheetUrlInput.startsWith('https://script.google.com')) {
      alert("⚠️ Link yang Anda masukkan salah. Pastikan link dimulai dengan https://script.google.com");
      return;
    }
    onUpdateConfig({
      ...config,
      googleSheetUrl: sheetUrlInput,
      isSyncEnabled: true
    });
    alert("✅ Selamat! Formulir Anda sekarang sudah terhubung dengan Google Sheets.");
  };

  const copyAppsScriptCode = () => {
    const code = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date(), 
      data.name, 
      data.institution, 
      data.position, 
      "'" + data.whatsapp, 
      data.signature
    ]);
    return ContentService.createTextOutput("Sukses").setMimeType(ContentService.MimeType.TEXT);
  } catch (f) {
    return ContentService.createTextOutput("Error: " + f.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}`;
    navigator.clipboard.writeText(code);
    alert("Kode berhasil disalin! Sekarang tempel (Paste) di Google Apps Script.");
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Header Dashboard */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fas fa-chart-line text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Pusat Kendali Absensi</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${config.isSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <p className="text-xs text-slate-500 font-medium">
                {config.isSyncEnabled ? 'Terhubung ke Google Sheets' : 'Belum Terhubung'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'data' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Data & Analisis
          </button>
          <button 
            onClick={() => setActiveTab('publikasi')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'publikasi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Cara Buat Live (Online)
          </button>
        </div>
      </div>

      {activeTab === 'data' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Statistik & AI */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Responden</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-slate-800">{records.length}</span>
                  <span className="text-slate-400 text-sm mb-2 font-medium">Orang Hadir</span>
                </div>
              </div>
              <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 flex flex-col justify-between">
                <p className="text-indigo-100 text-xs mb-3 italic">Butuh ringkasan laporan? Biarkan AI membantu Anda.</p>
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || records.length === 0}
                  className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? <><i className="fas fa-circle-notch fa-spin"></i> Memproses...</> : <><i className="fas fa-sparkles"></i> Buat Laporan Otomatis</>}
                </button>
              </div>
            </div>

            {analysisResult && (
              <div className="bg-slate-900 rounded-3xl p-6 text-slate-300 shadow-xl border border-slate-800 animate-fadeIn">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <i className="fas fa-robot text-indigo-400"></i> Hasil Analisis AI
                </h3>
                <div className="text-sm leading-relaxed whitespace-pre-line bg-slate-800/50 p-4 rounded-2xl">
                  {analysisResult}
                </div>
              </div>
            )}

            {/* Tabel Data */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Daftar Kehadiran</h3>
                <button onClick={onClear} className="text-[10px] text-rose-500 font-bold hover:underline">Hapus Semua</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">Nama</th>
                      <th className="px-6 py-4 text-left">Instansi</th>
                      <th className="px-6 py-4 text-right">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm italic">Belum ada data masuk.</td>
                      </tr>
                    ) : (
                      records.slice().reverse().map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-sm">{r.name}</div>
                            <div className="text-[10px] text-indigo-500">{r.whatsapp}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-600">{r.institution}</div>
                            <div className="text-[10px] text-slate-400 uppercase">{r.position}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <img src={r.signature} alt="Paraf" className="h-8 inline-block opacity-70 mix-blend-multiply" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: QR & Integrasi */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="bg-slate-50 p-4 rounded-3xl mb-4 border border-slate-100">
                <img src={qrImageUrl} alt="QR Code" className="w-40 h-40" />
              </div>
              <h3 className="font-bold text-slate-800">Scan QR Peserta</h3>
              <p className="text-[10px] text-slate-400 mt-2 mb-6">Tunjukkan kode ini kepada peserta agar mereka bisa mengisi absen dari HP masing-masing.</p>
              <button 
                onClick={() => window.open(qrImageUrl, '_blank')}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cetak / Simpan QR
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Hubungkan Ke Google Sheets</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Link Apps Script</label>
                <input 
                  type="text"
                  placeholder="https://script.google.com/..."
                  value={sheetUrlInput}
                  onChange={(e) => setSheetUrlInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                onClick={saveConfig}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
              >
                Simpan & Sinkronkan
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Tab Publikasi: Panduan Awam */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-rocket text-indigo-500"></i> Cara Membuat Link Publik
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Gunakan Layanan "Vercel" (Sangat Mudah)</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Kunjungi <a href="https://vercel.com" target="_blank" className="text-indigo-600 font-bold underline">Vercel.com</a>. Buat akun, lalu sambungkan dengan folder kode Anda di GitHub. Ini 100% gratis untuk penggunaan pribadi.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Dapatkan Alamat Website Anda</p>
                  <p className="text-xs text-slate-500 mt-1">Setelah diunggah, Anda akan mendapat link seperti: <br/><code className="bg-slate-50 px-1 text-rose-500">daftar-hadir-bpk.vercel.app</code></p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Sebarkan QR Code</p>
                  <p className="text-xs text-slate-500 mt-1">Gunakan QR Code di tab sebelah untuk diletakkan di meja pendaftaran. Peserta tinggal scan!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 p-8 rounded-3xl text-emerald-100 shadow-xl space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <i className="fas fa-table text-9xl"></i>
             </div>
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-database text-emerald-400"></i> Persiapan Database
            </h3>
            <p className="text-sm leading-relaxed opacity-80">
              Jangan lupa menghubungkan formulir ke Google Sheets agar data Bapak/Ibu aman dan bisa dibuka di Excel.
            </p>
            <div className="bg-emerald-800/50 p-4 rounded-2xl border border-emerald-700 space-y-4">
              <p className="text-xs font-bold text-emerald-300">Langkah 1: Salin Kode Ini</p>
              <button 
                onClick={copyAppsScriptCode}
                className="w-full py-3 bg-emerald-400 text-emerald-900 rounded-xl font-bold text-xs hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-copy"></i> Salin Kode Petugas Input
              </button>
              <p className="text-xs opacity-70 mt-2">
                * Tempelkan kode ini di menu <b>Ekstensi > Apps Script</b> di Google Sheets Anda.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
