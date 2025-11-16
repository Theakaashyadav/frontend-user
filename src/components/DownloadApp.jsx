import React from "react";

export default function DownloadAppButton({ setProfileOpen }) {

  const handleDownloadClick = () => {
    // Create a temporary <a> element to trigger download
    const link = document.createElement("a");
    link.href = "https://github.com/Theakaashyadav/mapp/raw/main/Gn%20App.apk"; // direct link to APK
    link.download = "GnApp.apk"; // suggested filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setProfileOpen(false); // close profile dropdown if needed
  };

  return (
    <button
      onClick={handleDownloadClick}
      className="dropdown-menu-link"
      style={{ textDecoration: "none", color: "#1b1d3a", background: "none", border: "none", cursor: "pointer" }}
    >
      Download App
    </button>
  );
}
