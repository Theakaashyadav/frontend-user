// frontend/src/pages/ContactPage.jsx
import React, { useState, useEffect, useContext, useRef } from "react";

import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { API_BASE } from "../api";
import "./style/ContactPage.css";
import { AuthContext } from "../context/AuthContext";
import SkeletonLoader from "../components/SkeletonLoader";
import ImageModal from "../components/ImageModal";
import { GlobalToaster, showSuccess, showError, showInfo } from "../utils/toaster"
import { motion } from "framer-motion";
import BottomNav from "../components/BottomNav";

function ProductCard({ property, onImageClick, navigate, user }) {
  const images = property.imageUrls || property.images || [];
  const fallbackImage = "https://via.placeholder.com/400x250?text=No+Image";
  const sessionId = localStorage.getItem("sessionId");
  const [addedToCart, setAddedToCart] = useState(false);

  const trackContactClick = async (sessionId, userId) => {
    try {
      await fetch(`${API_BASE}/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "contact_click", sessionId, userId }),
      });
    } catch (err) {
      console.error("Failed to track contact click:", err);
    }
  };



  const handleContactClick = () => {
    if (!property || !property._id) return;
    trackContactClick(sessionId, user?._id);
    navigate(`/contact/${property.listingId}`);
  };

  return (
    <div className="listing" style={{ position: "relative" }} onClick={handleContactClick}>
      {property.listingId && <div className="listing-id-badge">ID: {property.listingId}</div>}



      <img
        src={images[0] || fallbackImage}
        alt={property.location || "Property"}
        style={{ cursor: images.length > 0 ? "pointer" : "default" }}
        onClick={(e) => {
          e.stopPropagation();
          if (images.length) onImageClick(images);
        }}
      />

      <div className="listing-details">
        <div className="feature-item">
          <h3>
            {property.bhk || ""} {property.location || ""}
          </h3>
        </div>

        <div className="features">
          {property.price && (
            <div className="feature-item">
              <i className="fas fa-tag"></i> <strong>₹{Number(property.price).toLocaleString()}</strong>
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

export default function ContactPage() {
  const { listingId: paramListingId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [listingId, setListingId] = useState(paramListingId || "");
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useContext(AuthContext);
  const location = useLocation();

  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [showPage, setShowPage] = useState(false);

  const [addedToCart, setAddedToCart] = useState(false);
  const cartRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { redirectTo: location.pathname } });
    }
  }, [authLoading, user, navigate, location.pathname]);

  useEffect(() => setShowPage(true), []);

  useEffect(() => {
    if (!authLoading && user?.userId) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/users/${user.userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            setName(data.user?.name || "");
            setPhone(data.user?.phone || "");
          }
        } catch (err) {
          console.error("Error fetching user info:", err);
        }
      })();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!listingId) return;
    const fetchProperty = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/properties/${listingId}`);
        if (!res.ok) throw new Error("Property not found");
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [listingId]);

  const openModal = (images) => {
    setModalImages(images);
    setModalIndex(0);
  };
  const closeModal = () => setModalImages([]);
  const nextImage = () => setModalIndex((prev) => (prev + 1) % modalImages.length);
  const prevImage = () => setModalIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));

  if (authLoading || isLoading || !showPage) return <SkeletonLoader count={4} page="contact" />;

  // ✅ Add to Cart click handler directly inside the component
  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    if (typeof onAddToCart === "function" && property) {
      onAddToCart(property.listingId, property.imageUrls[0], rect.left, rect.top);
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("authUser"));
      let fetchedName = storedUser?.name || "";
      let fetchedPhone = storedUser?.phone || "";

      if (storedUser?.userId) {
        const res = await fetch(`${API_BASE}/users/check-session`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": localStorage.getItem("sessionToken") || "",
            "x-user-id": storedUser.userId,
          },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          fetchedName = data?.user?.name || fetchedName;
          fetchedPhone = data?.user?.phone || fetchedPhone;
          localStorage.setItem(
            "authUser",
            JSON.stringify({ ...storedUser, name: fetchedName, phone: fetchedPhone })
          );
        } else if (res.status === 401) {
          navigate("/auth", { state: { redirectTo: location.pathname } });
          return;
        }
      }

      const checkRes = await fetch(
        `${API_BASE}/leads/check?userId=${storedUser?.userId}&listingId=${property?.listingId}`
      );
      const checkData = await checkRes.json();
      if (checkData?.exists) {
        showInfo("Already saved in cart");
        setAddedToCart(true);
        return;
      }

      await fetch(`${API_BASE}/leads/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fetchedName,
          phone: fetchedPhone,
          listingId: property?.listingId,
          userId: storedUser?.userId,
          ownerId: property?.userId || property?.ownerId,
        }),
      });

      showSuccess("Added to cart");
      setAddedToCart(true);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  return (
    <div className="contact-page container contact-container">
      <BottomNav ref={cartRef} />

      <div className="steps-wrapper">

        {error && <p className="error">{error}</p>}

        {property && (
          <>
            <ProductCard
              property={property}
              onImageClick={openModal}
              navigate={navigate}
              user={user}

            />

            {/* Add to Cart / Added to Cart button container */}


          </>
        )}

      </div>

      {modalImages.length > 0 && (
        <ImageModal images={modalImages} currentIndex={modalIndex} onClose={closeModal} onNext={nextImage} onPrev={prevImage} />
      )}



  {/* Fixed Add to Cart / Added to Cart button above BottomNav */}
<div
  style={{
    position: "fixed",
    bottom: "60px", // place above BottomNav
    left: 0,
    width: "100%",
    background: "#1B1D3A",
    height: "80px",
    zIndex: 800,
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  {addedToCart ? (
    <button
      type="button"
      className="btn btn-dark"
      style={{
        width: "50%",
        background: "#F2C94C",
        color: "#000000ff",
        textAlign: "center",
        borderRadius: "10px",
        padding: "14px 0",
        zIndex: 1200,
        opacity: 0.8,
        cursor: "not-allowed",
        border: "none",
        marginBottom: "30px",
      }}
      disabled
    >
      Added to Cart
    </button>
  ) : (
    <button
      type="button"
      className="btn btn-dark"
      style={{
        width: "50%",
        background: "#707070ff",
        color: "#ffffff",
        textAlign: "center",
        borderRadius: "10px",
        padding: "14px 0",
        zIndex: 1200,
        cursor: "pointer",
        border: "none",
        marginBottom: "30px",
      }}
      onClick={handleAddToCartClick}
    >
      Add to Cart
    </button>
  )}
</div>




      <GlobalToaster />
    </div>
  );
}

