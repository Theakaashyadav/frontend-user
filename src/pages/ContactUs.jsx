import React, { useState } from "react";
import { Send, X, AlertTriangle, Mail, Phone, MessageSquare } from "lucide-react";
import { API_BASE } from "../api";

export default function SupportContactPage() {
  const [form, setForm] = useState({ name: "", email: "", issueType: "", description: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const issueOptions = [
    "Login or authentication issue",
    "Payment or billing issue",
    "App crash or bug",
    "Feature not working",
    "Feedback or suggestion",
    "Other issue",
  ];

  async function trackEvent(eventType) {
      try {
        const res = await fetch(`${API_BASE}/analytics/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventType }),
        });
    
        if (!res.ok) {
          const data = await res.json();
          console.error(`Tracking ${eventType} failed`, data);
        }
      } catch (err) {
        console.error(`trackEvent(${eventType}) error:`, err);
      }
    }
    
    // Convenience wrappersq
   const trackhelp = () => trackEvent("help");

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = "Please enter a valid email.";
    if (!form.issueType) e.issueType = "Please select an issue type.";
    if (!form.description.trim() || form.description.length < 10)
      e.description = "Please describe the issue in detail (min 10 chars).";
    return e;
  }

  const handleChange = (k) => (ev) => setForm((s) => ({ ...s, [k]: ev.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 1000)); // simulate API call
      setSent(true);
      trackhelp();
      setForm({ name: "", email: "", issueType: "", description: "" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "70vh",
        background: "#f8f9fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #4f46e5, #9333ea)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "24px 32px",
          }}
        >
          <AlertTriangle size={30} />
          <div>
            <h1 style={{ fontSize: "1.6rem", margin: 0, fontWeight: 600 }}>Report an Issue</h1>
            <p style={{ fontSize: "0.95rem", opacity: 0.9, margin: "4px 0 0" }}>
              Facing problems while using the app? Let us help you fix it quickly.
            </p>
          </div>
        </div>

        {/* Form */}
        <div
          style={{
            padding: "40px 50px",
            transition: "all 0.3s ease",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Name + Email */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="John Doe"
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    fontSize: "0.9rem",
                  }}
                />
                {errors.name && (
                  <p style={{ fontSize: "0.8rem", color: "#e11d48", marginTop: "4px" }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    fontSize: "0.9rem",
                  }}
                />
                {errors.email && (
                  <p style={{ fontSize: "0.8rem", color: "#e11d48", marginTop: "4px" }}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Issue Type */}
            <div style={{ marginTop: "22px", display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "6px" }}>
                Issue Type
              </label>
              <select
                value={form.issueType}
                onChange={handleChange("issueType")}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  fontSize: "0.9rem",
                  background: "#fff",
                }}
              >
                <option value="">Select issue type...</option>
                {issueOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.issueType && (
                <p style={{ fontSize: "0.8rem", color: "#e11d48", marginTop: "4px" }}>
                  {errors.issueType}
                </p>
              )}
            </div>

            {/* Description */}
            <div style={{ marginTop: "22px", display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "6px" }}>
                Issue Description
              </label>
              <textarea
                rows={6}
                value={form.description}
                onChange={handleChange("description")}
                placeholder="Describe the issue in detail..."
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  fontSize: "0.9rem",
                }}
              />
              {errors.description && (
                <p style={{ fontSize: "0.8rem", color: "#e11d48", marginTop: "4px" }}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "26px",
              }}
            >
              <button
                type="submit"
                disabled={sending}
                style={{
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  padding: "12px 22px",
                  fontSize: "1rem",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background 0.3s",
                  opacity: sending ? 0.7 : 1,
                }}
              >
                <Send size={18} />
                {sending ? "Sending..." : "Submit Issue"}
              </button>

              {sent && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ecfdf5",
                    color: "#065f46",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    marginLeft: "auto",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Submitted
                  <button
                    onClick={() => setSent(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#065f46",
                      cursor: "pointer",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Support Info */}
<div
  style={{
    marginTop: "36px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
    color: "#555",
    fontSize: "0.95rem",
  }}
>
  {[
    {
      Icon: Phone,
      text: (
        <>
          For urgent issues:&nbsp;
          <a
            href="tel:+919149210313"
            style={{ color: "#4f46e5", textDecoration: "none" }}
          >
            +91 9149210313
          </a>
        </>
      ),
    },
    {
      Icon: Mail,
      text: (
        <>
          Support Email:&nbsp;
          <a
            href="mailto:theakaashyadav@gmail.com"
            style={{ color: "#4f46e5", textDecoration: "none" }}
          >
            theakaashyadav@gmail.com
          </a>
        </>
      ),
    },
    {
      Icon: MessageSquare,
      text: <>Response time: usually within 24 hours.</>,
    },
  ].map(({ Icon, text }, i) => (
    <p
      key={i}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        margin: "6px 0",
      }}
    >
      <Icon
        size={window.innerWidth < 480 ? 14 : window.innerWidth < 768 ? 16 : 18}
        style={{ flexShrink: 0 }}
      />
      {text}
    </p>
  ))}
</div>

        </div>
      </div>
    </div>
  );
}
