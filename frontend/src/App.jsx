import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import Navbar from './components/Navbar';

// Layout wrapper to add Navbar to dashboard pages
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intelligently route based on Role */}
        {user.role === 'student' ? <StudentDashboard /> : <FacultyDashboard />}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <DashboardLayout />
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;