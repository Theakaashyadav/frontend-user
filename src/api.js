const PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
const BACKUP = "https://akash-1-4g8j.onrender.com/api";

let ACTIVE_API = PRIMARY;

// Try calling a URL and return response or throw error
async function tryFetch(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error("API error: " + res.status);
  return res;
}

/**
 * Auto-failover fetch
 * 1. Try primary API
 * 2. If fails → automatically switch to backup
 */
export async function apiFetch(path, options = {}) {
  try {
    // Try PRIMARY server
    return await tryFetch(ACTIVE_API + path, options);
  } catch (e) {
    console.warn("Primary API down → switching to BACKUP");

    // Switch to backup
    ACTIVE_API = BACKUP;

    // Try BACKUP server
    try {
      return await tryFetch(ACTIVE_API + path, options);
    } catch (e2) {
      console.error("Backup API also failed!", e2);
      throw e2;
    }
  }
}

export function getApiBase() {
  return ACTIVE_API;
}

