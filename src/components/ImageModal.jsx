import React, { useRef, useState, useEffect } from "react";

export default function ImageModal({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) {
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSrc, setActiveSrc] = useState(images?.[currentIndex] || "");

  if (!images || images.length === 0) return null;

  // --- Load image ---
  useEffect(() => {
    if (!images || !images[currentIndex]) return;
    const img = new Image();
    setIsLoading(true);

    img.src = images[currentIndex];
    img.onload = () => {
      setActiveSrc(images[currentIndex]);
      setIsLoading(false);
    };
  }, [currentIndex, images]);

  // --- Swipe handlers ---
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? onNext() : onPrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <>
      <style>{`
        .modal {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.85);
          overflow: hidden;
        }

        .modal-image-wrapper {
          position: relative;
          width: 95%;
          max-width: 700px;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 16px;
          user-select: none;
          -webkit-user-drag: none;
          opacity: 1;
          transition: opacity 0.4s ease;
        }

        /* Skeleton loader with icon */
        .skeleton {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
          background-size: 400% 100%;
          animation: shimmer 1.2s ease-in-out infinite;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        /* Centered image icon */
        .skeleton-icon {
          width: 60px;
          height: 60px;
          opacity: 0.6;
          fill: #ccc;
        }

        .dots-container {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }
        .dot {
          width: 8px;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transition: all 0.3s;
        }
        .dot.active {
          width: 14px;
          height: 14px;
          background-color: white;
        }

        .close-btn {
  position: absolute;
  top: 5px;
  right: 5px;

  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.4);

  color: white;
  font-size: 1.8rem;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  cursor: pointer;

  transition: background 0.3s;
}

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .prev,
        .next {
          cursor: pointer;
          position: absolute;
          top: 50%;
          font-size: 2rem;
          color: #fff;
          padding: 8px 16px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.4);
          transform: translateY(-50%);
          user-select: none;
        }
        .prev { left: 10px; }
        .next { right: 10px; }

        @media (max-width: 768px) {
  .close-btn {
    width: 32px;
    height: 32px;
    font-size: 1.5rem;
  }
}

          .prev, .next { display: none !important; }
          .skeleton-icon {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>

      <div className="modal" onClick={onClose}>
        <div
          className="modal-image-wrapper"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className="close-btn" onClick={onClose}>
            &times;
          </span>

          {/* Skeleton with icon */}
          {isLoading && (
            <div className="skeleton">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="skeleton-icon"
              >
                <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM8.5 11.5A2.5 2.5 0 1 1 11 9a2.5 2.5 0 0 1-2.5 2.5ZM5 19l4-5 3 4 5-6 4 7Z" />
              </svg>
            </div>
          )}

          {!isLoading && (
            <img
              src={activeSrc}
              alt="Property"
              className="modal-content"
              style={{ opacity: isLoading ? 0 : 1 }}
            />
          )}

          {images.length > 1 && (
            <>
              <span
                className="prev"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
              >
                &#10094;
              </span>
              <span
                className="next"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
              >
                &#10095;
              </span>
            </>
          )}

          {images.length > 1 && (
            <div className="dots-container">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i === currentIndex ? "active" : ""}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
