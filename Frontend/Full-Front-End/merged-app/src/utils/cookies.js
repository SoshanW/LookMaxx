/**
 * Set a cookie with the given name and value
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 * @param {number|Date} options.expires - Expiration in days or Date object
 * @param {string} options.path - Cookie path
 * @param {string} options.domain - Cookie domain
 * @param {boolean} options.secure - Whether cookie should only be sent over HTTPS
 * @param {string} options.sameSite - SameSite attribute (strict, lax, none)
 */
export const setCookie = (name, value, options = {}) => {
  if (!document) return; // Guard against server-side rendering
  
  // Set default option values
  const { 
    expires,
    path = '/',
    domain = '',
    secure = window.location.protocol === 'https:',
    sameSite = 'Lax'
  } = options;
  
  let cookieString = `${name}=${encodeURIComponent(value)}`;
  
  // Add expiration date
  if (expires) {
    if (typeof expires === 'number') {
      // If expires is a number, interpret as days from now
      const d = new Date();
      d.setTime(d.getTime() + (expires * 24 * 60 * 60 * 1000));
      cookieString += `;expires=${d.toUTCString()}`;
    } else if (expires instanceof Date) {
      // If expires is a Date object, use it directly
      cookieString += `;expires=${expires.toUTCString()}`;
    }
  }
  
  // Add other cookie attributes
  if (path) cookieString += `;path=${path}`;
  if (domain) cookieString += `;domain=${domain}`;
  if (secure) cookieString += `;secure`;
  if (sameSite) cookieString += `;samesite=${sameSite}`;
  
  // Set the cookie
  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  if (!document) return null; // Guard against server-side rendering
  
  const nameWithEquals = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameWithEquals) === 0) {
      return decodeURIComponent(cookie.substring(nameWithEquals.length));
    }
  }
  
  return null;
};

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path
 * @param {string} domain - Cookie domain
 */
export const deleteCookie = (name, path = '/', domain = '') => {
  if (!document) return; // Guard against server-side rendering
  
  // Set expiration to a past date to delete the cookie
  setCookie(name, '', { 
    expires: new Date(0), 
    path, 
    domain
  });
};

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean} - Whether the cookie exists
 */
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};