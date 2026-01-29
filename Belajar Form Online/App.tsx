
import React, { useState, useEffect } from 'react';
import AttendanceForm from './components/AttendanceForm';
import Dashboard from './components/Dashboard';
import { AttendanceRecord, AppView, AppConfig } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.FORM);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    googleSheetUrl: '',
    isSyncEnabled: false
  });

  // Load data & config from localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('attendly_data');
    if (savedRecords) setRecords(JSON.parse(savedRecords));

    const savedConfig = localStorage.getItem('attendly_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  useEffect(() => {
    localStorage.setItem('attendly_data', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('attendly_config', JSON.stringify(config));
  }, [config]);

  const handleAddRecord = async (data: Omit<AttendanceRecord, 'id' | 'timestamp'>) => {
    const newRecord: AttendanceRecord = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    
    setRecords(prev => [...prev, newRecord]);

    // Sync to Google Sheets if enabled
    if (config.isSyncEnabled && config.googleSheetUrl) {
      try {
        // We use 'no-cors' if the Apps Script doesn't handle CORS, 
        // but for a proper JSON response 'cors' is better if Script is set up correctly.
        fetch(config.googleSheetUrl, {
          method: 'POST',
          mode: 'no-cors', // Easiest way to send to Apps Script without CORS issues
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord)
        });
      } catch (error) {
        console.error("Gagal sinkronisasi ke Google Sheets:", error);
      }
    }
  };

  const handleClearData = () => {
    if (confirm("Anda yakin ingin menghapus seluruh data responden?")) {
      setRecords([]);
      localStorage.removeItem('attendly_data');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <i className="fas fa-calendar-check text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendly</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setView(AppView.FORM)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === AppView.FORM 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Formulir
            </button>
            <button
              onClick={() => setView(AppView.DASHBOARD)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === AppView.DASHBOARD 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {view === AppView.FORM ? (
          <div className="animate-fadeIn">
            <AttendanceForm onSubmit={handleAddRecord} />
          </div>
        ) : (
          <Dashboard 
            records={records} 
            onClear={handleClearData} 
            config={config}
            onUpdateConfig={setConfig}
          />
        )}
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white mt-10">
        <p>&copy; {new Date().getFullYear()} Attendly Digital - LHP BPK RI Integration</p>
      </footer>

      {view === AppView.FORM && records.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className="group relative bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
          >
            <i className="fas fa-users"></i>
            <span className="absolute right-0 top-0 -mr-1 -mt-1 bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {records.length}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
