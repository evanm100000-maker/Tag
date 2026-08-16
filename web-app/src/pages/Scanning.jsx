import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle2, XCircle } from 'lucide-react';
import { validateEntry } from '../utils/db';

export default function Scanning() {
  const [result, setResult] = useState(null); // { valid: boolean, reason?: string, scanCountToday?: number, name?: string, validUntil?: string }
  
  useEffect(() => {
    let html5QrcodeScanner;

    if (!result) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      html5QrcodeScanner.render(
        async (decodedText) => {
          // Stop immediately upon scan
          html5QrcodeScanner.clear();
          const validation = await validateEntry(decodedText);
          setResult(validation);
        },
        (error) => {
          // Ignore
        }
      );
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
    };
  }, [result]);

  return (
    <div className="relative h-full flex flex-col bg-gray-50">
      {!result ? (
        <div className="flex-1 w-full flex flex-col items-center p-4">
          <div id="reader" className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden"></div>
        </div>
      ) : (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-white text-center ${result.valid ? 'bg-green-600' : 'bg-red-600'}`}>
          {result.valid ? (
            <CheckCircle2 size={120} className="mb-4 opacity-90" />
          ) : (
            <XCircle size={120} className="mb-4 opacity-90" />
          )}
          
          <h2 className="text-4xl font-extrabold mb-6 uppercase tracking-wider">
            {result.valid ? 'APPROVED' : 'DENIED'}
          </h2>

          {result.name && (
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
            onClick={() => setResult(null)}
            className="mt-12 bg-white text-black px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition shadow-xl w-full max-w-xs"
          >
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
}
