import React, { useState, useEffect } from "react";
import { FaDownload, FaCheckCircle, FaStar } from "react-icons/fa";

export default function DownloadPropertyApp({ setProfileOpen }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) {
      setLoading(true);
      const link = document.createElement("a");
      link.href =
        "https://github.com/Theakaashyadav/mapp/blob/main/Gn%20App.apk?raw=true";
      link.download = "PropertyApp.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
      setProfileOpen(false);
      return;
    }

    setLoading(true);
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
      setLoading(false);
      setProfileOpen(false);
    });
  };

  const features = [
    "Search properties nearby with ease",
    "Advanced filters by price, type, and location",
    "View high-quality property photos",
    "Save unlimited properties to favorites",
    "Instantly contact property owners or agents",
    "Owners can manage and access leads efficiently",
  ];

  const palette = {
    primary: "#0D1B2A",
    accent: "#F4D35E",
    light: "#E0E0E0",
    text: "#1B1D3A",
    subtext: "#555555",
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#F8F9FA",
        paddingBottom: "50px",
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          background: palette.primary,
          color: palette.accent,
          textAlign: "center",
          padding: "60px 20px",
          borderRadius: "0 0 50% 50% / 20%",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          marginBottom: "60px",
        }}
      >
        <h1 style={{ fontSize: "38px", fontWeight: "700",   color: palette.light, marginBottom: "15px" }}>
          Find Your Dream Property
        </h1>
        <p
          style={{
            fontSize: "18px",
            maxWidth: "600px",
            margin: "auto",
            lineHeight: "1.6",
            color: palette.subtext,
          }}
        >
          Explore apartments, houses, and lands near you. Browse photos, prices, and contact sellers instantly. Download our app for the ultimate property search experience.
        </p>
        <button
          onClick={handleInstallClick}
          disabled={loading}
          style={{
            marginTop: "30px",
            padding: "16px 40px",
            fontSize: "18px",
            fontWeight: "600",
            color: palette.primary,
            background: palette.accent,
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px) scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0) scale(1)")}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              Downloading...
              <span className="loader" />
            </span>
          ) : (
            <>
              <FaDownload /> Download App
            </>
          )}
        </button>
      </section>

      {/* Features Section */}
      <section style={{ maxWidth: "900px", margin: "auto", marginBottom: "60px" }}>
        <h2
          style={{
            color: palette.text,
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "28px",
          }}
        >
          App Features
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px",
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: "#fff",
                color: palette.subtext,
                padding: "20px",
                borderRadius: "14px",
                border: `1px solid ${palette.light}`,
                display: "flex",
                alignItems: "center",
                gap: "15px",
                fontSize: "16px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <FaCheckCircle style={{ color: palette.accent }} size={24} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ratings Section */}
      <section style={{ textAlign: "center", marginBottom: "60px" }}>
        <h3 style={{ color: palette.text, fontSize: "24px", marginBottom: "15px" }}>
          User Ratings
        </h3>
        <div style={{ fontSize: "24px", color: palette.accent, marginBottom: "10px" }}>
          <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
        </div>
        <p style={{ color: palette.subtext, fontSize: "16px" }}>
          Rated 5/5 by 500+ property seekers
        </p>
      </section>

      {/* Screenshots Section */}
      <section style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "25px" }}>
        {["Home+Listings", "Property+Details", "Contact+Seller"].map((text, idx) => (
          <img
            key={idx}
            src={`https://via.placeholder.com/200x400?text=${text}`}
            alt={text}
            style={{
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ))}
      </section>

      <style>{`
        .loader {
          border: 3px solid ${palette.primary};
          border-top: 3px solid rgba(13,27,42,0.3);
          border-radius: 50%;
          width: 18px;
          height: 18px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}
