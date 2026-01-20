import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, MessageCircle, Reply as ReplyIcon, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = "https://campus-lost-and-found-backend.vercel.app";

const Comment = ({ comment, allComments, onReply }) => {
  const replies = allComments.filter(c => c.parentCommentId === comment._id);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.reportId, replyContent, comment._id);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="p-4 rounded-2xl bg-white/50 border border-blue-200/50 shadow-inner backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <User size={14} className="text-blue-500" />
            <span className="text-sm font-semibold text-blue-700">{comment.userId?.email?.split('@')[0] || 'User'}</span>
          </div>
          <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        <p className="text-sm text-slate-700">{comment.content}</p>
        <button onClick={() => setIsReplying(!isReplying)} className="mt-2 text-xs font-medium text-blue-500 flex items-center">
          <ReplyIcon size={12} className="mr-1" />
          {isReplying ? 'Cancel' : 'Reply'}
        </button>
      </div>

      {isReplying && (
        <div className="mt-2 ml-6">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-2 text-sm border rounded-lg outline-none"
            placeholder="Write a reply..."
          />
          <button onClick={handleReplySubmit} className="mt-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg">Post</button>
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-6 border-l-2 border-blue-100 pl-4 mt-2">
          {replies.map(reply => (
            <Comment key={reply._id} comment={reply} allComments={allComments} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

const ItemCard = ({ item, onCommentPosted, setSelectedImg }) => {
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/comments/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (err) { console.error('Error fetching comments'); }
  }, [item._id]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handlePostComment = async (reportId, content, parentCommentId = null) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/comments`, { reportId, content, parentCommentId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
      onCommentPosted();
    } catch (err) { console.error('Post error'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2rem] p-6 border border-blue-200 shadow-sm mb-8">
      <div className="mb-4">
        {item.image ? (
          <img 
            src={`${BACKEND_URL}/uploads/${item.image}`} 
            alt={item.title}
            onClick={() => setSelectedImg(`${BACKEND_URL}/uploads/${item.image}`)}
            className="w-full h-64 object-cover rounded-2xl cursor-pointer"
            onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found"; }}
          />
        ) : (
          <div className="w-full h-48 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed">
            <ImageIcon size={32} />
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold text-blue-800 mb-2">{item.title}</h3>
      <p className="text-blue-600 mb-6">{item.description}</p>

      <div className="flex items-center justify-between text-sm text-slate-400 pb-4 border-b">
        <div className="flex items-center"><Clock size={16} className="mr-1" /> {new Date(item.createdAt).toLocaleDateString()}</div>
        <div className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg flex items-center">
          <User size={16} className="mr-1" /> {item.createdBy?.email?.split('@')[0] || 'User'}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-bold text-blue-700 flex items-center mb-4">
          <MessageCircle size={18} className="mr-2" /> Discussion ({comments.length})
        </h4>
        {comments.filter(c => !c.parentCommentId).map(c => (
          <Comment key={c._id} comment={c} allComments={comments} onReply={handlePostComment} />
        ))}
        <div className="mt-4 flex gap-2">
          <input 
            className="flex-1 px-4 py-2 border rounded-xl outline-none" 
            placeholder="Add a comment..." 
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <button 
            onClick={() => { if(commentContent.trim()) { handlePostComment(item._id, commentContent); setCommentContent(''); }}}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
          >Post</button>
        </div>
      </div>
    </motion.div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', selectedFile: null });
  const [loading, setLoading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/items/approved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) { if (err.response?.status === 401) navigate('/login'); }
  }, [navigate]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.selectedFile) data.append('image', formData.selectedFile);

      await axios.post(`${BACKEND_URL}/api/items`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Reported Successfully!');
      setFormData({ title: '', description: '', selectedFile: null });
      fetchItems();
    } catch (err) { alert('Upload failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-3xl border shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-blue-800 mb-4">Report Found Item</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <textarea className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                <input type="file" className="text-xs" onChange={e => setFormData({...formData, selectedFile: e.target.files[0]})} />
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">{loading ? 'Submitting...' : 'Submit'}</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-8">
            {items.map(item => <ItemCard key={item._id} item={item} onCommentPosted={fetchItems} setSelectedImg={setSelectedImg} />)}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedImg && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImg(null)}>
            <img src={selectedImg} className="max-w-full max-h-full rounded-xl" alt="Preview" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
