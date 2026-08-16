import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateEntry } from '../utils/db';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function DirectScan() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const checkCode = async () => {
      const validation = await validateEntry(code);
      setResult(validation);
    };
    checkCode();
  }, [code]);

  if (!result) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center">
      {result.valid ? (
        <CheckCircle2 size={120} className="text-green-500 mb-6" />
      ) : (
        <XCircle size={120} className="text-red-500 mb-6" />
      )}
      
      <h2 className="text-3xl font-bold mb-2 text-center">
        {result.valid ? 'Access Granted' : 'Access Denied'}
      </h2>
      {!result.valid && (
        <p className="text-xl text-gray-600 mb-12 text-center">{result.reason}</p>
      )}

      <button 
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition mt-12"
      >
        Go Home
      </button>
    </div>
  );
}
