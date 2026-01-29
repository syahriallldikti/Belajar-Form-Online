
import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import SignaturePad from './SignaturePad';

interface AttendanceFormProps {
  onSubmit: (data: Omit<AttendanceRecord, 'id' | 'timestamp'>) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    position: '',
    whatsapp: '',
  });
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      alert('Harap masukkan tanda tangan Anda.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call delay
    setTimeout(() => {
      onSubmit({
        ...formData,
        signature
      });
      setFormData({ name: '', institution: '', position: '', whatsapp: '' });
      setSignature('');
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-indigo-600 px-8 py-10 text-white text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">Daftar Hadir Kegiatan Tindak Lanjut LHP BPK RI Tahun 2024</h2>
          <p className="text-indigo-100 opacity-90 text-sm md:text-base">Silakan isi formulir di bawah ini dengan lengkap.</p>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-700 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {showSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center animate-bounce">
            <i className="fas fa-check-circle mr-3"></i>
            Berhasil menyimpan kehadiran! Terima kasih.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700">Nomor WhatsApp</label>
            <input
              id="whatsapp"
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              placeholder="Contoh: 08123456789"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="institution" className="block text-sm font-medium text-slate-700">Instansi</label>
            <input
              id="institution"
              type="text"
              required
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              placeholder="Nama Sekolah / Kantor"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="position" className="block text-sm font-medium text-slate-700">Jabatan</label>
            <input
              id="position"
              type="text"
              required
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              placeholder="Staff / Manajer / Guru"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <SignaturePad 
          onSave={(dataUrl) => setSignature(dataUrl)}
          onClear={() => setSignature('')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i> Mengirim...</>
          ) : (
            'Kirim Kehadiran'
          )}
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm;
