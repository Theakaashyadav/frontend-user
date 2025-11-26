let PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
let BACKUP  = "https://akash-1-4g8j.onrender.com/api";

// runtime-switchable value
let API_BASE = PRIMARY;

/** Always returns the current API base URL */
export function getApiBase() {
  return API_BASE;
}

/** Switches backend if primary is down */
export async function checkBackend() {
  async function check(url) {
    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Try primary /health
  let alive = await check(PRIMARY + "/health");

  // Try primary /
  if (!alive) alive = await check(PRIMARY);

  // Decide
  if (alive) {
    API_BASE = PRIMARY;
    console.log("✅ Primary backend active:", API_BASE);
  } else {
    API_BASE = BACKUP;
    console.warn("❌ Primary DOWN → switched to BACKUP:", API_BASE);
  }

  return API_BASE;
}

// ❌ Remove this line → DO NOT EXPORT API_BASE DIRECTLY
// export { API_BASE };
