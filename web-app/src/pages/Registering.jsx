import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { isNfcSupported, writeNfc } from '../utils/nfc';
import { saveTag } from '../utils/db';

export default function Registering() {
  const [mode, setMode] = useState('select'); // 'select' | 'barcode' | 'nfc'
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let html5QrCode;

    if (mode === 'barcode') {
      html5QrCode = new Html5Qrcode("register-reader");
      
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          html5QrCode.stop().catch(console.error);
          handleRegister(decodedText, 'barcode');
        },
        () => {}
      ).catch(err => {
        console.error('Error starting scanner', err);
        setStatus('Could not start camera');
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [mode]);

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleRegister = async (code, type) => {
    await saveTag({ code, type, disabled: false });
    setStatus(`Successfully registered ${type.toUpperCase()}!\nCode: ${code}`);
    setMode('select');
  };

  const handleNfc = async () => {
    setLoading(true);
    setStatus('Bring NFC tag close to write...');
    
    const code = generateCode();
    const result = await writeNfc(code);
    
    setLoading(false);
    if (result.error) {
      setStatus(result.error);
    } else {
      handleRegister(code, 'nfc');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8">Register New Tag</h2>

      {status && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-8 w-full max-w-md text-center whitespace-pre-line font-medium border border-blue-200">
          {status}
        </div>
      )}

      {mode === 'select' && (
        <div className="flex gap-4 w-full max-w-md flex-col">
          <button 
            onClick={() => { setStatus(''); setMode('barcode'); }}
            className="bg-white border-2 border-green-500 text-green-600 py-6 rounded-xl font-bold text-xl hover:bg-green-50 transition shadow-sm"
          >
            Scan Barcode
          </button>
          
          <button 
            onClick={() => {
              if (!isNfcSupported()) {
                setStatus('NFC is not supported on this device/browser.');
              } else {
                setStatus('');
                setMode('nfc');
                handleNfc();
              }
            }}
            className="bg-white border-2 border-blue-500 text-blue-600 py-6 rounded-xl font-bold text-xl hover:bg-blue-50 transition shadow-sm"
          >
            Write to NFC Tag
          </button>
        </div>
      )}

      {mode === 'barcode' && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-full overflow-hidden rounded-2xl shadow-lg border-4 border-gray-200 mb-6">
            <div id="register-reader" className="w-full bg-black min-h-[300px]"></div>
          </div>
          <button 
            onClick={() => setMode('select')}
            className="text-red-500 font-bold px-6 py-3 border-2 border-red-500 rounded-xl hover:bg-red-50 transition w-full"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === 'nfc' && (
        <div className="w-full max-w-md flex flex-col items-center">
          {loading && (
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-8"></div>
          )}
          <button 
            onClick={() => setMode('select')}
            className="text-red-500 font-bold px-6 py-3 border-2 border-red-500 rounded-xl hover:bg-red-50 transition w-full"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
