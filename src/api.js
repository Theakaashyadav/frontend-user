let API_BASE = "";

// Local frontend
if (window.location.hostname.includes("localhost")) {
  API_BASE = "https://akash-1-4g8j.onrender.com/api";
}

// Render frontend → use Render backend
else if (window.location.hostname.includes("onrender.com")) {
  API_BASE = "https://akash-1-4g8j.onrender.com/api";
}

// Netlify frontend → use Netlify backend
else if (window.location.hostname.includes("netlify.app")) {
  API_BASE = "https://comforting-moxie-42840b.netlify.app/api";
}

// Fallback
else {
  API_BASE = "https://akash-1-4g8j.onrender.com/api";
}

export { API_BASE };
