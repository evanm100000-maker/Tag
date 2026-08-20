import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Scan, Ticket } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Scanning from './pages/Scanning';
import Registering from './pages/Registering';
import Admin from './pages/Admin';
import Login from './pages/Login';
import DirectScan from './pages/DirectScan';

import { validateEntry } from './utils/db';
import { playBeep, unlockAudio } from './utils/audio';
import { Scanner } from '@yudiel/react-qr-scanner';

const Header = ({ showScanner, setShowScanner }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || '';
    if (!path) return 'Tag Scanner & Portal';
    return path;
  };

  return (
    <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        {location.pathname !== '/' && (
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 hover:bg-blue-700 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <ChevronLeft size={20} />
            <span className="font-bold text-sm">Back</span>
          </button>
        )}
        <h1 className="text-lg font-extrabold capitalize tracking-tight flex items-center gap-2">
          <Ticket size={20} className="opacity-90" />
          <span>{getPageTitle()}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {currentUser && (
          <>
            <button
              onClick={() => {
                unlockAudio();
                setShowScanner(!showScanner);
              }}
              className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl transition text-sm cursor-pointer border ${
                showScanner 
                  ? 'bg-white text-blue-600 border-white' 
                  : 'bg-blue-700 hover:bg-blue-800 text-white border-transparent'
              }`}
            >
              <Scan size={18} />
              <span>{showScanner ? 'Hide Top Scanner' : 'Top Scanner'}</span>
            </button>
            <span className="text-xs font-semibold bg-blue-500/50 px-3 py-1.5 rounded-lg border border-blue-400/20 max-hidden sm:inline-block">
              {currentUser.name}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { valid, reason, name, scanCountToday, code }
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (codes) => {
    if (codes && codes.length > 0 && !isProcessing) {
      setIsProcessing(true);
      playBeep();
      const code = codes[0].rawValue;
      const res = await validateEntry(code);
      setScanResult({ ...res, code });
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim() || isProcessing) return;

    setIsProcessing(true);
    playBeep();
    const formattedCode = manualCode.trim().toUpperCase();
    const res = await validateEntry(formattedCode);
    setScanResult({ ...res, code: formattedCode });
    setManualCode('');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" onClick={unlockAudio}>
      <Header showScanner={showScanner} setShowScanner={setShowScanner} />

      {/* Top Level Collapsible Scanner Panel */}
      {currentUser && showScanner && (
        <div className="bg-slate-900 border-b-4 border-blue-600 text-white p-6 shadow-2xl transition-all duration-300">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            
            {/* Camera View */}
            <div className="w-56 h-44 bg-black rounded-2xl overflow-hidden relative border border-slate-700 shadow-inner">
              <Scanner 
                onScan={handleScan}
                formats={['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39']}
                components={{
                  audio: false,
                  onOff: false,
                  torch: false,
                  zoom: false,
                  finder: true,
                }}
                styles={{
                  container: { width: '100%', height: '100%' }
                }}
              />
            </div>

            {/* Verification Inputs and Result Alerts */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-lg tracking-tight">Top Bar Entrance Verification</h3>
                  <p className="text-xs text-slate-400">Scan QR codes or type ticket codes manually for instant database lookup.</p>
                </div>
                <button
                  onClick={() => { setShowScanner(false); setScanResult(null); }}
                  className="text-xs text-slate-400 hover:text-white font-bold border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  Close Scanner
                </button>
              </div>

              {/* Manual search input */}
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Enter barcode manually (e.g. TKT-1234)..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 font-mono uppercase font-bold"
                />
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition cursor-pointer disabled:bg-blue-400"
                >
                  Verify
                </button>
              </form>

              {/* Inline Scan Results */}
              {scanResult && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-md ${
                  scanResult.valid 
                    ? 'bg-green-950/70 border-green-800/60 text-green-200' 
                    : 'bg-red-950/70 border-red-800/60 text-red-200'
                }`}>
                  <div>
                    <span className="font-mono text-xs opacity-75 font-bold uppercase tracking-wider block">Code: {scanResult.code}</span>
                    <span className="text-base font-extrabold flex items-center gap-1.5 mt-0.5">
                      {scanResult.valid ? (
                        <>Approved: {scanResult.name}</>
                      ) : (
                        <>Denied: {scanResult.reason}</>
                      )}
                    </span>
                    {scanResult.valid && (
                      <span className="text-xs block opacity-75 mt-0.5">Scanned today: {scanResult.scanCountToday}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => setScanResult(null)} 
                    className="text-xs font-bold border border-current hover:bg-white/10 px-2.5 py-1 rounded-lg transition"
                  >
                    Clear Result
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/scanning" element={<Scanning />} />
          <Route path="/registering" element={<Registering />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/scan/:code" element={<DirectScan />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
