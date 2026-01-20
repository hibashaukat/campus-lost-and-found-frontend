import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/student-dashboard' && (location.pathname === '/student-dashboard' || location.pathname === '/report')) return true;
    return location.pathname === path;
  };

  const linkClasses = "flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50";
  const activeClasses = "bg-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20";

  if (isLoginPage) {
    return null; // Completely hide Navbar on login/signup page
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full py-3 bg-white dark:bg-slate-900 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-md"
    >
      <div className="h-16 flex items-center justify-between w-full px-8"> {/* 2rem padding (px-8) applied here to ensure space from edges */}
        {/* Logo */}
        <motion.button
          onClick={() => handleNavigation(userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard')}
          className="flex items-center space-x-2 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Trace<span className="text-blue-600 dark:text-blue-400 font-bold">It</span>
          </span>
        </motion.button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {userRole === 'admin' && (
              <button
                onClick={() => handleNavigation('/admin-dashboard')}
                className={`${linkClasses} ${isActive('/admin-dashboard') ? activeClasses : ''}`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            )}
            
            {userRole === 'student' && (
              <>
                <button
                  onClick={() => handleNavigation('/student-dashboard')}
                  className={`${linkClasses} ${isActive('/student-dashboard') ? activeClasses : ''}`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigation('/report')}
                  className={`${linkClasses} ${isActive('/report') ? activeClasses : ''}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Report Item
                </button>
              </>
            )}
          </div>
          {userRole && (
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </motion.button>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden border-t border-white/10"
          >
            <div className="p-4 space-y-2">
              {userRole === 'admin' && (
                <button
                  onClick={() => handleNavigation('/admin-dashboard')}
                  className={`w-full ${linkClasses} ${isActive('/admin-dashboard') ? activeClasses : ''}`}
                >
                  <Home className="w-4 h-4 mr-3" />
                  Dashboard
                </button>
              )}
              {userRole === 'student' && (
                <>
                  <button
                    onClick={() => handleNavigation('/student-dashboard')}
                    className={`w-full ${linkClasses} ${isActive('/student-dashboard') ? activeClasses : ''}`}
                  >
                    <Home className="w-4 h-4 mr-3" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigation('/report')}
                    className={`w-full ${linkClasses} ${isActive('/report') ? activeClasses : ''}`}
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Report Item
                  </button>
                </>
              )}
              {userRole && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;