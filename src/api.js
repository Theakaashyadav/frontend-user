let PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
let BACKUP  = "https://akash-1-4g8j.onrender.com/api";

let API_BASE = PRIMARY; // default

/**
 * Checks if backend is alive.
 * Returns: true = alive, false = dead.
 */
export async function checkBackend() {
  try {
    const res = await fetch(PRIMARY + "/health", { method: "GET" });

    if (res.ok) {
      API_BASE = PRIMARY;
      console.log("✅ Primary backend active");
      return PRIMARY;
    } else {
      throw new Error("Primary unhealthy");
    }
  } catch (e) {
    console.warn("❌ Primary backend down. Switching to BACKUP...");
    API_BASE = BACKUP;
    return BACKUP;
  }
}

export { API_BASE };
