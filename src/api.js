let PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
let BACKUP  = "https://akash-1-4g8j.onrender.com/api";

// runtime-switchable value
let API_BASE = PRIMARY;

/** Always returns the current API base URL */
export function getApiBase() {
  return API_BASE;
}

/** Switches backend if primary is down and logs both statuses */
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

  // Check both backends
  const primaryAlive = await check(PRIMARY + "/health");
  const backupAlive  = await check(BACKUP + "/health");

  // Log status for both
  console.log(primaryAlive ? "✅ Primary backend active" : "❌ Primary backend down");
  console.log(backupAlive  ? "🟩 Backup backend active"   : "🟥 Backup backend down");

  // Decide which backend to use
  if (primaryAlive) {
    API_BASE = PRIMARY;
    console.log("🔵 Using PRIMARY:", API_BASE);
  } else if (backupAlive) {
    API_BASE = BACKUP;
    console.log("🔵 Using BACKUP:", API_BASE);
  } else {
    console.error("🚨 BOTH BACKENDS ARE DOWN!");
  }

  return API_BASE;
}
