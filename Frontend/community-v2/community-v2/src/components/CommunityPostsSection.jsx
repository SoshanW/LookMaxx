import React, { useState, useEffect } from 'react';
import '../styles/CommunityPostsSection.css';

const CommunityPostsSection = () => {
  // State for managing posts, new post input, and temporary storage
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContents, setNewCommentContents] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample user data from auth
  const currentUser = {
    id: 'user-1',
    name: 'Current User',
    avatar: '/assets/user-avatar.jpeg'
  };

  // Load initial posts fetch from an API
  useEffect(() => {
    // Mock data
    const initialPosts = [
      {
        id: 'post-1',
        userId: 'user-2',
        username: 'Beauty Expert',
        userAvatar: 'https://via.placeholder.com/40',
        content: 'What are your thoughts on the Study section?',
        timestamp: new Date('2025-03-16T14:30:00').toISOString(),
        likes: ['user-3', 'user-4'],
        comments: [
          {
            id: 'comment-1',
            userId: 'user-3',
            username: 'Aesthetic Pro',
            userAvatar: 'https://via.placeholder.com/40',
            content: 'I think the Study section is really helpful!',
            timestamp: new Date('2025-03-16T15:15:00').toISOString()
          }
        ]
      },
      {
        id: 'post-2',
        userId: 'user-3',
        username: 'Aesthetic Pro',
        userAvatar: 'https://via.placeholder.com/40',
        content: 'I just dived into my FFR report. Im impressed!',
        timestamp: new Date('2025-03-16T10:45:00').toISOString(),
        likes: ['user-2'],
        comments: []
      }
    ];
    
    setPosts(initialPosts);
  }, []);

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
  const handlePostSubmit = (e) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) return;
    
    setIsSubmitting(true);
    
    // Create new post
    const newPost = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.name,
      userAvatar: currentUser.avatar,
      content: newPostContent.trim(),
      timestamp: new Date().toISOString(),
      likes: [],
      comments: []
    };
    
    // Add post to state
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsSubmitting(false);
  };

  // Handle post deletion
  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  // Handle like/unlike
  const handleToggleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const userLiked = post.likes.includes(currentUser.id);
        return {
          ...post,
          likes: userLiked 
            ? post.likes.filter(id => id !== currentUser.id) 
            : [...post.likes, currentUser.id]
        };
      }
      return post;
    }));
  };

  // Handle new comment submission
  const handleCommentSubmit = (postId) => {
    const commentContent = newCommentContents[postId]?.trim();
    
    if (!commentContent) return;
    
    // Create new comment
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentContent,
      timestamp: new Date().toISOString()
    };
    
    // Add comment to post
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
    
    // Clear comment input
    setNewCommentContents({
      ...newCommentContents,
      [postId]: ''
    });
  };

  // Handle comment deletion
  const handleDeleteComment = (postId, commentId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId)
        };
      }
      return post;
    }));
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
                    onClick={() => handleDeletePost(post.id)}
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
                  <div className="comment" key={comment.id}>
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
                          onClick={() => handleDeleteComment(post.id, comment.id)}
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
    </section>
  );
};

export default CommunityPostsSection;