let API_BASE = "";

// Local frontend
if (window.location.hostname.includes("localhost")) {
  API_BASE = "https://52.66.236.122:4000/api";
} else {
  // Production frontend on Render
  API_BASE = "https://52.66.236.122:4000/api";
}

export { API_BASE };
