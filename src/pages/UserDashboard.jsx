import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GlobalToaster, showSuccess, showError, showInfo } from "../utils/toaster"
import "./style/UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const toastShown = useRef(false); // ✅ Prevent double toast

  useEffect(() => {
    if (!toastShown.current && location.state?.toastMessage) {
      const type = location.state.toastType || "success";
      const message = location.state.toastMessage;

      if (type === "success") showSuccess(message);
      else if (type === "error") showError(message);
      else showInfo(message);

      toastShown.current = true;

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  const cards = [
    { title: "📋 My Properties", description: "View and manage all your listed properties.", link: "/user" },
    { title: "➕ Post New Property", description: "List a new property for sale or rent.", link: "/Admin" },
    { title: "⭐ MyLeads", description: "View and manage all your leads.", link: "/MyLeads" },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">User Dashboard</h1>

      <div className="dashboard-grid">
        {cards.map((card, index) => (
          <div key={index} className="dashboard-card" onClick={() => navigate(card.link)}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </div>
        ))}
      </div>

      <GlobalToaster />
    </div>
  );
}
