import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Send, Search, CheckCircle, Clock, User, Tag, MessageCircle, Reply as ReplyIcon, AlertCircle } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-2xl bg-white/50 border border-blue-200/50 shadow-inner backdrop-blur-md ${isReplyItem ? 'mt-3 ml-6 border-l-4 border-blue-300/80' : 'mb-3'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-700">{cmt.userId?.email?.split('@')[0] || 'User'}</span>
          {cmt.userId?.role === 'admin' ? (
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">Admin</span>
          ) : cmt.userId?._id === itemOwnerId ? (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">Owner</span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full font-medium">Student</span>
          )}
        </div>
        <span className="text-xs text-slate-500">{new Date(cmt.createdAt).toLocaleString()}</span>
      </div>
      <p className="text-sm text-slate-700">{cmt.content}</p>
      
      {!isReplyItem && (
        <button 
            onClick={() => setIsReplying(!isReplying)}
            className="mt-2 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors flex items-center"
        >
            <ReplyIcon size={12} className="mr-1" />
            {isReplying ? 'Cancel Reply' : 'Reply'}
        </button>
      )}

      {isReplying && (
        <div className="mt-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows="2"
            className="w-full px-4 py-2 text-sm bg-white/70 border border-blue-300/50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
          />
          <button
            onClick={handleReplySubmit}
            className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Post Reply
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <>
      <CommentCard cmt={comment} isReplyItem={isReply} />
      {replies.length > 0 && (
        <div className="pl-4">
          <AnimatePresence>
            {replies.map(reply => (
              <Comment
                key={reply._id}
                comment={reply}
                allComments={allComments}
                onReply={onReply}
                itemOwnerId={itemOwnerId}
                isReply={true}
              />
            ))}
          </AnimatePresence>
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
            const res = await axios.get(`/api/comments/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
            setError('Failed to load comments');
        }
    }, [item._id]);

    useEffect(() => {
        fetchComments();
        const interval = setInterval(fetchComments, 5000); 
        return () => clearInterval(interval);
    }, [fetchComments]);

    const handlePostComment = async (reportId, content, parentCommentId = null) => {
        setCommentLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/comments', { reportId, content, parentCommentId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchComments(); 
            onCommentPosted(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post comment');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleMainCommentSubmit = () => {
        if (commentContent.trim()) {
            handlePostComment(item._id, commentContent);
            setCommentContent('');
        }
    };

    return (
        <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="group bg-white rounded-[2rem] p-6 border border-blue-200 hover:border-blue-300 hover:shadow-3xl hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden"
        >
            <div className="flex flex-col">
                <div className="mb-4">
                    {item.image && (
                        <div className="relative group mb-4">
                            <img 
                                src={`https://campus-lost-and-found-backend.vercel.app/uploads/${item.image}`} 
                                alt={item.title}
                                onClick={() => setSelectedImg(`https://campus-lost-and-found-backend.vercel.app/uploads/${item.image}`)}
                                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                Verified
                            </div>
                        </div>
                    )}

                    <div className="absolute top-6 right-6 flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
                        <CheckCircle size={12} />
                        <span>Approved</span>
                    </div>

                    <div className="p-3 bg-blue-50 w-fit rounded-2xl mb-4 text-blue-500">
                      <Tag size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-blue-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-blue-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate-400 font-medium">
                        <Clock size={16} className="mr-1.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg">
                        <User size={16} className="mr-1.5" />
                        {item.createdBy?.email?.split('@')[0] || 'User'}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-100">
                <h4 className="flex items-center text-lg font-bold text-blue-700 mb-4">
                    <MessageCircle size={18} className="mr-2" />
                    Discussion ({comments.length})
                </h4>
                
                <div className="mb-6 p-4 bg-white/50 border border-white/70 shadow-glass backdrop-blur-md rounded-2xl">
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Post a comment..."
                        rows="3"
                        className="w-full px-4 py-2 text-sm bg-white/70 border border-blue-300/50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-blue-800 placeholder-blue-400"
                        disabled={commentLoading}
                    />
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <button
                        onClick={handleMainCommentSubmit}
                        disabled={!commentContent.trim() || commentLoading}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center float-right"
                    >
                        {commentLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={14} className="mr-2" />
                                Post Comment
                            </>
                        )}
                    </button>
                    <div className="clear-both"></div>
                </div>

                <div className="space-y-3">
                    {comments.filter(c => !c.parentCommentId).map(comment => (
                        <Comment 
                            key={comment._id} 
                            comment={comment}
                            allComments={comments}
                            onReply={handlePostComment}
                            itemOwnerId={item.createdBy?._id || item.createdBy}
                        />
                    ))}
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
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);

  const fetchItems = useCallback(async (isInitial = false) => {
    if (isInitial) setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/items/approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setFetchError('Failed to load items');
    } finally {
      setFetchLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchItems(true);
    const interval = setInterval(() => fetchItems(false), 10000);
    return () => clearInterval(interval);
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

        await axios.post('/api/items', data, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        setSuccess('Reported successfully!');
        setFormData({ title: '', description: '', selectedFile: null });
    } catch (err) {
        setError('Failed to report item');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Student Dashboard</h1>
          <p className="text-lg text-blue-600">Browse found valuables across campus.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white p-8 rounded-3xl border shadow-xl">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">Report Item</h2>
              <form onSubmit={onSubmit} className="space-y-5">
                <input
                  type="text"
                  placeholder="Item Title"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500"
                  rows="4"
                  required
                />
                <input
                  type="file"
                  onChange={e => setFormData({...formData, selectedFile: e.target.files[0]})}
                  className="w-full text-sm"
                />
                <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">
                  {loading ? 'Reporting...' : 'Report Item'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-6">
              {items.map(item => (
                <ItemCard key={item._id} item={item} onCommentPosted={fetchItems} setSelectedImg={setSelectedImg} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedImg && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="Full View" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;