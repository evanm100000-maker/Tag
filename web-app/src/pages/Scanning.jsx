import React, { useState, useEffect, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CheckCircle2, XCircle } from 'lucide-react';
import { validateEntry } from '../utils/db';
import { playBeep, unlockAudio } from '../utils/audio';

export default function Scanning() {
  const [result, setResult] = useState(null); // { valid: boolean, reason?: string, scanCountToday?: number, name?: string, validUntil?: string }
  const isProcessing = useRef(false);

  // Set mobile status bar color dynamically
  const setThemeColor = (color) => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  };

  useEffect(() => {
    // Reset to blue/default when scanning
    if (!result) {
      setThemeColor('#3b82f6'); // blue
      document.documentElement.style.backgroundColor = '#f9fafb'; // bg-gray-50
      document.body.style.backgroundColor = '#f9fafb';
    } else {
      const color = result.valid ? '#16a34a' : '#dc2626'; // green or red
      setThemeColor(color);
      document.documentElement.style.backgroundColor = color;
      document.body.style.backgroundColor = color;
    }
    
    return () => {
      setThemeColor('#3b82f6'); // Reset on unmount
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, [result]);

  const handleScan = async (codes) => {
    if (codes && codes.length > 0 && !result && !isProcessing.current) {
      isProcessing.current = true;
      
      // Play beep instantly upon physical scan detection
      playBeep();

      const decodedText = codes[0].rawValue;
      const validation = await validateEntry(decodedText);
      setResult(validation);
      isProcessing.current = false;
    }
  };

  const handleScanNext = () => {
    unlockAudio(); // Keep context unlocked
    setResult(null);
  };

  return (
    <div className="relative h-full flex flex-col bg-gray-50" onClick={unlockAudio}>
      {!result ? (
        <div className="flex-1 w-full flex flex-col items-center p-4">
          <div className="w-full max-w-md mx-auto bg-black rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden relative">
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
        </div>
      ) : (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-white text-center h-[100dvh] w-screen ${result.valid ? 'bg-green-600' : 'bg-red-600'}`}>
          {result.valid ? (
            <CheckCircle2 size={120} className="mb-4 opacity-90 animate-bounce" />
          ) : (
            <XCircle size={120} className="mb-4 opacity-90" />
          )}
          
          <h2 className="text-5xl font-extrabold mb-6 uppercase tracking-wider">
            {result.valid ? 'APPROVED' : 'DENIED'}
          </h2>

          {result.name && result.name !== 'Unknown' && (
            <div className="bg-black/20 px-6 py-3 rounded-2xl mb-6 border border-white/20">
              <p className="text-sm uppercase tracking-widest opacity-80 mb-1">Holder</p>
              <p className="text-2xl font-bold">{result.name}</p>
            </div>
          )}
          
          {result.valid ? (
            <div className="space-y-3 w-full max-w-sm">
              <div className="bg-black/20 p-4 rounded-xl flex justify-between items-center">
                <span className="opacity-90 font-medium">Scanned today</span>
                <span className="font-bold text-2xl">{result.scanCountToday}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-xl flex justify-between items-center">
                <span className="opacity-90 font-medium">Expires</span>
                <span className="font-bold">{result.validUntil !== 'Never' ? new Date(result.validUntil).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          ) : (
            <p className="text-2xl font-bold uppercase max-w-sm bg-black/20 p-6 rounded-2xl w-full">
              {result.reason}
            </p>
          )}

          <button 
            onClick={handleScanNext}
            className="mt-12 bg-white text-black px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition shadow-xl w-full max-w-xs"
          >
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
}
