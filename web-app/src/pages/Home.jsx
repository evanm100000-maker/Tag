import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, UserPlus, Settings } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full flex flex-col justify-center items-center max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-12 text-gray-800 text-center">Event Entry Scanner</h1>
      
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <button 
          onClick={() => navigate('/scanning')}
          className="flex-1 bg-white border-2 border-blue-500 hover:bg-blue-50 text-blue-600 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all shadow-sm hover:shadow-md"
        >
          <Scan size={48} />
          <span className="text-xl font-bold">Scanning</span>
        </button>

        <button 
          onClick={() => navigate('/registering')}
          className="flex-1 bg-white border-2 border-green-500 hover:bg-green-50 text-green-600 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all shadow-sm hover:shadow-md"
        >
          <UserPlus size={48} />
          <span className="text-xl font-bold">Registering</span>
        </button>

        <button 
          onClick={() => navigate('/admin')}
          className="flex-1 bg-white border-2 border-purple-500 hover:bg-purple-50 text-purple-600 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all shadow-sm hover:shadow-md"
        >
          <Settings size={48} />
          <span className="text-xl font-bold">Admin</span>
        </button>
      </div>
    </div>
  );
}
