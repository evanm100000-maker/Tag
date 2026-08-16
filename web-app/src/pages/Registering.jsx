import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { saveTag } from '../utils/db';
import QRCode from 'react-qr-code';

export default function Registering() {
  const [mode, setMode] = useState('select'); // 'select' | 'scan' | 'generate'
  const [status, setStatus] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Dates
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    let html5QrCode;

    if (mode === 'scan') {
      html5QrCode = new Html5Qrcode("register-reader");
      
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          html5QrCode.stop().catch(console.error);
          await handleRegister(decodedText);
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

  const generateRandomCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleRegister = async (code) => {
    await saveTag({ 
      code, 
      type: 'barcode', 
      disabled: false,
      validFrom: validFrom ? new Date(validFrom).toISOString() : null,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null
    });
    
    if (mode === 'generate') {
      setGeneratedCode(code);
      setStatus(`Successfully Generated & Registered!`);
    } else {
      setStatus(`Successfully Registered scanned barcode!\nCode: ${code}`);
      setMode('select');
    }
  };

  const onGenerateClick = async () => {
    const code = generateRandomCode();
    await handleRegister(code);
  };

  return (
    <div className="p-6 h-full flex flex-col items-center max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Registration</h2>

      {status && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 w-full text-center whitespace-pre-line font-medium border border-blue-200 shadow-sm">
          {status}
        </div>
      )}

      {/* Date Configuration - Only show when selecting */}
      {(mode === 'select' || (mode === 'generate' && !generatedCode)) && (
        <div className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Validity Rules (Optional)</h3>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Starts Working (Date & Time)</label>
              <input 
                type="datetime-local" 
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-2 outline-none focus:border-blue-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Stops Working (Date & Time)</label>
              <input 
                type="datetime-local" 
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-2 outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>
      )}

      {mode === 'select' && (
        <div className="flex flex-col gap-4 w-full">
          <button 
            onClick={() => { setStatus(''); setMode('scan'); }}
            className="bg-green-600 text-white py-5 rounded-xl font-bold text-xl hover:bg-green-700 transition shadow-md"
          >
            Scan Existing Barcode
          </button>
          
          <button 
            onClick={() => {
              setStatus('');
              setMode('generate');
              onGenerateClick();
            }}
            className="bg-blue-600 text-white py-5 rounded-xl font-bold text-xl hover:bg-blue-700 transition shadow-md"
          >
            Generate New Barcode
          </button>
        </div>
      )}

      {mode === 'scan' && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full overflow-hidden rounded-2xl shadow-lg border-4 border-gray-200 mb-6 bg-black min-h-[300px]" id="register-reader">
          </div>
          <button 
            onClick={() => setMode('select')}
            className="text-red-500 font-bold px-6 py-3 border-2 border-red-500 rounded-xl hover:bg-red-50 transition w-full"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === 'generate' && generatedCode && (
        <div className="w-full flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="bg-white p-4 border-4 border-gray-100 rounded-2xl mb-6">
            <QRCode value={generatedCode} size={200} />
          </div>
          <p className="text-2xl font-mono font-bold tracking-widest text-gray-800 mb-8">{generatedCode}</p>
          
          <button 
            onClick={() => {
              setMode('select');
              setGeneratedCode('');
              setStatus('');
            }}
            className="bg-gray-100 text-gray-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition w-full"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
