import React, { useEffect, useState, useContext } from "react";
import { API_BASE } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../components/ProductCard.css";
import ImageModal from "../components/ImageModal";
import SkeletonLoader from "../components/SkeletonLoader";
import { GlobalToaster, showSuccess, showError, showInfo } from "../utils/toaster"
import { confirmDelete } from "../utils/sweetalert";



// ================= ProductCard Component =================
function ProductCard({ property, onDelete, onImageClick, navigate, user, phoneButtonProps }) {
  const { isChecked, onSelect } = property; // ✅ add this line


  const images = property.imageUrls || property.images || [];
  const fallbackImage = "https://via.placeholder.com/400x250?text=No+Image";
  const sessionId = localStorage.getItem("sessionId");

  //   const handleContactClick = () => {
  //     if (!property || !property._id) return;
  //     trackContactClick(sessionId, user?._id); // ✅ track
  //     navigate(`/contact/${property.listingId}`);
  //   };

  // ✅ Handle phone button click
  const handlePhoneClick = () => {
    if (phoneButtonProps?.disabled) return;

    const phone = phoneButtonProps?.number || property?.phone;
    if (!phone) return;

    const cleanedNumber = phone.replace(/\D/g, "");

    // ✅ If device is mobile → open dialer
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `tel:${cleanedNumber}`;
    } else {
      // ✅ On desktop → go to contact page
      navigate(`/contact/${property.listingId}`);
    }
  };


  return (
    <div className="listing" style={{ position: "relative" }}>
      {/* ✅ Checkbox on top-left */}
      {/* ✅ Checkbox on top-left */}
{/* ✅ Glowing Checkbox on top-left */}
<input
  type="checkbox"
  checked={isChecked}
  required
  onChange={() => onSelect(property.listingId)}
  style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    zIndex: 3,
    boxShadow: "0 0 10px 2px #1B1D3A", // glowing effect
    border: "2px solid #1B1D3A",       // border to enhance glow
    borderRadius: "4px",
    animation: "pulse 1.5s infinite",   // pulse animation
  }}
/>

{/* Add this CSS somewhere globally or in styled component */}
<style>
{`
  @keyframes pulse {
    0% {
      box-shadow: 0 0 5px 1px #1B1D3A;
    }
    50% {
      box-shadow: 0 0 15px 5px #1B1D3A;
    }
    100% {
      box-shadow: 0 0 5px 1px #1B1D3A;
    }
  }
`}
</style>



      {property.listingId && (
        <div className="listing-id-badge">ID: {property.listingId}</div>
      )}

      <img
        src={images[0] || fallbackImage}
        alt={property.location || "Property"}
        onClick={() => {
          if (images.length && typeof onImageClick === "function") {
            onImageClick(images);
          }
        }}

      />

      <div className="listing-details">
        <div className="feature-item">
          <h3>{property.bhk || ""} {property.location || ""}</h3>
        </div>

        <div className="features">
          {property.price && (
            <div className="feature-item">
              <i className="fas fa-tag"></i>{" "}
              <strong>₹{Number(property.price).toLocaleString()}</strong>
            </div>
          )}
        </div>

        <div className="features">
          {property.type && (
            <div className="feature-item">
              <i className="fas fa-building"></i> {property.type}
            </div>
          )}
        </div>

        <div className="features">
          {property.bedrooms && (
            <div className="feature-item">
              <i className="fas fa-bed"></i> {property.bedrooms}
            </div>
          )}
          {property.bathrooms && (
            <div className="feature-item">
              <i className="fas fa-bath"></i> {property.bathrooms}
            </div>
          )}
          {property.tenant && (
            <div className="feature-item">
              <i className="fas fa-user"></i> {property.tenant}
            </div>
          )}
          {property.furnishing && (
            <div className="feature-item">
              <i className="fas fa-couch"></i> {property.furnishing}
            </div>
          )}
          {property.residence && (
            <div className="feature-item">
              <i className="fas fa-home"></i> {property.residence}
            </div>
          )}
          {property.availability && (
            <div className="feature-item">
              <i className="fas fa-calendar-alt"></i> {property.availability}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}


// ================= UserOrders Page =================
export default function Cart() {
  const { token, user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkoutTimer, setCheckoutTimer] = useState(null);
  // 💬 Popup for insufficient credits
  const [showCreditModal, setShowCreditModal] = useState(false);
  const bottomNavHeight = 60; // adjust if your BottomNav height changes


  const navigate = useNavigate();

  // --- Image Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

  // --- Modal Handlers ---
  const openModal = (images, index = 0) => {
    setModalImages(images);
    setModalIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);
  const nextImage = () =>
    setModalIndex((prev) => (prev + 1) % modalImages.length);
  const prevImage = () =>
    setModalIndex((prev) =>
      prev === 0 ? modalImages.length - 1 : prev - 1
    );

  // 🧩 Inside Cart component state
  const [selectedListings, setSelectedListings] = useState([]);

  const toggleSelect = (listingId) => {
    setSelectedListings((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  // At the top of your Cart component
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // 🧩 Add this new state and useEffect
  const [userCredits, setUserCredits] = useState(0);


  /* ==============================
     🔹 Auth Analytics Tracking
  ============================== */
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
  
  // Convenience wrappers
  const trackcheckout = () =>trackEvent("checkout");


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



  const handleCheckout = async () => {
    if (!selectedListings.length) return alert("No items selected");

    // 💰 Calculate total cost (same as summary)
    const totalCost = selectedListings.reduce((acc) => {
      const baseCost = 50;
      const discount = baseCost * 0.5;
      const subtotal = baseCost - discount;
      return acc + subtotal;
    }, 0);

    // 🚨 Check credits before checkout
    if (userCredits < totalCost) {
      showError("Not enough credits to complete this checkout!");
      setTimeout(() => setShowCreditModal(true), 500); // open modal after toast
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          userId: user.userId,
          listingIds: selectedListings,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showSuccess("Order Processed successfully!");
        trackcheckout();
        setSelectedListings([]); // clear selected items
      } else {
        showError(" Failed to save checkout");
      }
    } catch (err) {
      console.error("Error saving checkout:", err);
      alert("⚠️ Error saving checkout");
    }
  };


  // 🗑️ Handle multiple deletions with SweetAlert confirmation
  const handleDeleteClick = () => {
    if (!selectedListings.length) return showError("No listings selected!");

    confirmDelete(selectedListings.length, async () => {
      try {
        // ✅ Update frontend instantly
        const updatedOrders = orders.filter(
          (o) => !selectedListings.includes(o.property?.listingId)
        );
        setOrders(updatedOrders);

        // ✅ Backend delete request
        await fetch(`${API_BASE}/leads/delete-listing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({
            userId: user.userId,
            listingIds: selectedListings,
          }),
        });

        // ✅ Notify success
        showSuccess("Item Removed !");
        setSelectedListings([]);
      } catch (err) {
        console.error("Error deleting listings:", err);
        showError("Failed to delete selected listings!");
      }
    });
  };



  const fetchOrders = async () => {
    if (!user?.userId) return;

    setLoading(true);
    try {
      // ✅ Fetch all leads where this user is listed as an owner
      const res = await fetch(`${API_BASE}/leads/user/${user.userId}`, {

        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      // ✅ For each lead, find this owner's section & fetch all their property details
      const updatedOrders = await Promise.all(
        data.flatMap((lead) =>
          lead.owners.flatMap((owner) =>
            owner.listingIds.map(async (listingId) => {

              try {
                const propRes = await fetch(`${API_BASE}/properties/${listingId}`, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : undefined,
                  },
                });
                const propData = propRes.ok ? await propRes.json() : null;
                const property = propData?.data || propData || null;

                return {
                  _id: lead._id,
                  name: lead.name,
                  phone: lead.phone,
                  status: lead.status,
                  createdAt: lead.createdAt, // ✅ add this line
                  listingId,
                  property,
                };

              } catch {
                return {
                  _id: lead._id,
                  name: lead.name,
                  phone: lead.phone,
                  status: lead.status,
                  createdAt: lead.createdAt, // ✅ add this line
                  listingId,
                  property,
                };

              }
            })
          )
        )
      );


      setOrders(updatedOrders);
    } catch (err) {
      console.error("Error fetching owner leads:", err);
      setMessage("Failed to fetch leads for owner");
    } finally {
      setLoading(false);
    }
  };


  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await fetch(`${API_BASE}/leads/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      if (!res.ok) throw new showError("Failed to delete order");
      setMessage("Order deleted successfully");
      fetchOrders();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to delete order");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.userId]);

  if (!user?.userId || loading) return <SkeletonLoader page="userOrders" count={2} />;


  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif" }}>
      <h1>Your Cart</h1>
      {message && <p style={{ color: "green", fontWeight: 600 }}>{message}</p>}

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


      {/* Properties Section */}
      {orders.filter((o) => o.property).length > 0 ? (
        <section style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {orders
              .filter((o) => o.property)
              .map((order) => (
                <ProductCard
                  key={order._id}
                  property={{
                    ...order.property,
                    isChecked: selectedListings.includes(order.property.listingId),

                    onSelect: toggleSelect,
                  }}
                  user={user}
                  navigate={navigate}
                  onImageClick={(images) => openModal(images)}
                  phoneButtonProps={{
                    disabled:
                      (order.status || "").toLowerCase() !== "paid" ||
                      !(order.phone || order.property?.phone),
                    title:
                      (order.status || "").toLowerCase() !== "paid" ||
                        !(order.phone || order.property?.phone)
                        ? "Waiting For Payment Verification"
                        : "Call",
                    number: order.phone || order.property?.phone || "Hidden",
                  }}
                />

              ))}
          </div>
        </section>


      ) : (
        /* ✨ Empty State Card */
        <div className="empty-state-card">
          <i className="fas fa-folder-open empty-icon"></i>
          <h3>No Properties Found</h3>
          <p>
            You haven’t saved any property yet. Once you submit,
            your property details will appear here.
          </p>
          <button className=" submit-btn" onClick={() => navigate("/")} > Explore Properties </button>

        </div>
      )}

      {/* ✅ Checkout Summary Table */}
      {(

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "16px",
            margin: "20px auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "800px",
            width: "100%",
            overflowX: "auto",
          }}
        >
          <h3
            style={{
              marginBottom: "12px",
              fontWeight: "600",
              color: "#1b1d3a",
              textAlign: "center",
            }}
          >
            Checkout Summary
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.95rem",
            }}
          >
            <thead style={{ background: "#1b1d3a", color: "#fff" }}>
              <tr>
                <th style={{ padding: "10px" }}>Item (Listing ID)</th>
                <th style={{ padding: "10px" }}>Credit Cost</th>
                <th style={{ padding: "10px" }}>Discount</th>
                <th style={{ padding: "10px" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedListings.map((id, index) => {
                const baseCost = 80; // 💰 example credit cost per listing
                const discount = baseCost * 0.5;
                // sample discount logic
                const subtotal = baseCost - discount;
                return (
                  <tr
                    key={id}
                    style={{
                      background: index % 2 === 0 ? "#f9f9f9" : "#fff",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{id}</td>
                    <td style={{ padding: "10px" }}>{baseCost} 💰</td>
                    <td style={{ padding: "10px", color: discount ? "green" : "#555" }}>
                      {discount ? `-${discount} 💰` : "—"}
                    </td>
                    <td style={{ padding: "10px", fontWeight: 600 }}>{subtotal} 💰</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#e9ecef", fontWeight: 600 }}>
                <td colSpan="3" style={{ padding: "10px", textAlign: "right" }}>
                  Total:
                </td>
                <td style={{ padding: "10px" }}>
                  {selectedListings.reduce((acc) => {
                    const baseCost = 80;
                    const discount = baseCost * 0.5;
                    const subtotal = baseCost - discount;
                    return acc + subtotal;
                  }, 0)} 💰
                </td>
              </tr>
            </tfoot>

          </table>
        </div>
      )}


      {/* ✅ Checkout Button Fixed at Bottom */}
      {/* ✅ Checkout & Delete Buttons Fixed at Bottom */}
      {orders.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? `${bottomNavHeight}px` : 0, // push above BottomNav
            left: 0,
            width: "100%",
            background: "#1b1d3a",
            padding: "15px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            zIndex: 20,
          }}
        >
          {/* 🗑️ Delete Button — only visible when something is selected */}
          {selectedListings.length > 0 && (
            <button
              onClick={handleDeleteClick}

              style={{
                background: "#dc3545",
                color: "#fff",
                padding: "12px 22px",
                fontSize: "1rem",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                minWidth: "120px",
                transition: "all 0.3s ease",
                flex: 1,
                maxWidth: "200px",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#c82333")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#dc3545")}
            >
              <i className="fas fa-trash-alt" style={{ marginRight: "8px" }}></i>
              Delete
            </button>
          )}

          {/* 🛒 Checkout Button */}
          <button
            onClick={async () => {
              if (isCheckingOut) {
                clearTimeout(checkoutTimer);
                setIsCheckingOut(false);
                setProgress(0);
                return;
              }

              setIsCheckingOut(true);
              let progressValue = 0;
              const interval = setInterval(() => {
                progressValue += 10;
                setProgress(progressValue);
              }, 300);

              const timer = setTimeout(() => {
                clearInterval(interval);
                setIsCheckingOut(false);
                setProgress(0);
                handleCheckout();
              }, 3000);

              setCheckoutTimer(timer);
            }}
            style={{
              position: "relative",
              background: selectedListings.length
                ? "#28a745"
                : "rgba(255,255,255,0.3)",
              color: "#fff",
              padding: "12px 24px",
              fontSize: "1rem",
              border: "none",
              borderRadius: "8px",
              cursor: selectedListings.length ? "pointer" : "not-allowed",
              overflow: "hidden",
              transition: "background 0.3s ease",
              flex: 1,
              maxWidth: "220px",
              minWidth: "150px",
            }}
            disabled={selectedListings.length === 0}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${progress}%`,
                background: "rgba(255,255,255,0.3)",
                transition: "width 0.3s linear",
                borderRadius: "8px",
              }}
            ></span>
            {isCheckingOut
              ? "Cancel"
              : `Checkout (${selectedListings.length})`}
          </button>

          {/* ✅ Responsive adjustments */}
          <style>{`
      @media (max-width: 600px) {
        div[style*="fixed"] {
          flex-direction: column;
          gap: 10px;
        }
        div[style*="fixed"] button {
          width: 90%;
          font-size: 0.95rem;
        }
      }
    `}</style>
        </div>
      )}


      {modalOpen && modalImages.length > 0 && (
        <ImageModal
          images={modalImages}
          currentIndex={modalIndex}
          onClose={closeModal}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
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
        position: sticky;
        top: 0;
        z-index: 2;
      }
      .even-row { background: #f9f9f9; }
      .odd-row { background: #ffffff; }

      .empty-state-card {
        text-align: center;
        background: #fff;
        border-radius: 12px;
        padding: 40px 20px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        margin: 40px auto;
        max-width: 500px;
      }
      .empty-icon {
        font-size: 48px;
        color: #1b1d3a;
        margin-bottom: 15px;
      }
      .empty-state-card h3 {
        color: #1b1d3a;
        margin-bottom: 8px;
      }
      .empty-state-card p {
        color: #666;
        margin-bottom: 16px;
        font-size: 0.95rem;
      }

      .empty-table {
        text-align: center;
        padding: 20px 0;
        color: #777;
      }
      .empty-table i {
        font-size: 28px;
        color: #1b1d3a;
        margin-bottom: 8px;
      }
      .no-requests-cell {
        text-align: center;
        padding: 20px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .leads-table th, .leads-table td {
          padding: 10px 8px;
          font-size: 0.9rem;
        }
        .leads-table {
          font-size: 0.9rem;
        }
        .empty-state-card {
          padding: 25px 15px;
        }
        .empty-icon {
          font-size: 40px;
        }
      }
    `}</style>
    </div>
  );
}
