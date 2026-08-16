import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { saveTag } from '../utils/db';
import QRCode from 'qrcode';

export default function Registering() {
  const [mode, setMode] = useState('select'); // 'select' | 'scan' | 'generate'
  const [status, setStatus] = useState('');
  
  // Registration Data
  const [name, setName] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  
  // Generation
  const [generatedCode, setGeneratedCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const generateRandomCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleRegister = async (code) => {
    if (!name.trim()) {
      setStatus('Error: Name is required.');
      setMode('select');
      return;
    }

    await saveTag({ 
      code, 
      type: 'barcode', 
      name: name.trim(),
      disabled: false,
      validFrom: validFrom ? new Date(validFrom).toISOString() : null,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null
    });
    
    if (mode === 'generate') {
      setGeneratedCode(code);
      const url = await QRCode.toDataURL(code, { width: 300, margin: 2 });
      setQrCodeDataUrl(url);
      setStatus(`Successfully Generated & Registered!`);
    } else {
      setStatus(`Successfully Registered scanned barcode for ${name}!\nCode: ${code}`);
      setMode('select');
      setName('');
      setValidFrom('');
      setValidUntil('');
    }
  };

  const isProcessing = React.useRef(false);

  const handleScan = async (codes) => {
    if (codes && codes.length > 0 && !isProcessing.current) {
      isProcessing.current = true;
      await handleRegister(codes[0].rawValue);
      isProcessing.current = false;
    }
  };

  const onGenerateClick = async () => {
    if (!name.trim()) {
      setStatus('Error: You must enter a name first.');
      return;
    }
    setMode('generate');
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

      {(mode === 'select' || (mode === 'generate' && !generatedCode)) && (
        <div className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Holder's Name (Required)</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500 transition font-medium"
            />
          </div>

          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Validity Rules (Optional)</h3>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Starts Working</label>
              <input 
                type="datetime-local" 
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-2 outline-none focus:border-blue-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Stops Working</label>
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
            onClick={() => { 
              if (!name.trim()) return setStatus('Error: Name is required.');
              setStatus(''); 
              setMode('scan'); 
            }}
            className="bg-green-600 text-white py-5 rounded-xl font-bold text-xl hover:bg-green-700 transition shadow-md"
          >
            Scan Existing Barcode
          </button>
          
          <button 
            onClick={onGenerateClick}
            className="bg-blue-600 text-white py-5 rounded-xl font-bold text-xl hover:bg-blue-700 transition shadow-md"
          >
            Generate New Barcode
          </button>
        </div>
      )}

      {mode === 'scan' && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-md mx-auto bg-black rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6">
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
            />
          </div>
          <button 
            onClick={() => setMode('select')}
            className="text-red-500 font-bold px-6 py-3 border-2 border-red-500 rounded-xl hover:bg-red-50 transition w-full max-w-xs"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === 'generate' && generatedCode && qrCodeDataUrl && (
        <div className="w-full flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="bg-white p-2 border-4 border-gray-100 rounded-2xl mb-4">
            <img src={qrCodeDataUrl} alt="Generated QR Code" className="w-48 h-48" />
          </div>
          <p className="text-sm text-gray-500 mb-2">Long-press image to save, or click below</p>
          
          <a 
            href={qrCodeDataUrl}
            download={`Barcode-${name}.png`}
            className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg mb-6 w-full text-center"
          >
            Save to Photos
          </a>

          <p className="text-2xl font-mono font-bold tracking-widest text-gray-800 mb-8">{generatedCode}</p>
          
          <button 
            onClick={() => {
              setMode('select');
              setGeneratedCode('');
              setQrCodeDataUrl('');
              setStatus('');
              setName('');
              setValidFrom('');
              setValidUntil('');
            }}
            className="bg-gray-100 text-gray-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition w-full max-w-xs"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
