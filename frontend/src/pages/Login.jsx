import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, AlertCircle, Key, UserCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [accessCode, setAccessCode] = useState('');
  const [username, setUsername] = useState('');

  const handleSSO = async (role) => {
    // Validation
    if (!accessCode) {
      setError("Please enter the Access Code.");
      return;
    }
    if (role === 'student' && !username.trim()) {
      setError("Please enter your Full Name.");
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Pass username to context -> backend
    const result = await login(role, accessCode, username);
    
    if (result.success) {
      navigate('/dashboard'); 
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="inline-flex bg-slate-800 p-3 rounded-xl mb-4 shadow-lg ring-1 ring-white/10">
            <Shield className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Secure Assignment Portal</h1>
          <p className="text-slate-400 text-sm">Institutional Single Sign-On</p>
        </div>

        {/* Form Area */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-rose-100">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Full Name Input (New) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="e.g. John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Access Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Access Code</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                placeholder="Enter PIN Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            {/* <p className="text-[10px] text-slate-400 text-right">
              Codes: Student (<span className="font-mono">student123</span>) | Faculty (<span className="font-mono">admin123</span>)
            </p> */}
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleSSO('student')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 group transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Student Login</p>
                  <p className="text-xs text-slate-500">Log in as Student</p>
                </div>
              </div>
              <div className="text-slate-300 group-hover:text-indigo-500">→</div>
            </button>

            <button
              onClick={() => handleSSO('faculty')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 group transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Faculty Access</p>
                  <p className="text-xs text-slate-500">Log in as Faculty</p>
                </div>
              </div>
              <div className="text-slate-300 group-hover:text-emerald-500">→</div>
            </button>
          </div>
          
          <div className="text-center">
             {isLoading ? (
               <p className="text-sm text-indigo-600 font-medium animate-pulse">Authenticating securely...</p>
             ) : (
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Connection Secured via SSL/TLS
                </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;