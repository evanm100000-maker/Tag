import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, KeyRound, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'activate'
  const { login, activate } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Activation form state
  const [actName, setActName] = useState('');
  const [actOtp, setActOtp] = useState('');
  const [actPassword, setActPassword] = useState('');
  const [actPasscode, setActPasscode] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await login(loginUser, loginPass);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!actName.trim() || !actOtp.trim() || !actPassword.trim() || !actPasscode.trim()) {
      setError('All fields are required.');
      return;
    }

    if (actPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (actPasscode.length < 4) {
      setError('Passcode must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await activate(actName, actOtp, actPassword, actPasscode);
      if (res.success) {
        setSuccess('Account activated and logged in successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(res.error || 'Activation failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during activation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-[80vh] flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        
        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 mb-8">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-4 text-lg font-bold transition-all border-b-2 ${
              activeTab === 'login'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setActiveTab('activate');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-4 text-lg font-bold transition-all border-b-2 ${
              activeTab === 'activate'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Activate Account
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl mb-6 text-sm font-medium">
            {success}
          </div>
        )}

        {activeTab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome Back</h3>
            <p className="text-gray-500 text-sm mb-6">Enter your username and password to log in.</p>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Username</label>
              <div className="relative">
                <User size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500 transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-blue-200 disabled:bg-blue-400 mt-6 cursor-pointer"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          /* ACTIVATION / FIRST-TIME SIGN IN FORM */
          <form onSubmit={handleActivateSubmit} className="space-y-5">
            <h3 className="text-xl font-bold text-gray-800 mb-2">First-Time Setup</h3>
            <p className="text-gray-500 text-sm mb-6">Enter your name and the 1-time passcode given to you to set up your password.</p>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
              <div className="relative">
                <User size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your exact name"
                  required
                  value={actName}
                  onChange={(e) => setActName(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">1-Time Passcode</label>
              <div className="relative">
                <KeyRound size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. AB12CD"
                  required
                  value={actOtp}
                  onChange={(e) => setActOtp(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500 transition font-medium uppercase"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-600" /> Choose New Credentials
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    required
                    value={actPassword}
                    onChange={(e) => setActPassword(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Passcode / PIN</label>
                  <input
                    type="password"
                    placeholder="Min 4 characters (e.g. 1234)"
                    required
                    value={actPasscode}
                    onChange={(e) => setActPasscode(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 transition font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-green-200 disabled:bg-green-400 mt-6 cursor-pointer"
            >
              {loading ? 'Activating account...' : 'Activate & Log In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
