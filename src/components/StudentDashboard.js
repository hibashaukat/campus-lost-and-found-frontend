import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, User, Tag, MessageCircle, Reply as ReplyIcon, Image as ImageIcon } from 'lucide-react';

// Backend URL Constant
const BACKEND_URL = "https://campus-lost-and-found-backend.vercel.app";

const Comment = ({ comment, allComments, onReply, itemOwnerId, isReply = false }) => {
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

  const CommentCard = ({ cmt, isReplyItem }) => (
    <div className={`p-4 rounded-2xl bg-white/50 border border-blue-200/50 shadow-inner backdrop-blur-md ${isReplyItem ? 'mt-3 ml-6 border-l-4 border-blue-300/80' : 'mb-3'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-700">{cmt.userId?.email?.split('@')[0] || 'User'}</span>
        </div>
        <span className="text-xs text-slate-500">{new Date(cmt.createdAt).toLocaleString()}</span>
      </div>
      <p className="text-sm text-slate-700">{cmt.content}</p>
      
      {!isReplyItem && (
        <button onClick={() => setIsReplying(!isReplying)} className="mt-2 text-xs font-medium text-blue-500 flex items-center">
          <ReplyIcon size={12} className="mr-1" />
          {isReplying ? 'Cancel' : 'Reply'}
        </button>
      )}

      {isReplying && (
        <div className="mt-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows="2"
            className="w-full px-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleReplySubmit} className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg">
            Post Reply
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <CommentCard cmt={comment} isReplyItem={isReply} />
      {replies.length > 0 && (
        <div className="pl-4">
          {replies.map(reply => (
            <Comment key={reply._id} comment={reply} allComments={allComments} onReply={onReply} itemOwnerId={itemOwnerId} isReply={true} />
          ))}
        </div>
      )}
    </>
  );
};

const ItemCard = ({ item, onCommentPosted, setSelectedImg }) => {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchComments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/comments/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data);
        } catch (err) { console.error('Comments fetch error'); }
    }, [item._id]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handlePostComment = async (reportId, content, parentCommentId = null) => {
        setCommentLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${BACKEND_URL}/api/comments`, { reportId, content, parentCommentId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchComments();
            onCommentPosted();
        } catch (err) { setError('Failed to post'); }
        finally { setCommentLoading(false); }
    };

    return (
        <div className="bg-white rounded-[2rem] p-6 border border-blue-200 shadow-sm mb-6">
            {/* Image Section Fix */}
            <div className="mb-4">
                {item.image ? (
                    <div className="relative group">
                        <img 
                            src={`${BACKEND_URL}/uploads/${item.image}`} 
                            alt={item.title}
                            onClick={() => setSelectedImg(`${BACKEND_URL}/uploads/${item.image}`)}
                            className="w-full h-64 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div style={{display: 'none'}} className="w-full h-64 bg-slate-100 rounded-2xl flex-col items-center justify-center text-slate-400">
                             <ImageIcon size={40} className="mb-2" />
                             <span>Image not available</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-48 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed">
                        <ImageIcon size={32} />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-blue-800">{item.title}</h3>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Approved</span>
            </div>
            
            <p className="text-blue-600 mb-6 leading-relaxed">{item.description}</p>

            <div className="flex items-center justify-between text-sm text-slate-400 pb-6 border-b border-blue-50">
                <div className="flex items-center"><Clock size={16} className="mr-1" /> {new Date(item.createdAt).toLocaleDateString()}</div>
                <div className="flex items-center font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    <User size={16} className="mr-1" /> {item.createdBy?.email?.split('@')[0] || 'User'}
                </div>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
                <h4 className="font-bold text-blue-700 flex items-center mb-4">
                    <MessageCircle size={18} className="mr-2" /> Discussion ({comments.length})
                </h4>
                <div className="space-y-4">
                    {comments.filter(c => !c.parentCommentId).map(c => (
                        <Comment key={c._id} comment={c} allComments={comments} onReply={handlePostComment} itemOwnerId={item.createdBy?._id} />
                    ))}
                </div>
                <div className="mt-4 flex gap-2">
                    <input 
                        className="flex-1 px-4 py-2 border rounded-xl outline-none focus:border-blue-500" 
                        placeholder="Write a comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                    />
                    <button 
                        onClick={() => { if(commentContent.trim()){ handlePostComment(item._id, commentContent); setCommentContent(''); }}}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                    >Post</button>
                </div>
            </div>
        </div>
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
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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

        alert('Reported! Wait for admin approval.');
        setFormData({ title: '', description: '', selectedFile: null });
        fetchItems();
    } catch (err) { alert('Failed to report'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-3xl border shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-blue-800 mb-4">New Report</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <input className="w-full p-3 bg-slate-50 border rounded-xl outline-none" placeholder="What did you find?" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <textarea className="w-full p-3 bg-slate-50 border rounded-xl outline-none" rows="3" placeholder="Details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                <input type="file" className="text-xs" onChange={e => setFormData({...formData, selectedFile: e.target.files[0]})} />
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">{loading ? 'Uploading...' : 'Submit Report'}</button>
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
