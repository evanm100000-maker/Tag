import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, XCircle } from 'lucide-react';
import { validateEntry } from '../utils/db';

export default function Scanning() {
  const [result, setResult] = useState(null); // { valid: boolean, reason?: string, scanCountToday?: number }
  const scannerRef = useRef(null);
  
  useEffect(() => {
    let html5QrCode;

    if (!result) {
      html5QrCode = new Html5Qrcode("reader");
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleCode(decodedText);
        },
        (error) => {
          // Ignore frequent scan errors
        }
      ).catch(err => {
        console.error('Error starting scanner', err);
      });
      
      scannerRef.current = html5QrCode;
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [result]);

  const handleCode = async (code) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    const validation = await validateEntry(code);
    setResult(validation);
  };

  return (
    <div className="relative h-full flex flex-col bg-black">
      {!result ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div id="reader" className="w-full h-full max-w-md mx-auto"></div>
        </div>
      ) : (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-white text-center ${result.valid ? 'bg-green-600' : 'bg-red-600'}`}>
          {result.valid ? (
            <CheckCircle2 size={160} className="mb-6 opacity-90" />
          ) : (
            <XCircle size={160} className="mb-6 opacity-90" />
          )}
          
          <h2 className="text-5xl font-extrabold mb-4 uppercase tracking-wider">
            {result.valid ? 'APPROVED' : 'DENIED'}
          </h2>
          
          {result.valid ? (
            <p className="text-2xl font-semibold opacity-90">
              Scanned today: <span className="font-bold text-3xl">{result.scanCountToday}</span>
            </p>
          ) : (
            <p className="text-2xl font-bold uppercase max-w-sm">
              {result.reason}
            </p>
          )}

          <button 
            onClick={() => setResult(null)}
            className="mt-16 bg-white text-black px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition shadow-xl"
          >
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
}
