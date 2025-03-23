import axios from 'axios';
import { getCookie } from './cookies';

// Base URL for API requests
const API_BASE_URL = 'http://127.0.0.1:5000';

// Create a preconfigured axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // For FormData, don't set Content-Type header (browser sets it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Still include the auth token if available
    const token = getCookie('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Auth errors - redirect to login
    if (error.response?.status === 401) {
      console.log('Authentication error - redirecting to login');
      
      // Only redirect if we're not already on login/signup
      if (!window.location.pathname.includes('/signup')) {
        window.location.href = '/signup';
      }
    }
    
    // Server errors - show user friendly message
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data || error.message);
      // You could dispatch to a central error handler/notification system here
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common request types
export const api = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // For form data (multipart/form-data)
  postFormData: (url, formData, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const loginUser = async (username, password) => {
  try {
    // Create form data (as your backend expects form data, not JSON)
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await apiClient.post('/auth/login', formData);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}; 

// Signup function that sends user details and handles the response
export const signupUser = async (userData, profilePicture) => {
  try {
    const formData = new FormData();
    
    // Add user data fields
    formData.append('username', userData.username);
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('email', userData.email);
    formData.append('gender', userData.gender);
    formData.append('password', userData.password);
    
    // Add profile picture if available
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }
    
    // Use custom config that doesn't set Content-Type for FormData
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, formData, {
      withCredentials: true,
      // Don't set Content-Type here - browser will set it with boundary
    });
    
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Logout function that invalidates the token
export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get all posts with pagination
export const getPosts = async (page = 1, perPage = 10) => {
  try {
    const response = await api.get(`${API_BASE_URL}/community/posts?page=${page}&per_page=${perPage}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (title, content) => {
  try {
    console.log(`Creating post with title: "${title}" and content: "${content}"`);
    
    if (!title || !content) {
      throw new Error("Title and content are required");
    }
    
    const response = await axios.post('/community/posts', {
      title,
      content
    });
    
    console.log("Create post response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    
    // Check if token is expired
    if (error.response && error.response.status === 401) {
      // Handle token refresh or redirect to login
      console.warn("Authentication error - token may be expired");
    }
    
    throw error;
  }
};


// Get comments for a specific post
export const getPostComments = async (postId) => {
  try {
    const response = await api.get(`/community/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error getting comments for post ${postId}:`, error);
    throw error;
  }
};

// Add a comment to a post
export const createComment = async (postId, content) => {
  try {
    console.log(`Creating comment for post ${postId}: "${content}"`);
    
    if (!postId) {
      throw new Error("Post ID is required");
    }
    
    if (!content) {
      throw new Error("Comment content is required");
    }
    
    const response = await apiClient.post(`/community/posts/${postId}/comments`, {
      content
    });
    
    console.log("Create comment response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error creating comment for post ${postId}:`, error);
    
    // Check if token is expired
    if (error.response && error.response.status === 401) {
      // Handle token refresh or redirect to login
      console.warn("Authentication error - token may be expired");
    }
    
    throw error;
  }
};

// Like a post
export const likePost = async (postId) => {
  try {
    const response = await api.post(`/community/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error liking post ${postId}:`, error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (postId) => {
  try {
    const response = await api.post(`/community/posts/${postId}/unlike`);
    return response.data;
  } catch (error) {
    console.error(`Error unliking post ${postId}:`, error);
    throw error;
  }
};

// Get users who liked a post
export const getPostLikes = async (postId) => {
  try {
    const response = await api.get(`/community/posts/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error(`Error getting likes for post ${postId}:`, error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/community/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/community/posts/${postId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};

export default apiClient;