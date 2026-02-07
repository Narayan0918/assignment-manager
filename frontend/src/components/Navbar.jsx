import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              SecureSubmit<span className="text-indigo-400">.edu</span>
            </span>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">{user.role}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold border border-indigo-400">
                {user.name.charAt(0)}
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;