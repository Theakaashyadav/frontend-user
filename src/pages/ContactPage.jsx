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



  

  return (
    <div className="listing" style={{ position: "relative" }} onClick={handleContactClick}>
      {property.listingId && <div className="listing-id-badge">ID: {property.listingId}</div>}

      <motion.div
        className="listing"
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >

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

      </motion.div>

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
   const [addedToCart, setAddedToCart] = useState(false);

  const { user, loading: authLoading } = useContext(AuthContext);
  const location = useLocation();

  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [showPage, setShowPage] = useState(false);
  const [flyToCart, setFlyToCart] = useState(null);
  const cartRef = useRef(null);

  const handleSubmitLead = async (leadData = null) => {
    const dataToSend = leadData || { name, phone, listingId };

    if (!dataToSend.name || !dataToSend.phone || !dataToSend.listingId) return;

    try {
      // ✅ Check if this lead already exists for this user and property
      const checkRes = await fetch(
        `${API_BASE}/leads/check?userId=${user?.userId || user?._id}&listingId=${listingId}`
      );
      const checkData = await checkRes.json();

      if (checkData?.exists) {
        showInfo(" Already saved in cart");
        setAddedToCart(true);
        return;
      }




      // ✅ Create or update lead if not already saved
      const res = await fetch(`${API_BASE}/leads/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dataToSend,
          userId: user?.userId || user?._id, // logged-in user
          ownerId: property?.userId || property?.ownerId, // property owner
          propertyUserId: property?.userId, // fallback
        }),
      });

      if (!res.ok) throw new showError(" Failed to save");
    } catch (err) {
      console.error("Error saving lead:", err);
    }
  };


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
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              setName(data.user.name || "");
              setPhone(data.user.phone || "");
            } else {
              console.warn("User not found in database");
            }
          } else {
            console.warn("Failed to fetch user details");
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
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [listingId]);

  const trackEvent = async (eventType) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      await fetch(`${API_BASE}/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, sessionId }),
      });
    } catch (err) {
      console.error("Failed to track event:", eventType, err);
    }
  };

  const openModal = (images) => {
    setModalImages(images);
    setModalIndex(0);
  };
  const closeModal = () => {
    setModalImages([]);
    setModalIndex(0);
  };
  const nextImage = () => setModalIndex((prev) => (prev + 1) % modalImages.length);
  const prevImage = () => setModalIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));

  if (authLoading || isLoading || !showPage) {
    return <SkeletonLoader count={4} page="contact" />;
  }

  return (
    <div className="contact-page container contact-container">

      <BottomNav ref={cartRef} />
      <div className="steps-wrapper" onClick={handleContactClick}>

        
          {isLoading && <p>Loading property...</p>}
          {error && <p className="error">{error}</p>}
          {property && (
            <ProductCard
              property={property}
              onImageClick={openModal}
              navigate={navigate}
              user={user}
              onAddToCart={(listingId, imageUrl, startX, startY) => {
                const animateToCart = () => {
                  const cartRect = cartRef.current?.getBoundingClientRect();
                  if (!cartRect) {
                    // Retry next frame
                    requestAnimationFrame(animateToCart);
                    return;
                  }

                 
                 setFlyToCart({
  listingId,
  imageUrl,
  startX,
  startY,
  endX: startX - (cartRect.left + cartRect.width / 2 - 20 - startX), // flip horizontally
  endY: cartRect.top + cartRect.height / 2 - 14,
});

                };

                requestAnimationFrame(animateToCart);
              }}

            />



          )}
        
      </div>

      {modalImages.length > 0 && (
        <ImageModal images={modalImages} currentIndex={modalIndex} onClose={closeModal} onNext={nextImage} onPrev={prevImage} />
      )}

      {flyToCart && (
        <motion.img
          src={flyToCart.imageUrl}
          initial={{
            top: flyToCart.startY,
            left: flyToCart.startX,
            width: 100,
            height: 70,
            position: "fixed",
            zIndex: 1000,
          }}
          animate={{
            top: flyToCart.endY,
            left: flyToCart.endX,
            width: 40,
            height: 28,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onAnimationComplete={() => setFlyToCart(null)}
          style={{ borderRadius: "8px" }}
        />
      )}


{addedToCart ? (
  <div
    style={{
      position: "fixed",
      bottom: "60px",
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
    <button
      className="btn btn-dark"
      disabled
      style={{
        width: "50%",
        background: "#F2C94C",
        color: "#000000ff",
        textAlign: "center",
        borderRadius: "10px",
        padding: "14px 0",
        zIndex: 1200,
        opacity: 0.8,
        marginBottom: "30px",
      }}
    >
      Added to Cart
    </button>
  </div>
) : (
  <div
    style={{
      position: "fixed",
      bottom: "60px",
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
   <button type="button" className="btn btn-dark"
      style={{
        width: "50%",
        background: "#707070ff",
        color: "#ffffff",
        textAlign: "center",
        borderRadius: "10px",
        padding: "14px 0",
        zIndex: 1200,
        marginBottom: "30px",
      }}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

      const rect = e.currentTarget.getBoundingClientRect();
      if (typeof onAddToCart === "function") {
        onAddToCart(property.listingId, images[0], rect.left, rect.top);
      }

      try {
        const storedUser = JSON.parse(localStorage.getItem("authUser"));
        let fetchedName = storedUser?.name || "";
        let fetchedPhone = storedUser?.phone || "";

        // 🔄 Refresh user info
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

        if (!fetchedName || !fetchedPhone) return;

        // ❗ Check duplicate
        const checkRes = await fetch(
          `${API_BASE}/leads/check?userId=${storedUser?.userId}&listingId=${property?.listingId}`
        );
        const checkData = await checkRes.json();

        if (checkData?.exists) {
          showInfo("Already saved in cart");
          setAddedToCart(true);
          return;
        }

        // ✅ Save lead
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
      }}
    >
      Add to Cart
    </button>
  </div>
)}




      <GlobalToaster />
    </div>
  );
}
