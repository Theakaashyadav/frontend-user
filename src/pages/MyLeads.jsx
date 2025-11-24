import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../api";
import "./style/Admin.css";
import { GlobalToaster, showSuccess, showError, showInfo } from "../utils/toaster"


export default function MyLeads() {
  const { token, user, login, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [numLeads, setNumLeads] = useState(10);
  const [userCredits, setUserCredits] = useState(0);
  const [showCreditModal, setShowCreditModal] = useState(false);
  // Lead options and default selected option
  const leadOptions = [
    { value: 50, label: "0-50 Leads - 20 credits/lead", costPerLead: 20 },
    { value: 100, label: "0-100 Leads - 15 credits/lead", costPerLead: 15 },
    { value: 200, label: "0-200 Leads - 10 credits/lead", costPerLead: 10 },
    { value: 500, label: "500+ Leads - 5 credits/lead", costPerLead: 5 },
  ];

  const [selectedOption, setSelectedOption] = useState(leadOptions[0]);
  // Add this inside MyLeads component, above the return
  const calculateCredits = (numLeads) => {
    if (!numLeads) return 0;

    // Find the correct option based on the number of leads
    let option = leadOptions[0]; // default to first
    for (let i = 0; i < leadOptions.length; i++) {
      if (numLeads <= leadOptions[i].value) {
        option = leadOptions[i];
        break;
      }
      // If leads exceed the largest option, use the last option
      if (i === leadOptions.length - 1) {
        option = leadOptions[i];
      }
    }

    return numLeads * option.costPerLead;
  };






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
     const tracklead = () => trackEvent("lead");


  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/leads/all?ownerId=${encodeURIComponent(user.userId)}`);
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();

      // ✅ Sort newest first
      const sortedLeads = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setLeads(sortedLeads);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);


  // Fetch requests
  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setRequestLoading(true);
    try {
      const res = await fetch(`${API_BASE}/lead-access/requests?ownerId=${encodeURIComponent(user.userId)}`);
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setRequestLoading(false);
    }
  }, [user]);

  // ✅ Delete a request
  const deleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      const res = await fetch(`${API_BASE}/lead-access/requests/${requestId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete request");

      showSuccess("Request deleted successfully!");
      fetchRequests(); // ✅ Refresh the list
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to delete request");
    }
  };


  useEffect(() => {
    if (user?.userId) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/users/${user.userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) throw new showError("Failed to fetch user info");
          const data = await res.json();

          // ✅ Access credits correctly
          setUserCredits(data?.user?.credits ?? 0);
        } catch (err) {
          console.error("Error fetching user credits:", err);
          setUserCredits(0);
        }
      })();
    }
  }, [user?.userId]);

  useEffect(() => {
    if (user) {
      fetchLeads();
      fetchRequests();
    }
  }, [user, fetchLeads, fetchRequests]);



  const handleRequest = async () => {
    if (!user) return;

    const totalCost = calculateCredits(numLeads);

    if (userCredits < totalCost) {
      // Show info toast
      showInfo(`Insufficient credits. You need ${totalCost} credits but have ${userCredits}.`);

      // Show modal for buying credits
      setShowCreditModal(true);

      return; // stop further processing
    }


    try {
      // Check existing requests
      const resReq = await fetch(`${API_BASE}/lead-access/requests?ownerId=${encodeURIComponent(user.userId)}`);
      const existingRequests = await resReq.json();

      if (existingRequests.length > 0) {
        showInfo("You already have an active request. Wait until it expires.");
        return;
      }

      // Send only ownerId and numLeads
      const res = await fetch(`${API_BASE}/lead-access/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ownerId: user.userId,
          numLeads,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess("Request submitted successfully!");
        setUserCredits(prev => prev - totalCost);
        tracklead();
        fetchLeads();
        fetchRequests();
      } else {
        showError(data.message || "Request failed");
      }
    } catch (err) {
      console.error(err);
      showError("Server error");
    }
  };





  if (!user) return <div>Loading user...</div>;
  return (
    <div
      className="container"
      style={{
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <style>{`
      .leads-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .leads-table th, .leads-table td {
        padding: 12px;
        text-align: left;
      }
      .leads-table thead {
        background: #1b1d3a;
        color: #fff;
      }
      .even-row { background: #f9f9f9; }
      .odd-row { background: #ffffff; }
      .visible-phone { color: #1b1d3a; font-weight: 600; }
      .hidden-phone { color: #aaa; font-style: italic; }
      .requests-table th, .requests-table td { padding: 12px; }
      .valid-request { background: #e0f7e9; }
      .expired-request { background: #fbeaea; }
      .refresh-btn {
  width: auto; /* override global 100% */
  padding: 8px 20px;
  background-color: #1b1d3a;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

      .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .refresh-btn:hover:not(:disabled) { background-color: #333659; }
      .request-card {
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        background: #fff;
        margin: 30px 0;
        text-align: center;
      }
      .submit-btn {
        background-color: #1b1d3a;
        color: #fff;
        padding: 10px 25px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 15px;
        font-weight: 600;
        transition: all 0.2s;
      }
      .submit-btn:hover { background-color: #333659; }
      .message { margin-top: 12px; color: green; font-weight: 500; }
      .step-card {
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        background: #fff;
        margin: 30px auto;
        text-align: center;
        max-width: 350px;
      }
      .qr-img {
        width: 300px;
        height: 300px;
        object-fit: contain;
        margin: 15px auto;
        display: block;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .btn-dark {
        display: inline-block;
        background-color: #1b1d3a;
        color: #fff;
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        margin-top: 10px;
        font-weight: 600;
        transition: background 0.2s;
      }
      .btn-dark:hover { background-color: #333659; }
      .verification-text {
        line-height: 1.6;
        font-size: 0.95rem;
        color: #333;
      }
      .payment-logos {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 1rem;
      }
      .pay-logo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      .pay-logo:hover {
        transform: scale(1.1);
      }
      .empty-state-card {
        text-align: center;
        background: #fff;
        border-radius: 12px;
        padding: 40px 20px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        margin: 40px auto;
        max-width: 500px;
      }
      @media (max-width: 768px) {
        .empty-state-card {
          padding: 25px 15px;
        }
        .qr-img {
          width: 200px;
          height: 200px;
        }
      }
    `}</style>

      {/* ✅ Show user credits */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "98%",
          marginBottom: "50px",
        }}
      >
        <span
          style={{
            background: "#1b1d3a",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "0.95rem",
          }}
        >
          💰 Available Credits: {userCredits}
        </span>
      </div>

      {/* Leads Section */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: "12px"
      }}>
        <h1 style={{ marginBottom: "24px", color: "#1b1d3a" }}>All Leads</h1>
        <button
  className="refresh-btn"
  style={{ width: "auto" }}
  onClick={() => { fetchLeads(); fetchRequests(); }}
  disabled={loading}
>
  🔄 {loading ? "Refreshing..." : "Refresh"}
</button>

      </div>

      {loading ? (
        <p>Loading leads...</p>
      ) : leads.length === 0 ? (
        <div className="empty-state-card">
          <i
            className="fas fa-users-slash"
            style={{
              fontSize: "48px",
              color: "#1b1d3a",
              marginBottom: "15px",
            }}
          ></i>
          <h3 style={{ color: "#1b1d3a", marginBottom: "8px" }}>No Leads Found</h3>
          <p style={{ color: "#666", marginBottom: "16px", fontSize: "0.95rem" }}>
            You don’t have any leads yet. Either you haven’t requested, or no users have interacted with your properties. Leads will appear here once available.
          </p>
          <button
            className="submit-btn"
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
          >
            Request Leads
          </button>
        </div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Date</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr
                key={lead._id}
                className={index % 2 === 0 ? "even-row" : "odd-row"}
              >
                <td>{index + 1}</td>
                <td>{lead.name}</td>
                <td>{new Date(lead.createdAt).toLocaleString()}</td>
                <td
                  className={lead.phone ? "visible-phone" : "hidden-phone"}
                >
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} style={{ textDecoration: "none" }}>
                      <button
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#1b1d3a",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 600,
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#333659")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#1b1d3a")
                        }
                      >
                        📞 {lead.phone}
                      </button>
                    </a>
                  ) : (
                    "Hidden"
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  fontStyle: "italic",
                  color: "#555",
                  padding: "12px",
                }}
              >
                Only <strong>{leads.length}</strong> {leads.length === 1 ? "lead is" : "leads are"} available
              </td>
            </tr>

          </tbody>

        </table>

      )}
     


      {/* Request Form */}
      <div className="request-card">
        {/* <h1>Step 1</h1>
  <h2>Request Leads</h2>
  <p><strong>User:</strong> {user.phone}</p> */}

        {/* Lead Rate Chart - always visible */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
            Leads Rate Chart:
          </label>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            marginTop: "8px"
          }}>
            <thead>
              <tr style={{ background: "#1b1d3a", color: "#fff" }}>
                <th style={{ padding: "8px" }}>Leads</th>
                <th style={{ padding: "8px" }}>Credits per Lead</th>
              </tr>
            </thead>
            <tbody>
              {leadOptions.map(opt => (
                <tr key={opt.value} style={{ background: "#f9f9f9" }}>
                  <td style={{ padding: "8px" }}>{opt.label.split(" - ")[0]}</td>
                  <td style={{ padding: "8px" }}>{opt.costPerLead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* User enters the number of leads they want */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="num-leads" style={{ fontWeight: 600 }}>Enter Number of Leads:</label>
          <input
            id="num-leads"
            type="number"
            min="1"
            value={numLeads}
            onChange={(e) => setNumLeads(parseInt(e.target.value))}
            placeholder="e.g. 50"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "8px",
            }}
          />
        </div>

        {/* Display estimated credits needed */}
        <p>
          Estimated Credits Needed: <strong>{calculateCredits(numLeads)}</strong>
        </p>
        <p>
          Available Credits: <strong>{userCredits}</strong>
        </p>

        <button className="submit-btn" onClick={handleRequest}>
          Generate Request
        </button>
        {message && <p className="message">{message}</p>}
      </div>

       <div style={{ marginTop: "40px", marginBottom: "30px" }}> <h2 style={{ marginBottom: "12px", color: "#1b1d3a" }}>
        Your Lead Access Requests </h2> {requestLoading ? (<p>Loading requests...</p>) : requests.length === 0 ? (<p style={{ color: "#6b7280", textAlign: "center" }}>
          No lead access requests found. </p>) : (<div style={{ width: "100%", overflowX: "auto" }}> <table className="leads-table requests-table" style={{ width: "100%", borderCollapse: "collapse" }}> <thead> <tr style={{ background: "#f3f4f6", color: "#1b1d3a" }}> <th style={{ padding: "10px" }}>#</th> <th style={{ padding: "10px" }}>Phone</th> <th style={{ padding: "10px" }}>Count</th> <th style={{ padding: "10px" }}>Status</th> <th style={{ padding: "10px" }}>Action</th> </tr> </thead> <tbody> {requests.map((req, index) => (<tr key={req._id} style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", }} > <td style={{ padding: "10px" }}>{index + 1}</td> <td style={{ padding: "10px" }}>{user.phone}</td> <td style={{ padding: "10px" }}>{req.numLeads}</td> <td style={{ padding: "10px" }}> <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "12px", backgroundColor: "#16a34a", color: "#fff", fontWeight: "600", fontSize: "0.85rem", }} > Processed </span> </td> <td style={{ padding: "10px" }}> <button onClick={() => deleteRequest(req._id)} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", transition: "background 0.2s ease", }} onMouseOver={(e) => (e.currentTarget.style.background = "#b91c1c")} onMouseOut={(e) => (e.currentTarget.style.background = "#dc2626")} > Delete </button> </td> </tr>))} </tbody> </table> </div>)} </div>


      <GlobalToaster />

      {/* 💰 Attractive & Fully Responsive Modal for Insufficient Credits */}
      {showCreditModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "5vw",
          }}
        >
          <div
            className="credit-modal-content"
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "clamp(1rem, 4vw, 2rem)",
              width: "100%",
              maxWidth: "420px",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              animation: "popIn 0.3s ease",
              transition: "all 0.3s ease",
            }}
          >
            <i
              className="fas fa-wallet"
              style={{
                fontSize: "clamp(36px, 7vw, 48px)",
                color: "#1b1d3a",
                marginBottom: "12px",
              }}
            ></i>

            <h3
              style={{
                marginBottom: "8px",
                color: "#1b1d3a",
                fontSize: "clamp(1.1rem, 4vw, 1.4rem)",
              }}
            >
              Not Enough Credits
            </h3>

            <p
              style={{
                color: "#555",
                marginBottom: "25px",
                fontSize: "clamp(0.9rem, 3.5vw, 1rem)",
                lineHeight: 1.5,
              }}
            >
              You don’t have enough credits to complete this checkout.
              <br />
              Would you like to buy more credits now?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setShowCreditModal(false)}
                style={{
                  background: "#e0e0e0",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#333",
                  flex: 1,
                  minWidth: "120px",
                  transition: "0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#d0d0d0")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#e0e0e0")}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowCreditModal(false);
                  navigate("/buy-credits");
                }}
                style={{
                  background: "#1b1d3a",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  flex: 1,
                  minWidth: "120px",
                  transition: "0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#282c5e")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#1b1d3a")}
              >
                Buy Credits
              </button>
            </div>
          </div>

          {/* ✨ Animations & Media Queries */}
          <style>
            {`
        @keyframes popIn {
          from {
            transform: scale(0.85);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 600px) {
          .credit-modal-content {
            max-width: 90%;
            padding: 20px 16px;
            border-radius: 14px;
          }

          .credit-modal-content button {
            font-size: 0.9rem;
            padding: 10px 14px;
          }
        }
      `}
          </style>
        </div>
      )}

    </div>
  );

}

