// api.js

let PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
let BACKUP  = "https://akash-1-4g8j.onrender.com/api";

let API_BASE = PRIMARY; // default

async function isAlive(url) {
  try {
    const res = await fetch(url + "/health", { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Check both backends & update API_BASE
 */
export async function checkBackend() {
  const primaryAlive = await isAlive(PRIMARY);
  const backupAlive  = await isAlive(BACKUP);

  // Log status for both (requested)
  console.log(primaryAlive ? "✅ Primary backend active" : "❌ Primary backend down");
  console.log(backupAlive  ? "🟩 Backup backend active"   : "🟥 Backup backend down");

  if (primaryAlive) {
    API_BASE = PRIMARY;
  } else if (backupAlive) {
    API_BASE = BACKUP;
  } else {
    console.error("🚨 BOTH BACKENDS ARE DOWN!");
  }

  return API_BASE;
}

export function getApiBase() {
  return API_BASE;
}
