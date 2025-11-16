let API_BASE = "";

// Local frontend talking to EC2 backend
if (window.location.hostname.includes("localhost")) {
  API_BASE = "http://52.66.236.122:4000/api";
} else {
  // Production frontend on Render talking to EC2 backend
  API_BASE = "http://52.66.236.122:4000/api";
}

export { API_BASE };
