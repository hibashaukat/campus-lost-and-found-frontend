import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// Icons ko fix kiya gaya hai
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
            <p className="text-lg text-blue-600 ml-1">Manage campus reports.</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-700 font-medium">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50/50 border-b border-blue-100">
                <th className="px-8 py-6 text-left text-xs font-bold text-blue-400 uppercase tracking-widest">Item</th>
                <th className="px-8 py-6 text-left text-xs font-bold text-blue-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-xs font-bold text-blue-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const status = getStatusConfig(item.status);
                return (
                  <tr key={item._id} className="border-b border-blue-50">
                    <td className="px-8 py-7">
                      <div className="font-bold text-blue-800">{item.title}</div>
                      <div className="text-sm text-blue-500">{item.description}</div>
                    </td>
                    <td className="px-8 py-7">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                        {status.icon} {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex justify-end space-x-2">
                        {item.status === 'pending' && (
                          <button onClick={() => handleApprove(item._id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                            <CheckCircle size={20} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
