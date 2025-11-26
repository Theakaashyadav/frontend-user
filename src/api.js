let PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
let BACKUP  = "https://akash-1-4g8j.onrender.com/api";

// THIS VALUE WILL ALWAYS BE UP-TO-DATE
let API_BASE = PRIMARY;

/**
 * Force update API_BASE and always return the current one
 */
export function getApiBase() {
  return API_BASE;
}

/**
 * Checks backend status safely.
 * - Tries `/health` route
 * - If failed, tries `/` as fallback
 * - If both fail → switches to BACKUP
 */
export async function checkBackend() {
  async function tryCheck(url) {
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

  // 1️⃣ Try PRIMARY /health
  let primaryAlive = await tryCheck(PRIMARY + "/health");

  // 2️⃣ If not working, try root
  if (!primaryAlive) {
    primaryAlive = await tryCheck(PRIMARY);
  }

  // 3️⃣ Final decision
  if (primaryAlive) {
    API_BASE = PRIMARY;
    console.log("✅ Primary backend active:", API_BASE);
    return API_BASE;
  } else {
    API_BASE = BACKUP;
    console.warn("❌ Primary backend DOWN — switched to BACKUP:", API_BASE);
    return API_BASE;
  }
}

export { API_BASE };
