// src/utils/analytics.js
export const trackView = async (sessionId, userId = null) => {
  try {
    const res = await fetch("http://localhost:4000/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userId }),
    });

    if (!res.ok) throw new Error("Failed to track view");
    return await res.json();
  } catch (err) {
    console.error("trackView error:", err);
  }
};
