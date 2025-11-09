// src/api.js

let API_BASE = "";

if (window.location.hostname.includes("devtunnels.ms")) {
  API_BASE = "https://r55nc746-5000.inc1.devtunnels.ms/api";
} else if (window.location.hostname.includes("localhost")) {
  API_BASE = "http://localhost:4000/api";
} else {
  // Production backend on Render
  API_BASE = "https://akash-pp66.onrender.com/api";  // ✅ add /api here
}

export { API_BASE };
