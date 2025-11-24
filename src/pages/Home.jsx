// File: Home.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { API_BASE } from "../api";
import "./style/Home.css";
import PropertyFilter from "../components/property_filter";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import ImageModal from "../components/ImageModal";
import SkeletonLoader from "../components/SkeletonLoader";


/* ==============================
   🔹 Analytics Utility (Simplified)
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

// Convenience wrappersq
export const trackpageViews = () => trackEvent("pageViews");
export const trackImageClick = () => trackEvent("image");
export const trackhandleContactClick = () => trackEvent("details");


/* ==============================
   🔹 ProductCard Component
============================== */
function ProductCard({ property, onDelete, onImageClick, navigate, user }) {
  const images = property.imageUrls || property.images || [];
  const fallbackImage = "https://via.placeholder.com/400x250?text=No+Image";
  const sessionId = localStorage.getItem("sessionId");

  const handleContactClick = () => {
    if (!property || !property._id) return;
    trackhandleContactClick(); // ✅ track
    navigate(`/contact/${property.listingId}`);
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
          if (images.length) {
            trackImageClick(); // ✅ track
            onImageClick(images);
          }
        }}
      />
      {/* ✅ merged both feature sections into one clean row */}
      <div className="features">
        {property.price && (
          <div className="feature-item">
            <i className="fas fa-tag"></i>{" "}
            <strong>₹{Number(property.price).toLocaleString()}</strong>
          </div>
        )}
        {property.bhk && (
          <div className="feature-item">
            <i className="fas fa-home"></i> {property.bhk}
          </div>
        )}
        {property.type && (
          <div className="feature-item">
            <i className="fas fa-building"></i> {property.type}
          </div>
        )}

        {property.tenant && (
          <div className="feature-item">
            <i className="fas fa-user"></i> {property.tenant}
          </div>
        )}
      </div>

      <div className="listing-details">
        <div className="feature-item">
          <h3> {property.location || ""}</h3>
        </div>

        <button className="get-contact-btn" onClick={handleContactClick}>
          View Details
        </button>
      </div>
    </div>
  );
}

/* ==============================
   🔹 Home Component
============================== */
export default function Home() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toastShown = useRef(false);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasFetched = useRef(false); // ✅ prevents multiple fetch calls (even in Strict Mode)


  useEffect(() => {
    if (!toastShown.current && location.state?.toastMessage) {
      const type = location.state.toastType || "success";
      toast[type](location.state.toastMessage);
      toastShown.current = true;

      // Remove toastMessage from state to prevent re-showing on back/forward
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);




  async function fetchList(applyRandom = true) {
    if (hasFetched.current) return; // ✅ ensures fetch runs only once
    hasFetched.current = true;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/properties`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();

      // ✅ Randomize only if requested
      const finalList = applyRandom
        ? [...data].sort(() => Math.random() - 0.5)
        : data;

      // ✅ Safe state updates
      setList(finalList);
      setFilteredList(finalList);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }







  // Delete property
  async function onDelete(id) {
    if (!window.confirm("Delete this property?")) return;
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setFilteredList(filteredList.filter((p) => p._id !== id));
    } else {
      alert("Delete failed");
    }
  }



  // Track page view on load / user change
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    trackpageViews(sessionId, user?._id);
    fetchList(); // ✅ add this line
  }, [user]);


  // Modal handlers
  function openModal(images) {
    setModalImages(images);
    setModalIndex(0);
    setIsModalOpen(true);      // open modal
    setShowFilterPanel(false);  // hide filter panel when modal opens
  }

  function closeModal() {
    setModalImages([]);
    setModalIndex(0);
    setIsModalOpen(false); // ensure modal state is false
    setShowFilterPanel(false); // optional: close filter panel when modal closes
  }

  function prevImage() {
    setModalIndex((modalIndex - 1 + modalImages.length) % modalImages.length);
  }
  function nextImage() {
    setModalIndex((modalIndex + 1) % modalImages.length);
  }

  // Filter handler
  function handleFilter(results) {
    if (!results || results.length === 0) {
      setFilteredList([]);
      return;
    }
    const resultIds = new Set(results.map((r) => r._id));
    const unmatched = list.filter((item) => !resultIds.has(item._id));
    setFilteredList([...results, ...unmatched]);
  }
  useEffect(() => {
    const searchText = location.state?.searchLocation?.trim().toLowerCase() || "";

    // If no search, just randomize list
    if (!searchText) {
      const randomList = [...list].sort(() => Math.random() - 0.5);
      setFilteredList(randomList);
      return;
    }

    // ✅ Step 1: Find matched properties
    const matched = list.filter((p) => {
      const locationMatch = p.location?.toLowerCase().includes(searchText);
      const addressMatch = p.address?.toLowerCase().includes(searchText);
      const typeMatch = p.type?.toLowerCase().includes(searchText);
      return locationMatch || addressMatch || typeMatch;
    });

    // ✅ Step 2: Non-matched properties (shown after matches)
    const nonMatched = list.filter((p) => !matched.includes(p));

    // ✅ Step 3: Merge them (matched first, others later)
    const combined = [...matched, ...nonMatched];

    // ✅ Step 4: Apply directly (no repeat)
    setFilteredList(combined);
  }, [location.state, list]);



  return (
    <div className="home-page">
      <div className="home-container">
        {/* Toggle Filter */}
        {!isModalOpen && (
          <div
            className={`filter-toggle ${showFilterPanel ? "active" : ""}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <span className="arrow">➤</span>
          </div>
        )}

        {/* Sliding Filter Panel */}
        <div className={`filter-panel ${showFilterPanel ? "open" : ""}`}>
          <PropertyFilter
            list={list}
            onFilter={(filters) => {
              handleFilter(filters);
              setShowFilterPanel(false);
            }}
            onClose={() => setShowFilterPanel(false)}
          />
        </div>

        {loading ? (
          <SkeletonLoader count={9} />
        ) : (
          <div className="listings">
            {filteredList.length === 0 ? (
              <p className="no-data"></p>
            ) : (
              Array.from(
                { length: Math.ceil(1000 / filteredList.length) },
                () => filteredList
              )
                .flat()
                .slice(0, 1000)
                .map((p, index) => (
                  <ProductCard
                    key={`${p._id}-${index}`}
                    property={p}
                    onDelete={onDelete}
                    onImageClick={openModal}
                    user={user}
                    navigate={navigate}
                  />
                ))
            )}
          </div>
        )}

        {isModalOpen && modalImages.length > 0 && (
          <ImageModal
            images={modalImages}
            currentIndex={modalIndex}
            onClose={closeModal}
            onNext={nextImage}
            onPrev={prevImage}
          />
        )}


      </div>

      {/* 🔔 Toast container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: "8px",
            padding: "16px",
            color: "#fff",
            fontWeight: "1000",
            marginTop: "3rem",
          },
          success: { duration: 4000, style: { background: "green" }, iconTheme: { primary: "#fff", secondary: "green" } },
          error: { duration: 4000, style: { background: "red" }, iconTheme: { primary: "#fff", secondary: "red" } },
        }}
      />
    </div>
  );

}
