// API Configuration checker
export const checkApiConnection = async () => {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
  
  console.log('=== API Configuration Check ===');
  console.log('API_BASE from env:', import.meta.env.VITE_API_BASE);
  console.log('API_BASE used:', API_BASE);
  console.log('Current window location:', window.location.href);
  
  try {
    console.log('Testing connection to:', `${API_BASE}/health`);
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is reachable:', data);
      return true;
    } else {
      console.error('❌ Backend returned error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot reach backend:', error.message);
    console.error('Error details:', error);
    return false;
  }
};
