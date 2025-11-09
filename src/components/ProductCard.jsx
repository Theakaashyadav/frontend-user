import React from "react";
import "./ProductCard.css";

export function ProductCard({ property, user, onImageClick, navigate }) {
  const images = property.imageUrls || property.images || [];
  const fallbackImage = "https://via.placeholder.com/400x250?text=No+Image";
  const sessionId = localStorage.getItem("sessionId");

  const handlePhoneClick = () => {
    if (property.phone) {
      window.location.href = `tel:${property.phone}`; // ✅ opens phone dialer
    }
  };

  return (
    <div className="listing" style={{ position: "relative" }}>
      {property.listingId && (
        <div className="listing-id-badge">ID: {property.listingId}</div>
      )}

      <img
        src={images[0] || fallbackImage}
        alt={property.location || "Property"}
        onClick={() => {
          if (images.length && onImageClick) {
            if (typeof trackImageClick === "function") {
              trackImageClick(sessionId, user?._id);
            }
            onImageClick(images); // ✅ Call parent modal
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
          {property.bedrooms && <div className="feature-item"><i className="fas fa-bed"></i> {property.bedrooms}</div>}
          {property.bathrooms && <div className="feature-item"><i className="fas fa-bath"></i> {property.bathrooms}</div>}
          {property.tenant && <div className="feature-item"><i className="fas fa-user"></i> {property.tenant}</div>}
          {property.furnishing && <div className="feature-item"><i className="fas fa-couch"></i> {property.furnishing}</div>}
          {property.residence && <div className="feature-item"><i className="fas fa-home"></i> {property.residence}</div>}
          {property.availability && <div className="feature-item"><i className="fas fa-calendar-alt"></i> {property.availability}</div>}
        </div>


        {/* Phone button */}
        {property.phone && (
          <button
            className="get-contact-btn"
            style={{ marginTop: "12px" }}
            onClick={handlePhoneClick}
          >
            <i className="fas fa-phone"></i> {property.phone}
          </button>
        )}
      </div>
    </div>
  );
}
