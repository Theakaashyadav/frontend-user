let PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
let BACKUP  = "https://akash-1-4g8j.onrender.com/api";

let _API_BASE = PRIMARY;

// Check backend
async function isAlive(url) {
  try {
    const res = await fetch(url + "/health", { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkBackend() {
  const primaryAlive = await isAlive(PRIMARY);
  const backupAlive  = await isAlive(BACKUP);

  console.log(primaryAlive ? "✅ Primary backend active" : "❌ Primary backend down");
  console.log(backupAlive  ? "🟩 Backup backend active"   : "🟥 Backup backend down");

  if (primaryAlive) {
    _API_BASE = PRIMARY;
    console.log("🔵 Using PRIMARY:", _API_BASE);
  } else if (backupAlive) {
    _API_BASE = BACKUP;
    console.log("🔵 Using BACKUP:", _API_BASE);
  } else {
    console.error("🚨 BOTH BACKENDS ARE DOWN!");
  }

  return _API_BASE;
}

// ✅ Export API_BASE as a **getter object** so you can import it directly
export const API_BASE = {
  get value() {
    return _API_BASE;
  }
};
