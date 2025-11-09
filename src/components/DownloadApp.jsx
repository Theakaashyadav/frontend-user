import React, { useState, useEffect } from "react";

export default function DownloadAppButton({ setProfileOpen }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // show install prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome); // accepted / dismissed
      setDeferredPrompt(null);
    });
    setProfileOpen(false);
  };

  return (
    <button
      onClick={handleInstallClick}
      className="dropdown-menu-link"
      style={{ textDecoration: "none", color: "#1b1d3a", background: "none", border: "none", cursor: "pointer" }}
    >
      Download App
    </button>
  );
}
