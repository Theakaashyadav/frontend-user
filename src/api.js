let API_BASE = "";

// Local frontend (localhost)
if (window.location.hostname.includes("localhost")) {
  API_BASE = "https://akash-1-4g8j.onrender.com/api";
} else {
  // Production frontend (Render)
  API_BASE = "https://akash-1-4g8j.onrender.com/api";
}

export { API_BASE };
