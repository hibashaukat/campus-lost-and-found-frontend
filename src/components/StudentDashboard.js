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
          <span className="text-sm font-semibold text-blue-700">{cmt.userId.email.split('@')[0]}</span>
          {cmt.userId.role === 'admin' ? (
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">Admin</span>
          ) : cmt.userId._id === itemOwnerId ? (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">Owner</span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full font-medium">Finder/Student</span>
          )}
        </div>
        <span className="text-xs text-slate-500">{new Date(cmt.createdAt).toLocaleString()}</span>
      </div>
      <p className={`text-sm text-slate-700 ${isReplyItem ? 'pl-0' : 'pl-0'}`}>{cmt.content}</p>
      
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
            placeholder={`Replying to ${cmt.userId.email.split('@')[0]}...`}
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

    // Fetch comments for this specific item
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
        // Simulating real-time update: Polling for new comments every 5 seconds (best for non-Firebase setup)
        // In a real production environment, this should be replaced with WebSockets or Firestore listeners.
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
            
            // Optimistically update comments or refetch immediately
            fetchComments(); 
            onCommentPosted(); // Notify parent dashboard (optional, but good for holistic updates)
            
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
    
    // Function to recursively render comments and their replies
    const renderComments = (commentList) => {
      // Filter for top-level comments (parentCommentId is null)
      const topLevelComments = commentList.filter(c => c.parentCommentId === null || c.parentCommentId === undefined);

      return (
        <AnimatePresence>
          {topLevelComments.map(comment => (
            <Comment 
              key={comment._id} 
              comment={comment}
              allComments={commentList}
              onReply={handlePostComment}
              itemOwnerId={item.createdBy?._id || item.createdBy}
            />
          ))}
        </AnimatePresence>
      );
    };


    return (
        <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="group bg-white rounded-[2rem] p-6 border border-blue-200 hover:border-blue-300 hover:shadow-3xl hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden"
        >
            <div className="flex flex-col">
                {/* Item Details */}
                <div className="mb-4">
                    {/* Item Image */}
                    {item.image && (
                     <div className="relative group">
  <img 
  src={`http://https://campus-lost-and-found-backend.vercel.app:5000/uploads/${item.image}`} 
  alt={item.title}
  // Yahan check karein ke spelling bilkul 'setSelectedImg' hi ho
  onClick={() => setSelectedImg(`http://https://campus-lost-and-found-backend.vercel.app:5000/uploads/${item.image}`)}
  className="w-full h-48 object-cover rounded-lg cursor-pointer"
/>
  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
    Verified
  </div>
</div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-6 right-6 flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
                      <CheckCircle size={12} />
                      <span>Verified</span>
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

                {/* Footer and Comment Toggle */}
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate-400 font-medium">
                        <Clock size={16} className="mr-1.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg">
                        <User size={16} className="mr-1.5" />
                        {item.createdBy?.email.split('@')[0] || 'Anonymous'}
                    </div>
                </div>
            </div>

            {/* Comment Section */}
            <div className="mt-6 pt-6 border-t border-blue-100">
                <h4 className="flex items-center text-lg font-bold text-blue-700 mb-4">
                    <MessageCircle size={18} className="mr-2" />
                    Discussion ({comments.length})
                </h4>
                
                {/* New Comment Input - Glassmorphism style */}
                <div className="mb-6 p-4 bg-white/50 border border-white/70 shadow-glass backdrop-blur-md rounded-2xl">
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Post a comment (e.g., 'This is my item', 'Where can I collect it?')..."
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

                {/* Comment List */}
                <div className="space-y-3">
                    {renderComments(comments)}
                </div>
            </div>
        </motion.div>
    );
};


const StudentDashboard = () => {
  const navigate = useNavigate(); // Initialize navigation
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedFile: null
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [success, setSuccess] = useState('');
const [selectedImg, setSelectedImg] = useState(null);
  const handleAuthError = useCallback((err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
      return 'Token is not valid. Please log in again.';
    }
    return err.response?.data?.message || 'Server Error. Please try again.';
  }, [navigate]);

  // Modified fetchItems to use the new approved reports endpoint and be a dependency for real-time
  const fetchItems = useCallback(async (isInitial = false) => {
    if (isInitial) setFetchLoading(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      // Use the dedicated approved endpoint
      const res = await axios.get('/api/items/approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The backend now filters, so no need for client-side filter
      setItems(res.data);
    } catch (err) {
      console.error('Fetch items error:', err);
      // Check for 401 Unauthorized and redirect
      const errorMessage = handleAuthError(err);
      setFetchError(errorMessage);
    } finally {
      if (isInitial) setFetchLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchItems(true);
    // Use an interval for reports sync (simulating real-time for item approval)
    const reportInterval = setInterval(() => fetchItems(false), 10000); // Refresh every 10 seconds for approved reports sync
    return () => clearInterval(reportInterval);
  }, [fetchItems]);

  const onChange = e => {
    if (e.target.name === 'selectedFile') {
      setFormData({ ...formData, selectedFile: e.target.files[0] });
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
        
        // 1. Naya "Box" (FormData) banayein
        const data = new FormData();
        
        // 2. Text data add karein
        data.append('title', formData.title);
        data.append('description', formData.description);
        
        // 3. Photo add karein (Sirf agar user ne select ki ho)
        if (formData.selectedFile) {
            data.append('image', formData.selectedFile); 
        }

        // 4. Server ko bhejien
        await axios.post('/api/items', data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                // 'Content-Type' likhne ki zaroorat nahi, browser khud sambhaal lega
            }
        });

        setSuccess('Item reported successfully! Waiting for admin approval.');
        setFormData({ title: '', description: '', selectedFile: null });
        
    } catch (err) {
        const errorMessage = handleAuthError(err);
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
};
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-12">
      {/* Navbar is now handled globally in App.js */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight mb-2">
            Student Dashboard
          </h1>
          <p className="text-lg text-blue-600">
            Report lost items or browse found valuables across campus.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Report Form - Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-28 bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl shadow-blue-500/5">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                  <Send size={24} />
                </div>
                <h2 className="text-2xl font-bold text-blue-700">Report Item</h2>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-medium"
                >
                  {success}
                </motion.div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2 ml-1">
                    Item Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    required
                    placeholder="e.g., Blue Backpack, Keys"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-blue-300 hover:shadow-md transition-all outline-none text-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2 ml-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={onChange}
                    required
                    placeholder="Describe where and when it was lost/found..."
                    rows="4"
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-blue-300 hover:shadow-md transition-all outline-none text-blue-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2 ml-1">
                    Upload Image (Optional)
                  </label>
                  <input
                    type="file"
                    name="selectedFile"
                    onChange={onChange}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-blue-300 hover:shadow-md transition-all outline-none text-blue-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Report Item</span>
                      <Send size={18} />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Items Grid */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Package className="text-blue-500" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-blue-700">Approved Reports</h2>
              </div>
              {/* Dynamic counter */}
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold border border-blue-200">
                {items.length} Approved Items
              </span>
            </div>

            <AnimatePresence mode="wait">
              {fetchLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 w-full"
                >
                  <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                  <p className="text-blue-500 font-medium">Loading approved items...</p>
                </motion.div>
              ) : items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl p-20 border border-blue-200 border-dashed text-center shadow-lg shadow-blue-500/5 w-full"
                >
                  <Search className="mx-auto text-blue-300 mb-4" size={48} />
                  <p className="text-blue-500 font-medium text-lg">No approved items listed yet.</p>
                </motion.div>
              ) : fetchError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 rounded-3xl p-12 border border-red-200 text-center shadow-lg w-full"
                >
                  <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
                  <p className="text-red-600 font-medium text-lg">{fetchError}</p>
                  <button
                    onClick={() => fetchItems(true)}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-6" // Change to 1 column to give ample space for comments
                >
                  {items.map(item => (
                    <ItemCard key={item._id} item={item} onCommentPosted={fetchItems}
                    setSelectedImg={setSelectedImg} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      {/* Full Screen Image Modal */}
{selectedImg && (
  <div 
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4"
    onClick={() => setSelectedImg(null)} // Kahin bhi click karne par band ho jaye
  >
    <button 
      className="absolute top-5 right-5 text-white text-4xl"
      onClick={() => setSelectedImg(null)}
    >
      &times;
    </button>
    
    <img 
      src={selectedImg} 
      alt="Full View" 
      // object-contain se image kategi nahi, poori nazar ayegi
      className="max-w-full max-h-full object-contain shadow-2xl" 
    />
  </div>
)}
    </div>
  );
};

export default StudentDashboard;
