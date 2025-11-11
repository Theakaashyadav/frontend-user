import React, { useEffect, useState, useContext } from "react";
import { API_BASE } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../components/ProductCard.css";
import ImageModal from "../components/ImageModal";
import SkeletonLoader from "../components/SkeletonLoader";
import { showError, showSuccess } from "../utils/toaster";




// ================= ProductCard Component =================
function ProductCard({ property, onDelete, onImageClick, navigate, phoneButtonProps, selectedListings,
  toggleSelect }) {

  const images = property.imageUrls || property.images || [];
  const fallbackImage = "https://via.placeholder.com/400x250?text=No+Image";
  const sessionId = localStorage.getItem("sessionId");
  const isChecked = selectedListings.includes(property.listingId);

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

      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => toggleSelect(property.listingId)}
required
        style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "30px",   // increased size
    height: "30px",  // increased size
    cursor: "pointer",
    zIndex: 3,
  }}
      />

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

        {/* Phone button */}
        {phoneButtonProps && (
          <button
            className="get-contact-btn active"
            style={{ marginTop: "12px" }}
            title={phoneButtonProps.title}
            onClick={handlePhoneClick}
          >
            <i className="fas fa-phone-alt" style={{ marginRight: "8px" }}></i>
            {phoneButtonProps.number || "+91 0000000000"}
          </button>
        )}

      </div>
    </div>
  );
}


// ================= UserOrders Page =================
export default function UserOrders() {
  const { token, user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [properties, setProperties] = useState([]);


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


  const [selectedListings, setSelectedListings] = useState([]);

  const toggleSelect = (listingId) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
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


  const fetchOrders = async () => {
    if (!user?.userId) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/cart/${user.userId}`);
      const cartData = await res.json();

      const listingIds = Array.isArray(cartData) && cartData.length > 0
        ? cartData[0].listingIds || []
        : [];

      if (listingIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const propertiesRes = await fetch(`${API_BASE}/properties`);
      const allProperties = await propertiesRes.json();

      const matched = allProperties.filter((p) =>
        listingIds.includes(p.listingId)
      );

      const finalOrders = matched.map((property) => ({
        _id: property._id,
        listingId: property.listingId,
        property,
        name: user.name,
        phone: property.phone || "",
        status: "paid",
        createdAt: property.createdAt || new Date(),
      }));

      setOrders(finalOrders);
    } catch (err) {
      console.error("Error fetching checkout properties:", err);
      setMessage("Failed to fetch checkout properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.userId]);


  // --- Delete handler ---
  const handleDeleteClick = async () => {
    if (!selectedListings.length) return showError("No listings selected!");

    try {
      const res = await fetch(`${API_BASE}/cart/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ userId: user.userId, listingIds: selectedListings }),
      });

      const data = await res.json();
      if (data.success) {
        showSuccess("items removed!");
        // remove items from orders first, then clear selection
        setOrders(prev => prev.filter(o => !selectedListings.includes(String(o.property.listingId))));

        setSelectedListings([]);
      } else {
        showError(data.message || "Failed to remove items");
      }
    } catch (err) {
      console.error(err);
      showError("Error deleting selected items");
    }
  };





  if (!user?.userId || loading) return <SkeletonLoader page="userOrders" count={2} />;


  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif" }}>
      <h1>Your Orders</h1>


      {/* Properties Section */}
      {orders.length > 0 ? (
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
            {orders.map((order) => (
              <ProductCard
                key={order._id}
                property={order.property}
                user={user}
                navigate={navigate}
                onImageClick={(images) => openModal(images)}
                toggleSelect={toggleSelect}    // ✅ Add this
                selectedListings={selectedListings}
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
            You haven’t made any property requests yet. Once you submit a request,
            your property details will appear here.
          </p>
          <button
            className="submit-btn"
            onClick={() => navigate("/")}
          >
            Explore Properties
          </button>
        </div>
      )}
      {selectedListings.length > 0 && (
        <div
          className="delete-container"
          style={{
            position: "fixed",
            bottom: isMobile ? "60px" : 0,
            left: 0,
            width: "100%",
            background: "#1b1d3a",
            padding: isMobile ? "12px" : "15px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            zIndex: 9999,
            border: "none",
            outline: "none",
          }}
        >
          <button className="delete-btn" onClick={handleDeleteClick}>
            <i className="fas fa-trash-alt" style={{ marginRight: "8px" }}></i>
            Delete
          </button>
        </div>
      )}



      <style>{`
  .delete-btn {
    background: #dc3545;
    color: #fff;
    padding: 12px 22px;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    flex: 1;
    max-width: 200px;
    transition: background 0.3s ease;
  }

  .delete-btn:hover {
    background: #c82333;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .delete-btn {
      font-size: 0.95rem;
      padding: 10px 18px;
      max-width: 90%;
    }
  }
`}</style>



      {modalOpen && modalImages.length > 0 && (
        <ImageModal
          images={modalImages}
          currentIndex={modalIndex}
          onClose={closeModal}
          onNext={nextImage}
          onPrev={prevImage}
        />
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
