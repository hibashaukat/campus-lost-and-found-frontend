import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, MessageCircle, Reply as ReplyIcon } from 'lucide-react';

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
            className="group bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-blue-200 hover:border-blue-300 transition-all duration-300 relative"
        >
            <div className="flex flex-col">
                <div className="mb-4">
                    {item.image && (
                        <div className="relative mb-4 overflow-hidden rounded-2xl bg-slate-100">
                            <img 
                                src={item.image} 
                                alt={item.title}
                                onClick={() => setSelectedImg(item.image)}
                                className="w-full h-48 md:h-80 object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found"; }}
                            />
                        </div>
                    )}
                    <h3 className="text-xl font-bold text-blue-800 mb-2">{item.title}</h3>
                    <p className="text-blue-600 line-clamp-3 leading-relaxed">{item.description}</p>
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
                
                <div className="mb-6 p-4 bg-white/50 border border-blue-300/50 rounded-2xl">
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Post a comment..."
                        rows="3"
                        className="w-full px-4 py-2 text-sm bg-white border border-blue-300/50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                        disabled={commentLoading}
                    />
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <button
                        onClick={handleMainCommentSubmit}
                        disabled={!commentContent.trim() || commentLoading}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors float-right"
                    >
                        {commentLoading ? 'Posting...' : 'Post Comment'}
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
  const [selectedImg, setSelectedImg] = useState(null);

  const fetchItems = useCallback(async () => {
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
      console.error('Failed to load items');
    }
  }, [navigate]);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 10000);
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

        alert('Reported successfully!');
        setFormData({ title: '', description: '', selectedFile: null });
        fetchItems();
    } catch (err) {
        console.error('Failed to report item');
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

      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" 
            onClick={() => setSelectedImg(null)}
          >
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImg} 
              alt="Full View" 
              className="max-w-full max-h-full object-contain rounded-lg" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
