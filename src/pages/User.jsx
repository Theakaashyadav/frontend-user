import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../api";
import "./style/User.css";
import ImageModal from "../components/ImageModal";
import SkeletonLoader from "../components/SkeletonLoader";



// ✅ Helper component
function ProductCard({ property, onDelete, onImageClick }) {
  const images = property.imageUrls || property.images || [];
  const fallbackImage = "https://via.placeholder.com/400x250?text=No+Image";

  // ✅ Define status colors
  const statusColors = {
    approved: "green",
    rejected: "red",
    pending: "orange",
  };

  return (
    <div className="listing" style={{ position: "relative" }}>
      {property.listingId && (
        <div className="listing-id-badge">ID: {property.listingId}</div>
      )}

      {/* Status badge on top-right */}
      {property.status && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: statusColors[property.status] || "#999",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "20px",
            fontWeight: 500,
            fontSize: "0.85rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 2,
            transition: "all 0.3s ease",
          }}
        >
          {property.status === "approved"
            ? "Live"
            : property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </div>
      )}


      <img
        src={images[0] || fallbackImage}
        alt={property.location || "Property"}
        onClick={() => images.length && onImageClick(images)}
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

        <button onClick={() => onDelete(property._id)} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );
}

export default function MyProperties() {
  const { token, user, login, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  // Modal states
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true); // ✅ renamed to avoid conflict

  const openModal = (images) => {
    setModalImages(images);
    setModalIndex(0);
    setImageLoading(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImages([]);
    setModalIndex(0);
    setImageLoading(true);
  };

  const prevImage = () => {
    setModalIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);
    setImageLoading(true);
  };

  const nextImage = () => {
    setModalIndex((prev) => (prev + 1) % modalImages.length);
    setImageLoading(true);
  };

  // ✅ Track analytics events with session creation if missing
  const trackEvent = async (eventType) => {
    try {
      let sessionId = localStorage.getItem("sessionId");

      if (!sessionId) {
        const res = await fetch(`${API_BASE}/analytics/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        sessionId = data.sessionId;
        localStorage.setItem("sessionId", sessionId);
      }

      await fetch(`${API_BASE}/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, sessionId }),
      });
    } catch (err) {
      console.error("Failed to track event:", eventType, err);
    }
  };



  // ✅ Fetch properties for the logged-in user
  useEffect(() => {
    if (!user?.userId) return;
    const fetchList = async () => {
      try {
        const res = await fetch(`${API_BASE}/properties/user/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setList(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchList();
  }, [user?.userId, token]);

  // ✅ Delete property and track event
  const onDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setList((prev) => prev.filter((p) => p._id !== id));
        trackEvent("delete_property");
      } else alert("Delete failed");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ✅ Loader checks (show skeleton until data/user ready)
  if (authLoading || !user || !list.length) {
    return <SkeletonLoader page="user" count={6} />;
  }

  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>My Properties</h1>
      <div className="grid props" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
        {list.map((p) => (
          <ProductCard key={p._id} property={p} onDelete={onDelete} onImageClick={openModal} />
        ))}
      </div>
      {modalOpen && modalImages.length > 0 && (
        <ImageModal
          images={modalImages}
          currentIndex={modalIndex}
          onClose={closeModal}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}

    </div>
  );
}
