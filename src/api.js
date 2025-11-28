// src/api.js

let API_BASE = "";

if (window.location.hostname.includes("devtunnels.ms")) {
  API_BASE = "https://akash-1-4g8j.onrender.com/api";
} else if (window.location.hostname.includes("localhost")) {
  API_BASE = "https://akash-1-4g8j.onrender.com/api";
} else {
  // Production backend on Render
  API_BASE = "https://akash-1-4g8j.onrender.com/api";
}

export { API_BASE };


