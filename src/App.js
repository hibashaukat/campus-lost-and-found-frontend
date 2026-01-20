import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const pageTransition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1]
};

// Layout component to handle Navbar and route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  // Hide Navbar only on /login and /signup
  const showNavbar = location.pathname !==
'/login' && location.pathname !== '/signup';
  
  return (
    <>
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={
            <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
              <Login />
            </motion.div>
          } />

          <Route path="/signup" element={
            <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
              <Signup />
            </motion.div>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
                <AdminDashboard />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/student-dashboard" element={
            <ProtectedRoute requiredRole="student">
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
                <StudentDashboard />
              </motion.div>
            </ProtectedRoute>
          } />

          <Route path="/report" element={
            <ProtectedRoute requiredRole="student">
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
                <StudentDashboard /> {/* Report is part of the dashboard now, or we can route to same component */}
              </motion.div>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="App selection:bg-blue-100 selection:text-blue-600">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;