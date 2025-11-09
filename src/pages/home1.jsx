import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "../api";
import "./style/1.css";
import { useNavigate } from "react-router-dom";


function ProductCard({ property, onDelete, onImageClick, navigate, user }) {
  const images = property.imageUrls || property.images || [];
  const fallbackImage = "https://via.placeholder.com/400x250?text=No+Image";
  const sessionId = localStorage.getItem("sessionId");

  const handleContactClick = () => {
    if (!property || !property._id) return;
    navigate(`/contact/${property.listingId}`);
  };

  return (
    <motion.div
      className="listing relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.03 }}
    >
      {property.listingId && (
        <div className="listing-id-badge absolute top-2 left-2 bg-yellow-400 text-xs font-semibold px-3 py-1 rounded-lg shadow">
          ID: {property.listingId}
        </div>
      )}

      <img
        src={images[0] || fallbackImage}
        alt={property.location || "Property"}
        className="w-full h-56 object-cover cursor-pointer"
        onClick={() => images.length && onImageClick(images)}
      />

      <div className="features flex flex-wrap items-center justify-start gap-3 px-4 py-3 bg-gray-50 border-t">
        {property.price && (
          <div className="feature-item text-sm flex items-center gap-1">
            <i className="fas fa-tag text-yellow-500"></i>
            <strong>₹{Number(property.price).toLocaleString()}</strong>
          </div>
        )}
        {property.bhk && (
          <div className="feature-item text-sm flex items-center gap-1">
            <i className="fas fa-home text-yellow-500"></i> {property.bhk}
          </div>
        )}
        {property.type && (
          <div className="feature-item text-sm flex items-center gap-1">
            <i className="fas fa-building text-yellow-500"></i> {property.type}
          </div>
        )}
        {property.tenant && (
          <div className="feature-item text-sm flex items-center gap-1">
            <i className="fas fa-user text-yellow-500"></i> {property.tenant}
          </div>
        )}
      </div>

      <div className="listing-details p-5">
        <h3
          className="text-lg font-semibold text-gray-800 mb-2 truncate"
          title={property.location || ""}
        >
          {property.location || ""}
        </h3>
      </div>
    </motion.div>
  );
}

const LandingPage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();


  async function fetchList(applyRandom = true) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/properties`);
      const data = await res.json();
      const finalList = applyRandom
        ? [...data].sort(() => Math.random() - 0.5)
        : data;

      setFeaturedProperties(finalList.slice(0, 10));
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  const handleImageClick = (images) => console.log("Clicked:", images);

  return (
    <div className="landing-page font-sans bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* 🌟 Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-32 px-6 hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 rounded-2xl"></div>
        <div className="relative z-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white"
          >
            Find Your Dream Home
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-lg md:text-xl text-gray-200"
          >
            Explore verified listings across top locations
          </motion.p>

          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate("/", { state: { searchLocation: searchQuery.trim() } });
              } else {
                navigate("/");
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-3"
          >
            <input
              type="text"
              placeholder="Enter Location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 w-full sm:w-80 p-3 rounded-lg text-black outline-none border border-gray-300 focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all"
            >
              Search
            </button>
          </motion.form>

        </div>
      </section>

      {/* 🏘 Featured Properties - Single Row Scroll */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Featured <span className="text-yellow-500">Properties</span>
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading properties...</p>
        ) : (
          <div className="listings">
            {featuredProperties.map((property, i) => (
              <ProductCard
                key={property._id || i}
                property={property}
                onImageClick={handleImageClick}
                navigate={() => console.log("Navigate", property.listingId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ✨ Footer */}
      <footer className="py-10 px-6 text-center bg-[#111] text-gray-300">
        <p>&copy; {new Date().getFullYear()} PropList. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <a href="#" className="hover:text-yellow-400">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-yellow-400">
            Terms & Conditions
          </a>
          <a href="#" className="hover:text-yellow-400">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
