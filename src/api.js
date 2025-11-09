// src/api.js

let API_BASE = "";

if (window.location.hostname.includes("devtunnels.ms")) {
  API_BASE = "https://r55nc746-5000.inc1.devtunnels.ms/api";
} else {
  API_BASE = "http://localhost:4000/api";
}

export { API_BASE };

