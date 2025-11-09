let API_BASE = "";

if (window.location.hostname.includes("localhost")) {
  // Local frontend talking to Render backend
  API_BASE = "https://akash-itf3.onrender.com/api";
} else {
  // Production frontend on Render
  API_BASE = "https://akash-itf3.onrender.com/api";
}

export { API_BASE };
