let API_BASE = "";

// Local frontend (localhost)
if (window.location.hostname.includes("localhost")) {
  API_BASE = "https://laughing-happiness-5g76j69rqq44f7g6p-4000.app.github.dev/api";
} else {
  // Production frontend (Render)
  API_BASE = "https://laughing-happiness-5g76j69rqq44f7g6p-4000.app.github.dev/api";
}

export { API_BASE };
