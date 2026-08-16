import React, { useState, useEffect } from 'react';
import { getAllTags, removeTag, disableTag } from '../utils/db';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTags = async () => {
    setLoading(true);
    const data = await getAllTags();
    setTags(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) {
      loadTags();
    }
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '2357') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleRemove = async (code) => {
    if (window.confirm('Are you sure you want to completely remove this tag?')) {
      await removeTag(code);
      loadTags();
    }
  };

  const handleToggleDisable = async (code, currentDisabled) => {
    await disableTag(code, !currentDisabled);
    loadTags();
  };

  if (!authenticated) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
          
          {error && <p className="text-red-500 mb-4 text-center text-sm font-medium">{error}</p>}
          
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-gray-200 p-3 rounded-xl mb-6 focus:border-blue-500 outline-none transition"
          />
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Tags</h2>
        <button 
          onClick={() => setAuthenticated(false)}
          className="text-red-600 font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading tags...</p>
        ) : tags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tags registered yet.</p>
        ) : (
          tags.map((tag) => (
            <div key={tag.code} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-bold text-lg text-gray-800">{tag.code}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase">
                    {tag.type}
                  </span>
                  {tag.disabled && (
                    <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded">
                      DISABLED
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleToggleDisable(tag.code, tag.disabled)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    tag.disabled 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {tag.disabled ? 'Enable' : 'Disable'}
                </button>
                <button
                  onClick={() => handleRemove(tag.code)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
