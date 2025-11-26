let PRIMARY = "https://r55nc746-4000.inc1.devtunnels.ms/api";
let BACKUP  = "https://akash-1-4g8j.onrender.com/api";

let API_BASE = PRIMARY;

/** Always returns CURRENT API BASE (live variable) */
export function getApiBase() {
  return API_BASE;
}

export async function checkBackend() {
  async function check(url) {
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  }

  // test /health OR fallback test /
  let alive = await check(PRIMARY + "/health");
  if (!alive) alive = await check(PRIMARY);

  if (alive) {
    API_BASE = PRIMARY;
    console.log("✅ Primary active:", API_BASE);
  } else {
    API_BASE = BACKUP;
    console.warn("❌ Primary DOWN → switched to BACKUP:", API_BASE);
  }

  return API_BASE;
}
