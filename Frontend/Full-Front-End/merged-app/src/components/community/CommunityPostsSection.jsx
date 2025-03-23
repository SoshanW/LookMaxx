import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthProvider'; 
import { api, getPosts, createPost, getPostComments, createComment, 
  likePost, unlikePost, deletePost, deleteComment } from '../../utils/apiClient'; 
import '../../styles/community/CommunityPostsSection.css';

const CommunityPostsSection = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  // State for managing posts, new post input, and temporary storage
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newCommentContents, setNewCommentContents] = useState({});
  const [commentsLoaded, setCommentsLoaded] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null,
    itemType: null,
    postId: null
  });

  // Sample user data from auth with local profile picture
  const currentUser = {
    id: 'user-1',
    name: 'Current User',
    avatar: '/assets/community//profile-pics/current-user.jpg' // Local image from public folder
  };

  // Load initial posts fetch from an API
  useEffect(() => {

    const loadPosts = async () => {
      try {
        setLoading(true);
        const result = await getPosts(currentPage);
        
        // Map backend data structure to component's expected structure
        const formattedPosts = result.posts.map(post => ({
          id: post._id,
          userId: post.author_id,
          username: post.author.username,
          userAvatar: post.author.avatar || '/assets/community/profile-pics/default.jpg',
          content: post.content,
          title: post.title,
          timestamp: post.created_on,
          likes: post.likes || [],
          comments: [], // load comments separately when needed
          commentsCount: post.comments?.length || 0,
        }));
        
        setPosts(formattedPosts);
        setTotalPages(result.pages);
        setError(null);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, isAuthenticated]);
    // Mock data with local profile pictures
  /*  const initialPosts = [
      {
        id: 'post-1',
        userId: 'user-2',
        username: 'Beauty Expert',
        userAvatar: '/assets/community//profile-pics/user2.jpg', 
        content: 'What are your thoughts on the Study section?',
        timestamp: new Date('2025-03-16T14:30:00').toISOString(),
        likes: ['user-3', 'user-4'],
        comments: [
          {
            id: 'comment-1',
            userId: 'user-3',
            username: 'Aesthetic Pro',
            userAvatar: '/assets/community//profile-pics/user3.jpg', 
            content: 'I think the Study section is really helpful!',
            timestamp: new Date('2025-03-16T15:15:00').toISOString()
          }
        ]
      },
      {
        id: 'post-2',
        userId: 'user-3',
        username: 'Aesthetic Pro',
        userAvatar: '/assets/community//profile-pics/user3.jpg', 
        content: 'I just dived into my FFR report. Im impressed!',
        timestamp: new Date('2025-03-16T10:45:00').toISOString(),
        likes: ['user-2'],
        comments: []
      }
    ];
    
    setPosts(initialPosts);
  }, []);
  */


  // Format timestamp to readable time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load comments for a post
  const loadComments = async (postId) => {
    // Skip if already loaded
    if (commentsLoaded[postId]) return;
    
    try {
      const response = await getPostComments(postId);
      
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            const formattedComments = response.comments.map(comment => ({
              id: comment._id,
              userId: comment.author_id,
              username: comment.author?.username || 'Unknown User',
              userAvatar: comment.author?.avatar || '/assets/community/profile-pics/default.jpg',
              content: comment.content,
              timestamp: comment.created_on
            }));
            
            return {
              ...post,
              comments: formattedComments,
              showComments: true
            };
          }
          return post;
        })
      );
      
      // Mark comments as loaded for this post
      setCommentsLoaded({
        ...commentsLoaded,
        [postId]: true
      });
      
    } catch (err) {
      console.error(`Error loading comments for post ${postId}:`, err);
    }
  };

  // Toggle comments visibility
  const toggleComments = (postId) => {
    // If comments aren't loaded yet, load them
    if (!commentsLoaded[postId]) {
      loadComments(postId);
    }
    
    // Toggle visibility
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            showComments: !post.showComments
          };
        }
        return post;
      })
    );
  };


  // Handle new post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPostContent.trim() || !newPostContent.trim() || !isAuthenticated) return;
    
    setIsSubmitting(true);
    try {
      const result = await createPost(newPostTitle, newPostContent);
      
      // Format the new post to match our expected structure
      const newPost = {
        id: result._id,
        userId: result.author_id,
        username: user.username || 'You',
        userAvatar: user.avatar || '/assets/community/profile-pics/default.jpg',
        title: result.title,
        content: result.content,
        timestamp: result.created_on,
        likes: [],
        comments: [],
        commentsCount: 0,
        showComments: false
      };
      
      // Add post to state at the beginning of the array
      setPosts(currentPosts => [newPost, ...currentPosts]);
      setNewPostTitle('');
      setNewPostContent('');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open deletion confirmation dialog
  const openDeleteConfirmation = (itemId, itemType, postId = null) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId,
      itemType,
      postId
    });
  };

  // Close deletion confirmation dialog
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null,
      itemType: null,
      postId: null
    });
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    // Only proceed if we have a valid post ID to delete
    if (deleteConfirmation.itemType === 'post' && deleteConfirmation.itemId) {
      try {
        await deletePost(deleteConfirmation.itemId);
        
        // Remove the post from state
        setPosts(currentPosts => 
          currentPosts.filter(post => post.id !== deleteConfirmation.itemId)
        );
        
      } catch (err) {
        console.error('Error deleting post:', err);
        setError('Failed to delete post. Please try again.');
      } finally {
        // Close the confirmation dialog
        closeDeleteConfirmation();
      }
    }
  };

  // Handle like/unlike toggle
  const handleToggleLike = async (postId, isLiked) => {
    try {
      // Optimistic update
      setPosts(currentPosts => currentPosts.map(post => {
        if (post.id === postId) {
          const newLikes = isLiked
            ? post.likes.filter(id => id !== user._id)
            : [...post.likes, user._id];
            
          return {
            ...post,
            likes: newLikes
          };
        }
        return post;
      }));
      
      // Call API to update server
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      
    } catch (err) {
      console.error(`Error ${isLiked ? 'unliking' : 'liking'} post:`, err);
      
      // Revert the optimistic update on error
      setPosts(currentPosts => currentPosts.map(post => {
        if (post.id === postId) {
          const newLikes = !isLiked
            ? post.likes.filter(id => id !== user._id)
            : [...post.likes, user._id];
            
          return {
            ...post,
            likes: newLikes
          };
        }
        return post;
      }));
    }
  };

  // Handle new comment submission
  const handleCommentSubmit = (postId) => {
    const commentContent = newCommentContents[postId]?.trim();
    
    if (!commentContent || !isAuthenticated) return;
    
    // Create new comment with isNew flag for highlighting
    const newComment = {
      id: result._id,
      userId: result.author_id,
      username: user.username || 'You',
      userAvatar: user.avatar || '/assets/community/profile-pics/default.jpg',
      content: result.content,
      timestamp: result.created_on,
      isNew: true // Flag to identify new comments for styling
    };
    
    // Add comment to the right post
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
    
    // Clear comment input for this post
    setNewCommentContents({
      ...newCommentContents,
      [postId]: ''
    });
    
    // Remove the isNew flag after a few seconds
    setTimeout(() => {
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment => {
              if (comment.id === newComment.id) {
                const { isNew, ...commentWithoutIsNew } = comment;
                return commentWithoutIsNew;
              }
              return comment;
            })
          };
        }
        return post;
      }));
    }, 2000); // Keep the highlight for 2 seconds
  };

  // Handle comment deletion
  const handleDeleteComment = async () => {
    // Only proceed if we have valid post and comment IDs
    if (deleteConfirmation.itemType === 'comment' && 
        deleteConfirmation.itemId && 
        deleteConfirmation.postId) {
          
          try {
            await deleteComment(deleteConfirmation.postId, deleteConfirmation.itemId);
            
            // Update the UI
            setPosts(currentPosts => currentPosts.map(post => {
              if (post.id === deleteConfirmation.postId) {
                const filteredComments = post.comments.filter(
                  comment => comment.id !== deleteConfirmation.itemId
                );
                
                return {
                  ...post,
                  comments: filteredComments,
                  commentsCount: post.commentsCount - 1
                };
              }
              return post;
            }));
            
          } catch (err) {
            console.error('Error deleting comment:', err);
            setError('Failed to delete comment. Please try again.');
          } finally {
            // Close the confirmation dialog
            closeDeleteConfirmation();
          }
        }
      };

  return (
    <section className="community-posts-section">
      <div className="section-header">
        <h2>Community Discussion</h2>
      </div>
      
      {/* New Post Form */}
      <div className="post-form-container">
        <div className="user-avatar">
          <img src={currentUser.avatar} alt={currentUser.name} />
        </div>
        <form className="post-form" onSubmit={handlePostSubmit}>
          <textarea
            placeholder="Say something..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            required
          />
          <div className="post-form-actions">
            <button 
              type="submit" 
              className="primary-button submit-post"
              disabled={isSubmitting || !newPostContent.trim()}
            >
              Post
            </button>
          </div>
        </form>
      </div>
      
      {/* Posts List */}
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No thoughts yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          posts.map(post => (
            <div className="post-card" key={post.id}>
              <div className="post-header">
                <div className="post-user">
                  <img src={post.userAvatar} alt={post.username} className="user-avatar-small" />
                  <div className="post-user-info">
                    <h4>{post.username}</h4>
                    <span className="post-timestamp">{formatTimestamp(post.timestamp)}</span>
                  </div>
                </div>
                {post.userId === currentUser.id && (
                  <button 
                    className="delete-button" 
                    onClick={() => openDeleteConfirmation(post.id, 'post')}
                    aria-label="Delete post"
                  >
                    <span className="delete-icon">×</span>
                  </button>
                )}
              </div>
              
              <div className="post-content">
                <p>{post.content}</p>
              </div>
              
              <div className="post-actions">
                <button 
                  className={`like-button ${post.likes.includes(currentUser.id) ? 'liked' : ''}`}
                  onClick={() => handleToggleLike(post.id)}
                >
                  {post.likes.includes(currentUser.id) ? '❤️' : '🤍'} 
                  <span>{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</span>
                </button>
                <button className="comment-button">
                  💬 <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
                </button>
              </div>
              
              {/* Comments Section */}
              <div className="comments-section">
                {post.comments.map(comment => (
                  <div 
                    className={`comment ${comment.isNew ? 'new-comment' : ''}`} 
                    key={comment.id}
                  >
                    <div className="comment-header">
                      <div className="comment-user">
                        <img src={comment.userAvatar} alt={comment.username} className="user-avatar-xsmall" />
                        <div className="comment-user-info">
                          <h5>{comment.username}</h5>
                          <span className="comment-timestamp">{formatTimestamp(comment.timestamp)}</span>
                        </div>
                      </div>
                      {comment.userId === currentUser.id && (
                        <button 
                          className="delete-button small" 
                          onClick={() => openDeleteConfirmation(comment.id, 'comment', post.id)}
                          aria-label="Delete comment"
                        >
                          <span className="delete-icon">×</span>
                        </button>
                      )}
                    </div>
                    <div className="comment-content">
                      <p>{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                {/* New Comment Form */}
                <div className="comment-form-container">
                  <div className="user-avatar-xsmall">
                    <img src={currentUser.avatar} alt={currentUser.name} />
                  </div>
                  <div className="comment-form">
                    <textarea
                      placeholder="Any comments?"
                      value={newCommentContents[post.id] || ''}
                      onChange={(e) => setNewCommentContents({
                        ...newCommentContents,
                        [post.id]: e.target.value
                      })}
                    />
                    <button 
                      className="comment-submit"
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={!newCommentContents[post.id]?.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this {deleteConfirmation.itemType}? </p>
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={closeDeleteConfirmation}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-button" 
                onClick={deleteConfirmation.itemType === 'post' ? handleDeletePost : handleDeleteComment}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CommunityPostsSection;