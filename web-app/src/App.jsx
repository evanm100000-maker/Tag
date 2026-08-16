import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Home from './pages/Home';
import Scanning from './pages/Scanning';
import Registering from './pages/Registering';
import Admin from './pages/Admin';

import DirectScan from './pages/DirectScan';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') return null;

  return (
    <div className="bg-blue-600 text-white p-4 flex items-center shadow-md">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:bg-blue-700 px-3 py-2 rounded-lg transition">
        <ChevronLeft size={24} />
        <span className="font-semibold text-lg">Back</span>
      </button>
      <h1 className="ml-4 text-xl font-bold capitalize">
        {location.pathname.split('/')[1] || ''}
      </h1>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scanning" element={<Scanning />} />
            <Route path="/registering" element={<Registering />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/scan/:code" element={<DirectScan />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
