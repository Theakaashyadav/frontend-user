import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../api";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import "./Navbar.css";
import { GlobalToaster, showSuccess, showError, showInfo } from "../utils/toaster"



export default function Navbar() {
  const [showPopup, setShowPopup] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const postRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isBrowser, setIsBrowser] = useState(false); // ✅ declare state


  const onHome = location?.pathname === "/";
  const onAuth = location?.pathname.toLowerCase() === "/auth";


 useEffect(() => {
  const ua = navigator.userAgent || "";
  const isAndroidWebView =
    /wv|Android.*AppleWebKit/.test(ua) && !/Chrome\/[.0-9]* Mobile/.test(ua);

  const isIosWebView =
    /iPhone|iPad|iPod/.test(ua) &&
    !/Safari/.test(ua);

  if (!isAndroidWebView && !isIosWebView) {
    setIsBrowser(true);
  }
}, []);

  // Tooltip show-once per session
  useEffect(() => {
    if (onHome) {
      const shown = sessionStorage.getItem("propertyTooltipShown");
      if (!shown) {
        setTimeout(() => setShowPopup(true), 800);
        sessionStorage.setItem("propertyTooltipShown", "true");
      }
    } else {
      setShowPopup(false);
    }
  }, [onHome]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    try {
      await fetch(`${API_BASE}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      logout?.();
      navigate("/", {
        state: {
          toastType: "success",
          toastMessage: "logged out",
        },
      });
    }
  };


  return (
    <nav>
       <div
  className="logo"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
  {onHome ? (
    <Link
  to="/"
  style={{
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "#a8a9b6ff",
    fontWeight: "700",
    fontSize: "clamp(0.9rem, 2vw, 1.5rem)", // responsive font size
    transition: "transform 0.2s ease",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
>
  Gn App
</Link>

  ) : (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go Back"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #1b1d3a, #444b8a)",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
      }}
    >
      <FaArrowLeft style={{ fontSize: "1.3rem" }} />
    </button>
  )}
</div>




      {/* ✅ Right Section — Post Property + Profile */}
      <div className="right-section">
        {/* Post Property Button */}
        <div className="post-property-wrapper" ref={postRef}>
          <Link to="/UserDashboard" className="post-property-btn">
            Post Property <span className="free-label">FREE</span>
          </Link>

          {onHome && showPopup && (
            <div className="property-tooltip fade-in">
              <p>
                🎉 Now you can post your property{" "}
                <strong>absolutely free!</strong>
              </p>
              <button
                type="button"
                className="tooltip-close-btn"
                onClick={() => setShowPopup(false)}
              >
                Got it
              </button>
              <span className="tooltip-arrow" />
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="profile-menu" ref={dropdownRef}>
          <FaUserCircle
            className="profile-icon"
            onClick={() => setProfileOpen((prev) => !prev)}
          />
          {profileOpen && (
            <div className="dropdown-menu">
              <Link to="/auth" onClick={() => setProfileOpen(false)}>
                Login/SignUp
              </Link>
              {/* <Link to="/home1" onClick={() => setProfileOpen(false)}>
                Home
              </Link> */}

              {/* <Link to="/userDashboard" onClick={() => setProfileOpen(false)}>
                User Dashboard
              </Link> */}

              <Link to="/Cart" onClick={() => setProfileOpen(false)}>
                Your Cart
              </Link>
              <Link to="/UserOrders" onClick={() => setProfileOpen(false)}>
                Your Orders
              </Link>
              <Link to="/buy-credits" onClick={() => setProfileOpen(false)}>
                Buy Credits
              </Link>
              {isBrowser && (
              <Link to="/DownloadApp" onClick={() => setProfileOpen(false)}>
                Download App
              </Link>
            )}

              <Link to="/ContactUs" onClick={() => setProfileOpen(false)}>
                Contact Us
              </Link>
              <a href="#logout" onClick={handleLogout}>
                Logout
              </a>
            </div>
          )}
        </div>

      </div>
      <GlobalToaster />
    </nav>
  );
}
