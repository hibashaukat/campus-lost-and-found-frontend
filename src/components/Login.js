import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('student'); // 'student' or 'admin'

  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', {
        email,
        password,
        role: userRole, // Pass the selected role
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);

      if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      // Handle 401 specifically for role mismatch
      if (err.response?.status === 401) {
        setError('Unauthorized: Role mismatch. Please check the selected role.');
      } else {
        setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" 
      style={{ backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #000000 100%)' }}
    >
      {/* Background Orbs adjusted for dark theme */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-white tracking-wider mb-2">
            Trace<span className="text-cyan-400">It</span>
          </h1>
          <p className="text-white/60 font-medium text-lg">Sign in to your secure portal</p>
        </div>

        {/* Main Card - Glassmorphism */}
        <div 
          className="rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative text-white"
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 255, 255, 0.1)' 
          }}
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center">
                <span className="mr-2 flex-shrink-0 text-red-400">⚠️</span> 
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Role Selection Tabs */}
            <div className="flex justify-center mb-6 p-1 bg-white/10 border border-white/20 rounded-xl">
              <button
                type="button"
                onClick={() => setUserRole('student')}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${userRole === 'student' ? 'bg-white/20 text-white shadow-xl shadow-cyan-500/10' : 'text-white hover:text-white'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${userRole === 'admin' ? 'bg-white/20 text-white shadow-xl shadow-cyan-500/10' : 'text-white hover:text-white'}`}
              >
                Admin
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">University Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  placeholder="name@university.edu"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Security Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1 rounded-full"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-[#1e40af] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <LogIn size={20} />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up and Forgot Password Links */}
          <div className="flex flex-col items-center mt-6 space-y-3">
            <Link to="/signup" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Don't have an account? Sign Up</Link>
            <Link to="/forgot-password" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Forgot Password?</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
