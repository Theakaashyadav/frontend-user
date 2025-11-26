let API_BASE = "";

// Local frontend (localhost)
if (window.location.hostname.includes("localhost")) {
  API_BASE = "https://r55nc746-4000.inc1.devtunnels.ms/api";
} else {
  // Production frontend (Render)
  API_BASE = "https://r55nc746-4000.inc1.devtunnels.ms/api";
}

export { API_BASE };
