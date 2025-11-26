// api.js

let PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
let BACKUP  = "https://akash-1-4g8j.onrender.com/api";

let _API_BASE = PRIMARY; // internal variable

async function isAlive(url) {
  try {
    const res = await fetch(url + "/health", { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Check both backends & update _API_BASE
 */
export async function checkBackend() {
  const primaryAlive = await isAlive(PRIMARY);
  const backupAlive  = await isAlive(BACKUP);

  console.log(primaryAlive ? "✅ Primary backend active" : "❌ Primary backend down");
  console.log(backupAlive  ? "🟩 Backup backend active"   : "🟥 Backup backend down");

  if (primaryAlive) {
    _API_BASE = PRIMARY;
  } else if (backupAlive) {
    _API_BASE = BACKUP;
  } else {
    console.error("🚨 BOTH BACKENDS ARE DOWN!");
  }

  return _API_BASE;
}

// ✅ Export API_BASE as a getter so imports always get the latest value
export const API_BASE = {
  get value() {
    return _API_BASE;
  }
};
