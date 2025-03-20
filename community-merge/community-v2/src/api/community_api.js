const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to handle common fetch options
const fetchWithAuth = async (url, options = {}) => {
  // Get the JWT token from localStorage
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network response was not ok');
  }
  
  return response.json();
};

// Get all posts with pagination
export const getPosts = async (page = 1, perPage = 10) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts?page=${page}&per_page=${perPage}`);
};

// Create a new post
export const createPost = async (postData) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts`, {
    method: 'POST',
    body: JSON.stringify(postData)
  });
};

// Get comments for a specific post
export const getPostComments = async (postId) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts/${postId}/comments`);
};

// Add a comment to a post
export const createComment = async (postId, commentData) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData)
  });
};

// Like a post
export const likePost = async (postId) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts/${postId}/like`, {
    method: 'POST'
  });
};

// Unlike a post
export const unlikePost = async (postId) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts/${postId}/unlike`, {
    method: 'POST'
  });
};

// Get users who liked a post
export const getPostLikes = async (postId) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts/${postId}/likes`);
};

// Delete a post
export const deletePost = async (postId) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts/${postId}`, {
    method: 'DELETE'
  });
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  return fetchWithAuth(`${API_BASE_URL}/community/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE'
  });
};

// Get user profile data
export const getUserProfile = async () => {
  return fetchWithAuth(`${API_BASE_URL}/community/users/profile`);
};

// Test community data
export const getCommunityData = async () => {
  return fetchWithAuth(`${API_BASE_URL}/community/data`);
};

// Home endpoint (mostly for testing connectivity)
export const getHomeMessage = async () => {
  return fetchWithAuth(`${API_BASE_URL}/community`);
};