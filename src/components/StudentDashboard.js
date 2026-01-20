// ... baaki saara upar ka code (imports aur Comment component) bilkul sahi hai ...

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
    
    const renderComments = (commentList) => {
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

                    {/* Status Badge */}
                    <div className="absolute top-6 right-6 flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
                        <CheckCircle size={12} />
                        <span>Verified</span>
                    </div>

                    <div className="p-3 bg-blue-50 w-fit rounded-2xl mb-4 text-blue-500 mt-4">
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
                        {item.createdBy?.email ? item.createdBy.email.split('@')[0] : 'Anonymous'}
                    </div>
                </div>
            </div>

            {/* Comment Section */}
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
                    {renderComments(comments)}
                </div>
            </div>
        </motion.div>
    );
};

// ... baaki StudentDashboard component bilkul sahi hai ...