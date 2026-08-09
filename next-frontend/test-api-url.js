require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const getDynamicApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return `http://${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("Resolved API_URL:", getDynamicApiUrl());
