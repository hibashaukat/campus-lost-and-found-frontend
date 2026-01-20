import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, LogIn, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react'; // Added Eye, EyeOff
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Replaced userRole with showPassword

  const navigate = useNavigate();
  const { name, email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // NOTE: Assuming the backend handles /api/auth/register for signup
      await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role: 'student' // Hardcoded to student as per security requirement
      });

      setSuccess('Account created successfully! Redirecting to login...');
      // Optionally store token/role, but typically, we redirect to login after signup
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removed light background classes, relying on global dark background from index.css
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements (Simplified for dark theme) */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section - Updated colors for dark theme */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex p-4 rounded-3xl bg-cyan-500 shadow-2xl shadow-cyan-500/30 mb-6"
          >
            <Sparkles className="text-white" size={32} />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Trace<span className="text-cyan-500">It</span>
          </h1>
          <p className="text-white/70 font-medium">Create Your Campus Account.</p>
        </div>

        {/* Main Card - Glassmorphism applied: bg-white/5, backdrop-blur-lg, border-white/10 */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-black/50 overflow-hidden relative">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {error}
              </div>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-sm font-semibold flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {success}
              </div>
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Role Selection Tabs removed as per security requirements */}
            
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/70 ml-1">Full Name</label>
              <div className="relative group">
                {/* Icon is pure white as required, focus color changed to cyan */}
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  placeholder="John Doe"
                  // Dark transparent background, white text, cyan glow on focus
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/70 ml-1">University Email</label>
              <div className="relative group">
                {/* Icon is pure white as required, focus color changed to cyan */}
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  placeholder="yourname@university.edu" // Updated placeholder
                  // Dark transparent background, white text, cyan glow on focus
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field - Added visibility toggle */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/70 ml-1">Password</label>
              <div className="relative group">
                {/* Icon is pure white as required, focus color changed to cyan */}
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'} // Toggle type
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  placeholder="••••••••"
                  // Dark transparent background, white text, cyan glow on focus
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white transition-colors z-20"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              // Button style (Solid vibrant blue #2563eb is blue-600)
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <LogIn size={20} />
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="flex flex-col items-center mt-6 space-y-3">
            <Link to="/login" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Already have an account? Sign In</Link>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-white/40 text-sm font-medium"
          >
            By signing up, you agree to our terms.
          </motion.p>
        </div>

      </motion.div>
    </div>
  );
};
export default Signup;