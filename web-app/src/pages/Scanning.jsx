import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, XCircle } from 'lucide-react';
import { isNfcSupported, readNfc } from '../utils/nfc';
import { validateEntry } from '../utils/db';

export default function Scanning() {
  const [mode, setMode] = useState('barcode'); // 'barcode' | 'nfc'
  const [result, setResult] = useState(null); // { valid: boolean, reason?: string }
  const [nfcScanning, setNfcScanning] = useState(false);
  const scannerRef = useRef(null);
  
  useEffect(() => {
    let html5QrCode;

    if (mode === 'barcode' && !result) {
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
  }, [mode, result]);

  const handleCode = async (code) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    const validation = await validateEntry(code);
    setResult(validation);
  };

  const handleNfcScan = async () => {
    setResult(null);
    setNfcScanning(true);
    const data = await readNfc();
    setNfcScanning(false);
    
    if (data.error) {
      setResult({ valid: false, reason: data.error });
    } else {
      handleCode(data);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center">
      
      {!result && (
        <div className="flex gap-4 mb-8 bg-gray-200 p-1 rounded-xl">
          <button 
            className={`px-6 py-2 rounded-lg font-semibold transition ${mode === 'barcode' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
            onClick={() => setMode('barcode')}
          >
            Barcode
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-semibold transition ${mode === 'nfc' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
            onClick={() => setMode('nfc')}
          >
            NFC
          </button>
        </div>
      )}

      {result ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {result.valid ? (
            <CheckCircle2 size={120} className="text-green-500 mb-6" />
          ) : (
            <XCircle size={120} className="text-red-500 mb-6" />
          )}
          
          <h2 className="text-3xl font-bold mb-2">
            {result.valid ? 'Access Granted' : 'Access Denied'}
          </h2>
          {!result.valid && (
            <p className="text-xl text-gray-600 mb-12">{result.reason}</p>
          )}

          <button 
            onClick={() => setResult(null)}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition"
          >
            Scan Again
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center">
          {mode === 'barcode' ? (
            <div className="w-full overflow-hidden rounded-2xl shadow-lg border-4 border-gray-200">
              <div id="reader" className="w-full bg-black min-h-[300px]"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {!isNfcSupported() ? (
                <div className="bg-red-100 text-red-700 p-6 rounded-xl text-center w-full">
                  <p className="font-bold mb-2">NFC Not Supported</p>
                  <p>Web NFC is only available on Android devices using Chrome.</p>
                </div>
              ) : (
                <button 
                  onClick={handleNfcScan}
                  disabled={nfcScanning}
                  className={`w-full py-12 rounded-2xl text-2xl font-bold text-white transition ${nfcScanning ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}
                >
                  {nfcScanning ? 'Tap NFC Tag now...' : 'Tap to Start NFC Scan'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
