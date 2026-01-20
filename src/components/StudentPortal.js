import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { PlusCircle, Search, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from './Navbar';

const StudentPortal = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for approved items to show in the public dashboard
      const approvedItems = res.data.filter(item => item.status === 'approved');
      setItems(approvedItems);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again later.');
    } finally {
      setFetching(false);
    }
  };

  const onChange = e => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.image) {
        data.append('image', formData.image);
      }

      await axios.post('/api/items', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Item reported successfully! It will appear once approved.');
      setFormData({ title: '', description: '', image: null });
      // Reset file input manually if needed, but for now just clear state
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.15),transparent_50%)] text-slate-200 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 mb-4">
            Student Dashboard
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Welcome to <span className="text-sky-400 font-semibold tracking-tight">TraceIt</span>. 
            Keep track of your campus belongings with ease and efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Report Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-24 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-sky-500/20 rounded-xl">
                    <PlusCircle className="w-6 h-6 text-sky-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Report New Item</h2>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={onChange}
                      required
                      placeholder="e.g., Blue Backpack, Keys"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={onChange}
                      required
                      placeholder="Where and when did you find/lose it?"
                      rows="4"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Photo</label>
                    <input
                      type="file"
                      name="image"
                      onChange={onChange}
                      accept="image/*"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-500/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Reporting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Items Display Section */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-sky-400" />
                <h2 className="text-2xl font-bold text-white tracking-tight">Recent Discoveries</h2>
              </div>
              <div className="text-slate-500 text-sm font-medium">
                Showing {items.length} verified items
              </div>
            </div>

            {fetching ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
                <p className="text-slate-400 animate-pulse">Scanning the campus...</p>
              </div>
            ) : items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="backdrop-blur-md bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center"
              >
                <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300">No items found</h3>
                <p className="text-slate-500">All's quiet on the campus right now.</p>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl hover:shadow-sky-500/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {(item.createdBy?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Reported By</span>
                        <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
                          {item.createdBy?.email || 'Unknown User'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
