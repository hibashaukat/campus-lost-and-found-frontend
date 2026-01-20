import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Trash2, Clock, AlertCircle, ShieldCheck, Image as ImageIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Backend ka pura URL yahan check karlein sahi hai ya nahi
  const BACKEND_URL = "https://campus-lost-and-found-backend.vercel.app";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/items`, {
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
      await axios.put(`${BACKEND_URL}/api/items/${itemId}`, {}, {
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
      await axios.delete(`${BACKEND_URL}/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: { bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle size={14} className="mr-1" /> },
      pending: { bg: "bg-amber-100", text: "text-amber-700", icon: <Clock size={14} className="mr-1" /> }
    };
    return configs[status] || { bg: "bg-blue-50", text: "text-blue-600", icon: null };
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
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">Admin Dashboard</h1>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-3" /> {error}
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-blue-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-blue-400 uppercase">Image</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-400 uppercase">Item Details</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-blue-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {items.map((item) => {
                const status = getStatusConfig(item.status);
                return (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {item.image ? (
                        <img 
                          src={`${BACKEND_URL}/uploads/${item.image}`} 
                          alt="Item" 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://via.placeholder.com/150?text=No+Pic";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-800">{item.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                        {status.icon} {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
