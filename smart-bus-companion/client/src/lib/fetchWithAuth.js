export const fetchWithAuth = async (url, options = {}) => {
  options.credentials = 'include'; // Ensure cookies are sent
  
  let response = await fetch(url, options);

  if (response.status === 401) {
    // Attempt silent refresh
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (refreshResponse.ok) {
        // Retry original request
        response = await fetch(url, options);
      } else {
        // Refresh failed, user needs to login
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Silent refresh failed:', err);
      window.location.href = '/login';
    }
  }

  return response;
};
