import React, { useState, useEffect } from 'react';
import { api, getPosts, createPost, getPostComments, createComment, 
         likePost, unlikePost, deletePost, deleteComment } from '../../utils/apiClient'; 
import '../../styles/community/CommunityPostsSection.css';
import { getCookie } from '../../utils/cookies';
import useAuth from '../../hooks/useAuth';

const CommunityPostsSection = () => {
  const { isLoggedIn, userName } = useAuth();
  // State for managing posts, new post input, and temporary storage
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContents, setNewCommentContents] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null,
    itemType: null,
    postId: null
  });

    // Get the current user's ID from the JWT token
    const getCurrentUserId = () => {
      try {
        const token = getCookie('access_token');
        if (!token) return null;
        
        // Parse the JWT token
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        // Decode the payload (middle part)
        const payload = JSON.parse(atob(parts[1]));
        
        // In Flask-JWT-Extended, the user ID is stored in the 'sub' claim
        return payload.sub || null;
      } catch (error) {
        console.error('Error extracting user ID from JWT:', error);
        return null;
      }
    };
  
    // Get current user data
    const getUserData = () => {
      try {
        const userData = getCookie('user_data');
        if (userData) {
          return JSON.parse(userData);
        }
        return null;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    };

  // Load initial posts fetch from an API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getPosts(page, 10);
        
        setPosts(response.posts || []);
        setTotalPages(response.pages || 1);
        setError(null);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [page]);
  /*  // Mock data with local profile pictures
    const initialPosts = [
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
  }, []);*/


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

  // Handle new post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) return;
    
    setIsSubmitting(true);
    
    // Create new post with user info
    try {
      const newPost = await createPost(newPostTitle.trim(), newPostContent.trim());
      
      // Add the new post to the beginning of the list
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // Clear the form
      setNewPostTitle('');
      setNewPostContent('');
      setError(null);
      
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
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
        
        // Remove the post from the UI
        setPosts(posts.filter(post => post._id !== deleteConfirmation.itemId));
        
        closeDeleteConfirmation();
      } catch (err) {
        console.error("Error deleting post:", err);
        setError("Failed to delete post. Please try again.");
        closeDeleteConfirmation();
      }
    }
  };

  // Handle like/unlike toggle
  const handleToggleLike = async (postId) => {
    if (!isLoggedIn) {
      setError("Please log in to like posts.");
      return;
    }
    
    try {
      const post = posts.find(p => p._id === postId);
      const currentUserId = getCurrentUserId();
      const userAlreadyLiked = post.likes && post.likes.includes(currentUserId);
      
      if (userAlreadyLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      
      // Refresh the post data
      const updatedPosts = await getPosts(page, 10);
      setPosts(updatedPosts.posts || []);
      
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Handle new comment submission
  const handleCommentSubmit = async (postId) => {
    if (!isLoggedIn) {
      setError("Please log in to comment.");
      return;
    }
    
    const commentContent = newCommentContents[postId]?.trim();
    
    if (!commentContent) return;
    
    try {
      await createComment(postId, commentContent);
      
      // Refresh the comments for this post
      const commentsResponse = await getPostComments(postId);
      
      // Update the post with new comments
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: commentsResponse.comments || []
          };
        }
        return post;
      }));
      
      // Clear comment input for this post
      setNewCommentContents({
        ...newCommentContents,
        [postId]: ''
      });
      
    } catch (err) {
      console.error("Error creating comment:", err);
      setError("Failed to post comment. Please try again.");
    }
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
        setPosts(posts.map(post => {
          if (post._id === deleteConfirmation.postId) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment._id !== deleteConfirmation.itemId)
            };
          }
          return post;
        }));
          
        closeDeleteConfirmation();
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError("Failed to delete comment. Please try again.");
        closeDeleteConfirmation();
      }
    }
  };

    // Check if a post is liked by the current user
  const isPostLikedByUser = (post) => {
    const userId = getCurrentUserId();
    return post.likes && userId && post.likes.includes(userId);
  };

  // Check if current user is the author of a post/comment
  const isCurrentUserAuthor = (authorId) => {
    const userId = getCurrentUserId();
    return userId && authorId === userId;
  };

  // Get user avatar (placeholder if not available)
  const getUserAvatar = (user) => {
    if (user && user.profile_picture) {
      return user.profile_picture;
    }
    return '/assets/community/profile-pics/default-user.jpg';
  };

  
  return (
    <section className="community-posts-section">
      <div className="section-header">
        <h2>Community Discussion</h2>
      </div>
      
      {/* Error message if any */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      {/* New Post Form - only show if logged in */}
      {isLoggedIn ? (
        <div className="post-form-container">
          <div className="user-avatar">
            <img src={getUserAvatar(getUserData())} alt={userName} />
          </div>
          <form className="post-form" onSubmit={handlePostSubmit}>
            <input
              type="text"
              placeholder="Post title..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              required
              className="post-title-input"
            />
            <textarea
              placeholder="What's on your mind..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              required
            />
            <div className="post-form-actions">
              <button 
                type="submit" 
                className="primary-button submit-post"
                disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="login-prompt">
          <p>Please <a href="/signup">log in</a> to join the discussion.</p>
        </div>
      )}
      
      {/* Posts List */}
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No thoughts yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          posts.map(post => (
            <div className="post-card" key={post._id}>
              <div className="post-header">
                <div className="post-user">
                <img 
                    src={getUserAvatar(post.author)} 
                    alt={post.author?.username || 'User'} 
                    className="user-avatar-small" 
                  />
                  <div className="post-user-info">
                    <h4>{post.author?.username || 'Unknown User'}</h4>
                    <span className="post-timestamp">{formatTimestamp(post.created_on)}</span>
                  </div>
                </div>
                {isCurrentUserAuthor(post.author_id) && (
                  <button 
                    className="delete-button" 
                    onClick={() => openDeleteConfirmation(post._id, 'post')}
                    aria-label="Delete post"
                  >
                    <span className="delete-icon">×</span>
                  </button>
                )}
              </div>
              
              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <p>{post.content}</p>
              </div>
              
              <div className="post-actions">
                <button 
                  className={`like-button ${isPostLikedByUser(post) ? 'liked' : ''}`}
                  onClick={() => handleToggleLike(post.id)}
                >
                  {isPostLikedByUser(post) ? '❤️' : '🤍'} 
                  <span>{post.likes?.length || 0 } {post.likes?.length === 1 ? 'like' : 'likes'}</span>
                </button>
                <button className="comment-button">
                  💬 <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
                </button>
              </div>
              
              {/* Comments Section */}
              <div className="comments-section">
                {post.comments && post.comments.map(comment => (
                  <div 
                    className={`comment ${comment.isNew ? 'new-comment' : ''}`} 
                    key={comment._id}
                  >
                    <div className="comment-header">
                      <div className="comment-user">
                      <img 
                          src={getUserAvatar(comment.author)} 
                          alt={comment.author?.username || 'User'} 
                          className="user-avatar-xsmall" 
                        />
                        <div className="comment-user-info">
                          <h5>{comment.author?.username || 'Unknown User'}</h5>
                          <span className="comment-timestamp">{formatTimestamp(comment.created_on)}</span>
                        </div>
                      </div>
                      {isCurrentUserAuthor(comment.author_id) && (
                        <button 
                          className="delete-button small" 
                          onClick={() => openDeleteConfirmation(comment._id, 'comment', post._id)}
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
                
                {/* New Comment Form - only show if logged in */}
                {isLoggedIn ? (
                  <div className="comment-form-container">
                    <div className="user-avatar-xsmall">
                      <img src={getUserAvatar(getUserData())} alt={userName} />
                    </div>
                    <div className="comment-form">
                      <textarea
                        placeholder="Add a comment..."
                        value={newCommentContents[post._id] || ''}
                        onChange={(e) => setNewCommentContents({
                          ...newCommentContents,
                          [post._id]: e.target.value
                        })}
                      />
                      <button 
                        className="comment-submit"
                        onClick={() => handleCommentSubmit(post._id)}
                        disabled={!newCommentContents[post._id]?.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="comment-login-prompt">
                    <a href="/signup">Log in</a> to leave a comment
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="page-indicator">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      
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