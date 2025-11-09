// File: src/components/SkeletonLoader.jsx
import React from "react";

export default function SkeletonLoader({ page = "home", count = 8 }) {
  if (page === "contact") {
    return (
      <>
        <div className="skeleton-contact-page">
          {/* Simulate one property preview card */}
          <div className="skeleton-property">
            <div className="skeleton-img"></div>
            <div className="skeleton-text long"></div>
            <div className="skeleton-text short"></div>
          </div>

          {/* Step cards */}
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="skeleton-step-card">
              <div className="skeleton-text long"></div>
              <div className="skeleton-text short"></div>
              <div className="skeleton-img small"></div>
            </div>
          ))}
        </div>

        <style>{`
        .skeleton-contact-page {
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 28px; /* ✅ Increased space between cards */
          box-sizing: border-box;
        }

        .skeleton-property,
        .skeleton-step-card {
          background: #fff;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
          animation: fadePulse 1.6s infinite ease-in-out;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-img {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 10px;
        }

        .skeleton-img.small {
          height: 110px;
        }

        .skeleton-text {
          height: 16px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          border-radius: 6px;
          animation: shimmer 1.5s infinite linear;
        }

        .skeleton-text.short { width: 60%; }
        .skeleton-text.long { width: 90%; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes fadePulse {
          0% { opacity: 1; }
          50% { opacity: 0.85; }
          100% { opacity: 1; }
        }

        /* ✅ Tablet screens */
        @media (max-width: 768px) {
          .skeleton-contact-page {
            padding: 20px 16px;
            gap: 24px;
          }
          .skeleton-img {
            height: 160px;
          }
          .skeleton-img.small {
            height: 100px;
          }
          .skeleton-text {
            height: 14px;
          }
        }

        /* ✅ Mobile screens */
        @media (max-width: 480px) {
          .skeleton-contact-page {
            padding: 16px 12px;
            gap: 20px; /* ✅ more space even on mobile */
          }
          .skeleton-property,
          .skeleton-step-card {
            padding: 12px;
            border-radius: 10px;
            gap: 10px;
          }
          .skeleton-img {
            height: 130px;
          }
          .skeleton-img.small {
            height: 80px;
          }
          .skeleton-text {
            height: 12px;
          }
          .skeleton-text.short { width: 70%; }
          .skeleton-text.long { width: 100%; }
        }

        /* ✅ Ultra-small devices */
        @media (max-width: 360px) {
          .skeleton-contact-page {
            padding: 12px 8px;
            gap: 16px;
          }
          .skeleton-img {
            height: 110px;
          }
          .skeleton-img.small {
            height: 70px;
          }
        }
      `}</style>
      </>
    );
  }

  if (page === "user") {
    return (
      <>
        <div className="skeleton-properties-wrapper">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-property-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-text long"></div>
              <div className="skeleton-text short"></div>
              <div className="skeleton-badge"></div>
            </div>
          ))}
        </div>

        <style>{`
        .skeleton-properties-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
          padding: 20px;
          max-width: 1200px;
          margin-inline: auto;
        }

        .skeleton-property-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
          animation: fadePulse 1.6s infinite ease-in-out;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-img {
          width: 100%;
          height: 180px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 10px;
        }

        .skeleton-text {
          height: 16px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          border-radius: 6px;
          animation: shimmer 1.5s infinite linear;
        }

        .skeleton-text.long { width: 90%; }
        .skeleton-text.short { width: 60%; }

        .skeleton-badge {
          width: 80px;
          height: 20px;
          border-radius: 20px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
          align-self: flex-end;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes fadePulse {
          0% { opacity: 1; }
          50% { opacity: 0.85; }
          100% { opacity: 1; }
        }

        /* ✅ Tablets */
        @media (max-width: 1024px) {
          .skeleton-properties-wrapper {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
          }
        }

        /* ✅ Mobiles (2 columns) */
        @media (max-width: 768px) {
          .skeleton-properties-wrapper {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px;
            padding: 16px;
          }

          .skeleton-img {
            height: 160px;
          }

          .skeleton-text {
            height: 14px;
          }
        }

        /* ✅ Small phones */
        @media (max-width: 480px) {
          .skeleton-properties-wrapper {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 12px;
          }

          .skeleton-img {
            height: 140px;
          }

          .skeleton-text {
            height: 12px;
          }

          .skeleton-badge {
            height: 16px;
            width: 70px;
          }
        }

        /* ✅ Ultra-small screens */
        @media (max-width: 360px) {
          .skeleton-properties-wrapper {
            gap: 8px;
          }

          .skeleton-img {
            height: 130px;
          }
        }
      `}</style>
      </>
    );
  }



  if (page === "userOrders") {
    return (
      <>
        <div className="skeleton-user-orders">
          {/* --- Title --- */}
          <div className="skeleton-text title"></div>

          {/* --- Listing Skeleton (Right on Desktop, Center on Mobile) --- */}
          <div className="skeleton-listings-wrapper">
            <div className="skeleton-listings">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-listing">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-details">
                    <div className="skeleton-text short"></div>
                    <div className="skeleton-text long"></div>
                    <div className="skeleton-text short"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Table Skeleton --- */}
          <div className="skeleton-table-container">
            <div className="skeleton-table">
              <div className="skeleton-table-header">
                {["Name", "Listing ID", "Status", "Created", "Actions"].map((h, i) => (
                  <div key={i} className="skeleton-text table-col"></div>
                ))}
              </div>

              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-table-row">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <div key={j} className="skeleton-text table-cell"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
        .skeleton-user-orders {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }

        /* --- Listing Section Positioned Right --- */
        .skeleton-listings-wrapper {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 20px;
          padding-right: 100px;
          transition: all 0.3s ease;
        }

        .skeleton-listings {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          justify-items: center;
          width: 100%;
          max-width: 900px;
        }

        .skeleton-listing {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          width: 100%;
          animation: fadePulse 1.6s infinite ease-in-out;
        }

        .skeleton-img {
          width: 100%;
          height: 180px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }

        .skeleton-details {
          padding: 12px 16px;
        }

        .skeleton-text {
          height: 14px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          border-radius: 8px;
          margin-bottom: 10px;
          animation: shimmer 1.5s infinite linear;
        }

        .skeleton-text.short { width: 60%; }
        .skeleton-text.long { width: 90%; }
        .skeleton-text.title { width: 200px; height: 24px; border-radius: 6px; }

        /* --- Table Skeleton --- */
        .skeleton-table-container {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: thin;
        }

        .skeleton-table {
          display: flex;
          flex-direction: column;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          width: 100%;
          min-width: 600px; /* allows scrolling on mobile */
          animation: fadePulse 1.6s infinite ease-in-out;
        }

        .skeleton-table-header,
        .skeleton-table-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          padding: 12px 16px;
          min-width: 600px;
        }

        .skeleton-table-header {
          background: #1b1d3a10;
        }

        .table-col, .table-cell {
          height: 14px;
        }

        /* --- Animations --- */
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes fadePulse {
          0% { opacity: 1; }
          50% { opacity: 0.85; }
          100% { opacity: 1; }
        }

        /* --- Responsive --- */
        @media (max-width: 1024px) {
          .skeleton-listings-wrapper {
            padding-right: 40px;
          }
        }

        @media (max-width: 768px) {
          .skeleton-listings-wrapper {
            justify-content: center;
            padding-right: 0;
          }
          .skeleton-listings {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          }
          .skeleton-img { height: 140px; }
          .skeleton-table {
            min-width: 500px;
          }
        }

        @media (max-width: 480px) {
          .skeleton-user-orders { padding: 12px; gap: 16px; }
          .skeleton-listings-wrapper {
            justify-content: center;
            padding-right: 0;
          }
          .skeleton-img { height: 120px; }
          .skeleton-listings {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }
          .skeleton-table {
            min-width: 420px;
          }
          .skeleton-table-header, .skeleton-table-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
      </>
    );
  }



  // ======================
  // Default: Home listings
  // ======================
  return (
    <>
      <div className="skeleton-listings">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-listing">
            <div className="skeleton-img"></div>
            <div className="skeleton-details">
              <div className="skeleton-text short"></div>
              <div className="skeleton-text long"></div>
              <div className="skeleton-text short"></div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .skeleton-listings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}
        .skeleton-listing {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          animation: fadePulse 1.6s infinite ease-in-out;
        }
        .skeleton-img {
          width: 100%;
          height: 180px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        .skeleton-details { padding: 12px 16px; flex: 1; }
        .skeleton-text {
          height: 14px;
          background: linear-gradient(90deg, #e3e3e3 25%, #f0f0f0 50%, #e3e3e3 75%);
          background-size: 200% 100%;
          border-radius: 8px;
          margin-bottom: 10px;
          animation: shimmer 1.5s infinite linear;
        }
        .skeleton-text.short { width: 60%; }
        .skeleton-text.long { width: 90%; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadePulse {
          0% { opacity: 1; }
          50% { opacity: 0.85; }
          100% { opacity: 1; }
        }
          /* ✅ match home page breakpoints */
@media (max-width: 1199px) {
  .skeleton-listings {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    max-width: 100%;
  }
}
@media (max-width: 1024px) {
  .skeleton-listings {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}
@media (max-width: 767px) {
  .skeleton-listings {
    grid-template-columns: repeat(2, 1fr); /* ✅ 2 per row like listings */
    gap: 12px;
  }
}
@media (max-width: 480px) {
  .skeleton-listings {
    grid-template-columns: repeat(2, 1fr); /* ✅ still 2 per row */
    gap: 10px;
  }
}
      `}</style>
    </>
  );
}
