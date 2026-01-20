import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// Faltu imports hata diye hain taake Vercel error na de
import { CheckCircle, Trash2, Clock, Filter, AlertCircle, ShieldCheck, Mail, Calendar, Image as ImageIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/items/${itemId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.map(item =>
        item._id === itemId ? { ...item, status: 'approved' } : item
      ));
    } catch (err) {
      setError('Failed to approve item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <CheckCircle size={14} className="mr-1" />
      },
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <Clock size={14} className="mr-1" />
      }
    };
    return configs[status] || { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: null };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">Admin Dashboard</h1>
            </div>
            <p className="text-lg text-blue-600 ml-1">Manage and moderate campus lost & found reports.</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-700 font-medium">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-8 p-2 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:inline-flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center text-blue-400 px-4">
            <Filter size={18} className="mr-2" />
            <span className="text-sm font-bold uppercase tracking-wider">Status</span>
          </div>
          <div className="flex gap-1 p-1">
            {['all', 'pending', 'approved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === f ? 'bg-blue-600 text-white' : 'text-blue-500 hover:bg-blue-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50/50 border-b border-blue-100">
                  <th className="px-8 py-6 text-left text-xs font-bold text-blue-400 uppercase tracking-widest">Image</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-blue-400 uppercase tracking-widest">Item Information</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-blue-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-blue-400 uppercase tracking-widest">Reporter</th>
                  <th className="px-8 py-6 text-right text-xs font-bold text-blue-400 uppercase tracking-widest">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => {
                    const status = getStatusConfig(item.status);
                    return (
                      <motion.tr
                        key={item._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-8 py-7">
                          {item.image ? (
                            <img 
                              src={`https://campus-lost-and-found-backend.vercel.app/uploads/${item.image}`} 
                              alt="Item" 
                              className="w-16 h-16 object-cover rounded-xl border border-blue-100"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-7">
                          <div className="font-bold text-blue-800 text-lg mb-1">{item.title}</div>
                          <div className="text-blue-600 max-w-md line-clamp-2">{item.description}</div>
                          <div className="flex items-center text-xs font-bold text-blue-400 mt-3">
                            <Calendar size={12} className="mr-1.5" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold border ${status.bg} ${status.text} ${status.border}`}>
                            {status.icon}
                            {item.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-8 py-7 text-slate-900 text-base">
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2 text-blue-400" />
                            {item.reporterEmail || (item.createdBy?.email) || "N/A"}
                          </div>
                        </td>
                        <td className="px-8 py-7 text-right">
                          <div className="flex justify-end space-x-3">
                            {item.status === 'pending' && (
                              <button
                                onClick={() => handleApprove(item._id)}
                                className="p-3 bg-white border border-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"
                              >
                                <CheckCircle size={22} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-3 bg-white border border-red-100 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={22} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
