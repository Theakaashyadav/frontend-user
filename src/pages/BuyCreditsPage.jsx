import React, { useState, useEffect, useContext, useRef } from "react";
import { API_BASE } from "../api";
import { AuthContext } from "../context/AuthContext";
import paytm from "../images/paytm.webp";
import phonepe from "../images/phonepay.webp";
import gpay from "../images/gpay.jpeg";
import icon from "../images/wsaapicon.png";
import qr249 from "../images/249.webp";
import qr499 from "../images/499.webp";
import qr999 from "../images/999.webp";
import QRCode from "qrcode";

import { GlobalToaster, showSuccess, showError, showInfo } from "../utils/toaster"

const BuyCreditsPage = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [credits, setCredits] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const formRef = useRef(null);
  const paymentRef = useRef(null);
  const requestsRef = useRef(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  // ✅ Inside your component
const [selectedPackage, setSelectedPackage] = useState(null);


  const [paymentReference, setPaymentReference] = useState("");



  useEffect(() => {
    const token = localStorage.getItem("sessionToken") || "";
    setSessionToken(token);
  }, []);

  useEffect(() => {
  console.log("AndroidDownloader:", window?.AndroidDownloader);
}, []);


  // Auto-generate QR when package or amount changes
useEffect(() => {
  if (selectedPackage) {
    const selectedPkg = packages.find((pkg) => pkg.amount === selectedPackage);
    const amount = selectedPkg ? selectedPkg.price : 0;
    const upiUrl = `upi://pay?pa=theakaashyadav@ptyes&pn=Akash%20Yadav&am=${amount}&cu=INR&tn=Credit%20Purchase`;

    QRCode.toDataURL(upiUrl)
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR generation failed:", err));
  } else {
    setQrCodeUrl("");
  }
}, [selectedPackage]);

  const fetchRequests = async (uid) => {
    if (!uid) return;
    try {
      const res = await fetch(`${API_BASE}/credits/user/${uid}`);
      const data = await res.json();
      if (data?.success) setRequests(data.requests || []);
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
    }
  };

  const packages = [
    { amount: 250, price: 249, bonus: 0 },
    { amount: 600, price: 499, bonus: 20, recommended: true },
    { amount: 1250, price: 999, bonus: 50 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.userId && !user?._id) {
      showError("User not logged in");
      return;
    }

    // ✅ Prevent new request if one is still pending
const hasPending = requests.some(req => req.status === "pending");
if (hasPending) {
  showInfo("⏳ Please wait until your last request is verified.");
  return;
}


    if (!credits || isNaN(credits) || Number(credits) < 250) {
      showInfo("Please enter at least 250 credits");
      return;
    }

    if (!paymentReference || paymentReference.trim() === "") {
      showInfo("Please enter the payment reference number");
      return;
    }

    // Find selected package for bonus calculation
    const selectedPkg = packages.find(pkg => Number(pkg.amount) === Number(credits));
    let totalCredits = Number(credits);

    if (selectedPkg) {
      totalCredits = selectedPkg.amount;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/credits/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": sessionToken,
          "x-user-id": user?.userId || user?._id,
        },
        body: JSON.stringify({
          userId: user?.userId || user?._id,
          Credits: totalCredits,        // send total including bonus
          paymentReference: paymentReference.trim(), // ✅ new field
        }),
      });

      const data = await res.json();
      if (data?.success) {
        showSuccess(`✅ Payment submitted successfully`);
        setCredits("");
        setPaymentReference("");
        await fetchRequests(user?.userId || user?._id);
        requestsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        showError(data?.message || "Failed to submit request");
      }
    } catch (err) {
      console.error("❌ Error submitting request:", err);
      showError("Server error");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!authLoading && (user?.userId || user?._id)) {
      fetchRequests(user?.userId || user?._id);
    }
  }, [authLoading, user]);

  const styles = {
    // 🌄 Page Layout
    page: {
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #ebf8ff, #f3f4f6)",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
    },

    // 🏷️ Headings
    header: {
      textAlign: "center",
      fontSize: "2rem",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "1.5rem",
    },
    subHeader: {
      textAlign: "center",
      color: "#4b5563",
      maxWidth: "42rem",
      marginBottom: "2rem",
      fontSize: "1rem",
    },

    // 💎 Packages Grid
    packageGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
      width: "100%",
      maxWidth: "64rem",
    },
    packageCard: {
      background: "#fff",
      borderRadius: "1rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    packageCardHover: {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
    },
    packageTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "0.5rem",
    },
    packageBonus: {
      color: "#6b7280",
      marginBottom: "1rem",
    },
    packagePrice: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#2563eb",
      marginBottom: "1.5rem",
    },
   selectButton: {
  width: "100%",
  padding: "0.75rem",
  borderRadius: "0.5rem",
  fontWeight: "600",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  border: "none",
  transition: "all 0.3s ease",
},

    selectButtonHover: {
      background: "#1d4ed8",
    },

    // 📝 Form Card
    formCard: {
      background: "#fff",
      borderRadius: "1rem",
      boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
      padding: "2rem",
      marginBottom: "2rem",
      width: "100%",
      maxWidth: "28rem",
    },
    formTitle: {
      fontSize: "1.75rem",
      fontWeight: "700",
      textAlign: "center",
      color: "#1f2937",
      marginBottom: "1.5rem",
    },
    input: {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #d1d5db",
      fontSize: "1rem",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    inputFocus: {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 2px rgba(59,130,246,0.3)",
    },
    submitButton: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      fontWeight: "600",
      background: "#2563eb",
      color: "#fff",
      cursor: "pointer",
      border: "none",
      transition: "background 0.3s ease",
    },
    submitButtonDisabled: {
      background: "#60a5fa",
      cursor: "not-allowed",
    },
    message: {
      textAlign: "center",
      color: "#16a34a",
      marginTop: "1rem",
      fontWeight: "600",
      wordBreak: "break-word",
    },



    // 🌟 Features Grid
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1.5rem",
      width: "100%",
      maxWidth: "64rem",
      marginTop: "2.5rem",
    },
    featureCard: {
      background: "#fff",
      padding: "1.5rem",
      borderRadius: "1rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    featureCardHover: {
      transform: "translateY(-3px)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
    },
    featureIcon: {
      fontSize: "2rem",
      marginBottom: "0.75rem",
    },

    // 🪶 Empty State
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      color: "#6b7280",
    },
    emptyImg: {
      width: "5rem",
      opacity: 0.7,
      marginBottom: "1rem",
    },
    emptyTitle: {
      fontSize: "1.125rem",
      fontWeight: "600",
      marginBottom: "0.5rem",
      textAlign: "center",
    },
    emptyText: {
      fontSize: "0.95rem",
      textAlign: "center",
      color: "#6b7280",
    },

    // 📱 Responsive Media Queries
    "@media (max-width: 768px)": {
      header: { fontSize: "1.6rem" },
      subHeader: { fontSize: "0.95rem", padding: "0 1rem" },
      packageGrid: { gap: "1rem" },
      packageCard: { padding: "1.2rem" },
      packageTitle: { fontSize: "1.1rem" },
      packagePrice: { fontSize: "1.25rem" },
      formCard: { padding: "1.5rem" },
      formTitle: { fontSize: "1.5rem" },
    },

    "@media (max-width: 480px)": {
      header: { fontSize: "1.4rem" },
      subHeader: { fontSize: "0.9rem" },
      packageCard: { padding: "1rem" },
      selectButton: { fontSize: "0.9rem", padding: "0.6rem" },
      formCard: { padding: "1rem" },
      formTitle: { fontSize: "1.25rem" },
      input: { fontSize: "0.9rem" },
      featureCard: { padding: "1rem" },
      requestCredits: { fontSize: "0.9rem" },
      requestStatus: { fontSize: "0.85rem" },
    },


  };


  return (
    <div style={styles.page}>

      <h1 style={styles.header}>💳 Buy Credits & Boost Your Account</h1>
      <p style={styles.subHeader}>
        Choose your preferred credit package and request your credits instantly. Track your requests and their status below.
      </p>

      <div style={styles.packageGrid}>
        {[
          { amount: 250, price: "₹249", bonus: "5% Extra" },
          { amount: 600, price: "₹499", bonus: "20% Extra", recommended: true },
          { amount: 1250, price: "₹999", bonus: "50% Extra" },
        ].map((pkg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.packageCard,
              border: pkg.recommended ? "2px solid #2563eb" : "none",
              boxShadow: pkg.recommended
                ? "0 8px 24px rgba(37,99,235,0.3)"
                : styles.packageCard.boxShadow,
              transform: pkg.recommended ? "scale(1.05)" : "scale(1)",
              position: "relative",
            }}
          >
            {pkg.recommended && (
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "#2563eb",
                  color: "#fff",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                }}
              >
                Best Value
              </span>
            )}
            <h3 style={styles.packageTitle}>{pkg.amount} Credits</h3>
            <p style={styles.packageBonus}>{pkg.bonus}</p>
            <p style={styles.packagePrice}>{pkg.price}</p>
            <button
  onClick={() => {
    setCredits(pkg.amount); // set credits
    setSelectedPackage(pkg.amount); // mark this package as selected
    paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); // scroll to form
  }}
  style={{
    ...styles.selectButton,
    background:
      selectedPackage === pkg.amount ? "#1b1d3a" : "#2563eb", // color change when selected
    color: "#fff",
    transition: "all 0.3s ease",
  }}
>
  {selectedPackage === pkg.amount ? "Selected" : "Select"}
</button>


          </div>
        ))}
      </div>







      {/* ✅ Payment Method Section - Fully Responsive */}
      <div
        ref={paymentRef} style={styles.formCard}
      >
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "1rem",
            textAlign: "left",
          }}
        >
          💳 Choose Payment Method
        </h3>

       {/* QR Dropdown → converted to radio button */}
<div style={{ marginBottom: "1.5rem" }}>
  <label
    style={{
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: 600,
      color: "#374151",
    }}
  >
    QR Payments
  </label>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      background: "#f9fafb",
      border: "1px solid #d1d5db",
      borderRadius: "0.75rem",
      padding: "0.75rem 1rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}
    onClick={() => setPaymentMethod("upi_qr")}
  >
    <input
      type="radio"
      name="paymentMethod"
      value="upi_qr"
      checked={paymentMethod === "upi_qr"}
      onChange={(e) => setPaymentMethod(e.target.value)}
      style={{
        width: "18px",
        height: "18px",
        cursor: "pointer",
        accentColor: "#1b1d3a",
      }}
    />
    <span
      style={{
        fontSize: "1rem",
        color: "#1b1d3a",
        fontWeight: "500",
      }}
    >
      UPI QR Code
    </span>
  </div>

 {/* ✅ Responsive QR image */}
{paymentMethod === "upi_qr" && (
  <div
    style={{
      marginTop: "1.5rem",
      textAlign: "center",
      width: "100%",
      padding: "1rem",
    }}
  >
    {qrCodeUrl ? (
      <>
        <img
          src={qrCodeUrl}
          alt="UPI QR Code"
          style={{
            width: "100%",
            maxWidth: "260px",
            height: "auto",
            borderRadius: "16px",
            objectFit: "contain",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          }}
        />

        {/* ✅ Download QR Button */}
        <button
       onClick={() => {
  if (window?.AndroidDownloader?.downloadFile) {
    // Android WebView: Use native downloader
    try {
      window.AndroidDownloader.downloadFile(qrCodeUrl);
    } catch (err) {
      console.error("Android download failed:", err);
    }
  } else if (qrCodeUrl) {
    // Browser fallback: create a temporary link to download
    const filename = `UPI_QR_${selectedPackage || "payment"}.png`;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = filename;
    // Append, click, and remove the link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error("QR code URL is not defined");
  }
}}


          style={{
            marginTop: "1rem",
            background: "#1b1d3a",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "10px 18px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
            maxWidth: "200px",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#2b2e5c")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#1b1d3a")}
        >
          ⬇️ Download QR
        </button>
      </>
    ) : (
      <p style={{ color: "#6b7280" }}>Select a package to generate QR</p>
    )}

    <p
      style={{
        fontSize: "0.95rem",
        color: "#4b5563",
        marginTop: "0.75rem",
        lineHeight: "1.5",
      }}
    >
      Scan QR with your UPI app (
      {selectedPackage || "Select a package"} credits)
    </p>
  </div>
)}


</div>


        {/* UPI Apps */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.75rem",
              fontWeight: 600,
              color: "#374151",
              textAlign: "center",
              fontSize: "1.05rem",
            }}
          >
            UPI Apps
          </label>

          {/* ✅ UPI Apps Section (Dynamic from CreditRequest) */}
          {/* ✅ UPI Apps Section (Uses selected credits directly) */}
          <div

            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: "1rem",
            }}
          >
            {[
              {
                src: paytm,
                name: "paytm",
                fallback: "https://paytm.com/",
                package: "net.one97.paytm",
                scheme: "paytmmp",
              },
              {
                src: gpay,
                name: "gpay",
                fallback: "https://pay.google.com/",
                package: "com.google.android.apps.nbu.paisa.user",
                scheme: "upi",
              },
              {
                src: phonepe,
                name: "phonepe",
                fallback: "https://www.phonepe.com/",
                package: "com.phonepe.app",
                scheme: "upi",
              },
            ].map((app) => {
              const selectedPackage = packages.find((pkg) => pkg.amount === Number(credits));
              const amount = selectedPackage ? selectedPackage.price : 0;

              const upiUrl = `upi://pay?pa=theakaashyadav@ptyes&pn=Akash%20Yadav&am=${amount}&cu=INR&tn=Credit%20Purchase`;
              const intentUrl = `intent://${upiUrl.replace("upi://", "")}#Intent;scheme=${app.scheme};package=${app.package};end`;

              const handleAppClick = (e) => {
                e.preventDefault();
                if (!credits || !amount) {
                  showInfo("Please select a credit package first");
                  return;
                }
                setPaymentMethod(app.name);
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

                if (!isMobile) {
                  window.open(app.fallback, "_blank");
                  return;
                }

                const newWindow = window.open(intentUrl, "_blank");

                // Fallback if UPI app not installed
                setTimeout(() => {
                  try {
                    if (newWindow && !newWindow.closed) {
                      newWindow.location.href = app.fallback;
                    }
                  } catch {
                    window.open(app.fallback, "_blank");
                  }
                }, 3000);
              };

              return (
                <a
                  key={app.name}
                  href={intentUrl}
                  onClick={handleAppClick}
                  style={{
                    display: "inline-block",
                    width: "70px",
                    height: "70px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <img
                    src={app.src}
                    alt={app.name}
                    style={{
                      width: "60px",
                    height: "60px",
                      objectFit: "contain",
                      borderRadius: "14px",
                      backgroundColor: "#fff",
                      padding: "8px",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </a>
              );
            })}
          </div>




          {/* ✅ Instruction text */}
          {["paytm", "gpay", "phonepe"].includes(paymentMethod) && (
            <p
              style={{
                marginTop: "1rem",
                color: "#4b5563",
                fontSize: "0.9rem",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              Open your{" "}
              {paymentMethod === "paytm"
                ? "Paytm"
                : paymentMethod === "gpay"
                  ? "Google Pay"
                  : "PhonePe"}{" "}
              app and complete payment using the selected amount.
            </p>
          )}
        </div>

        {/* 📱 Responsive tweaks for small devices */}
        <style>
          {`
      @media (max-width: 768px) {
        div[style*="max-width: 28rem"] {
          padding: 1.2rem;
        }
        select {
          font-size: 0.95rem !important;
        }
      }

      @media (max-width: 480px) {
        div[style*="max-width: 28rem"] {
          padding: 1rem;
          border-radius: 12px;
        }
        h3 {
          font-size: 1.25rem !important;
          text-align: center;
        }
        img[alt="UPI QR Code"] {
          max-width: 200px !important;
        }
      }
    `}
        </style>

        
      </div>

      <div ref={formRef} style={styles.formCard}>
        <h2 style={styles.formTitle}>💵 Submit Payment   Reference No.</h2>

        {/* Visual Step Instructions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              minWidth: "30px",
              minHeight: "30px",
              borderRadius: "50%",
              backgroundColor: "#2563eb",
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "700"
            }}>1</div>
            <p style={{ margin: 0, color: "#374151", fontSize: "0.95rem" }}>
              Open your selected UPI app or scan the QR code above to make the payment.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              minWidth: "30px",
              minHeight: "30px",
              borderRadius: "50%",
              backgroundColor: "#2563eb",
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "700"
            }}>2</div>
            <p style={{ margin: 0, color: "#374151", fontSize: "0.95rem" }}>
              After a successful payment, you will receive a <strong>payment reference number</strong> in your UPI app.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              minWidth: "30px",
              minHeight: "30px",
              borderRadius: "50%",
              backgroundColor: "#2563eb",
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "700"
            }}>3</div>
            <p style={{ margin: 0, color: "#374151", fontSize: "0.95rem" }}>
              Copy the reference number and paste it below, then click <strong>Submit</strong> to confirm.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Hidden credits field */}
          <input type="hidden" value={credits} />

          {/* Payment Reference Field */}
          <input
            type="text"
            value={paymentReference || ""}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="Enter payment reference number"
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
              width: "100%",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitButton, ...(loading ? styles.submitButtonDisabled : {}) }}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>


      <div ref={requestsRef} style={styles.formCard}>
  <h3
    style={{
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#1b1d3a",
      marginBottom: "1.5rem",
    }}
  >
    📄 Your Requests
  </h3>

  {requests.length === 0 ? (
    <div
      style={{
        textAlign: "center",
        padding: "2rem 1rem",
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
        alt="No Requests"
        style={{
          width: "120px",
          height: "120px",
          marginBottom: "1rem",
        }}
      />
      <h3
        style={{
          fontSize: "1.2rem",
          fontWeight: "600",
          color: "#1b1d3a",
          marginBottom: "0.5rem",
        }}
      >
        No Requests Yet
      </h3>
      <p
        style={{
          fontSize: "0.95rem",
          color: "#6b7280",
          lineHeight: "1.5",
        }}
      >
        You haven’t submitted any credit requests yet. Select a package above to
        get started.
      </p>
    </div>
  ) : (
    <div className="table-wrapper">
      <table className="leads-table requests-table">
        <thead>
          <tr>
            <th>Credits</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => {
            const userPhone = user?.phone || "N/A";
            const message = `Hello,

I have made a payment with reference number: ${req.paymentReference || "N/A"}.
I would like to purchase ${req.Credits} credits.
My mobile number is ${userPhone}.
Please verify my details.

Thank you.`;

            const whatsappUrl = `https://wa.me/9115082252?text=${encodeURIComponent(
              message
            )}`;

            return (
              <tr
                key={req._id}
                className={
                  req.status === "approved"
                    ? "valid-request"
                    : req.status === "rejected"
                    ? "expired-request"
                    : index % 2 === 0
                    ? "even-row"
                    : "odd-row"
                }
              >
                <td>💰 <strong>{req.Credits}</strong></td>
                <td>
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textTransform: "capitalize",
                      color: "#fff",
                      backgroundColor:
                        req.status === "approved"
                          ? "#16a34a"
                          : req.status === "rejected"
                          ? "#b91c1c"
                          : "#f59e0b",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      display: "inline-block",
                    }}
                  >
                    {req.status}
                  </span>
                </td>
                <td>
                  {new Date(req.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td style={{ textAlign: "center" }}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "transparent",
                      transition: "transform 0.2s ease",
                    }}
                    title="Send WhatsApp Message"
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "scale(1.1)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <img
                      src={icon}
                      alt="WhatsApp"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}

  <div
    style={{
      marginTop: "1.5rem",
      padding: "1rem",
      background: "#f3f4f6",
      borderRadius: "0.75rem",
    }}
  >
    <p
      style={{
        fontSize: "0.9rem",
        color: "#374151",
        lineHeight: "1.5",
        margin: 0,
      }}
    >
      ⏳ <strong>Note:</strong> It may take some time to verify your payment.
      You’ll receive a WhatsApp message once your payment has been successfully
      verified.
    </p>
  </div>

  {/* ✅ Fixed Table & Responsive Styles */}
  <style>{`
    /* Table styling */
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
    .valid-request { background: #e0f7e9; }
    .expired-request { background: #fbeaea; }

    /* ✅ Wrapper to avoid white space */
    .table-wrapper {
      overflow-x: auto;
      width: 100%;
      margin: 0;
      padding: 0;
      -webkit-overflow-scrolling: touch;
    }

    /* ✅ Prevent right white space */
    body, html {
      overflow-x: hidden;
    }

    /* ✅ Mobile responsiveness */
    @media (max-width: 768px) {
      .leads-table th, .leads-table td {
        padding: 8px;
        font-size: 0.85rem;
      }
      .table-wrapper {
        width: 100%;
        overflow-x: auto;
      }
      .leads-table {
        width: 100%;
        min-width: 300px;
      }
      h3 {
        font-size: 1.2rem !important;
      }
    }
  `}</style>
</div>


      


      <div style={styles.featuresGrid}>
  {[
    { title: "Quick Approval (1–2 hrs)", icon: "⚡" },
    { title: "Secure Payments", icon: "🔒" },
    { title: "No Hidden Fees", icon: "💸" },
    { 
      title: "24/7 Support", 
      icon: "💬", 
      onClick: () => window.open("https://wa.me/919012622994", "_blank") 
    },
  ].map((feature, idx) => (
    <div
      key={idx}
      onClick={feature.onClick}
      style={{
        ...styles.featureCard,
        cursor: feature.onClick ? "pointer" : "default",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseOver={(e) => {
        if (feature.onClick) {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.1)";
        }
      }}
      onMouseOut={(e) => {
        if (feature.onClick) {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
        }
      }}
    >
      <div style={styles.featureIcon}>{feature.icon}</div>
      <h4 style={{ fontWeight: "600", color: "#1f2937" }}>{feature.title}</h4>
    </div>
  ))}
</div>

      <GlobalToaster />
    </div>
  );
};



export default BuyCreditsPage;
