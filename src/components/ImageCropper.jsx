import React, { useState, useEffect, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import getCroppedImg from "../utils/cropImage";

export default function ImageCropper({ cropModal, setCropModal, files, setFiles }) {
  const [crop, setCrop] = useState({ unit: "px", x: 0, y: 0, width: 100, height: 100 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // ✅ for image move independent of crop



  const [touchData, setTouchData] = useState(null);

  useEffect(() => {
    if (cropModal.open && cropModal.imageSrc) {
      // Wait a tiny bit to ensure image/container is loaded
      setTimeout(() => {
        const container = containerRef.current?.getBoundingClientRect() || img.parentElement.getBoundingClientRect();

        if (container) {
          const cropWidth = container.width * 0.5;
          const cropHeight = container.height * 0.5;
          const x = (container.width - cropWidth) / 2;
          const y = (container.height - cropHeight) / 2;

          setCrop({
            unit: "px",
            x,
            y,
            width: cropWidth,
            height: cropHeight,
          });
        } else {
          setCrop({ unit: "px", x: 0, y: 0, width: 300, height: 300 }); // fallback
        }
        setDimensions(null);
        setScale(1);
      }, 50);
    }
  }, [cropModal.imageSrc]);


  const closeCropper = () => setCropModal({ open: false, index: null, imageSrc: null });

  const handleCropSave = async () => {
    try {
      if (!imgRef.current || !croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(imgRef.current, croppedAreaPixels);
      const blob = await fetch(croppedImage).then((res) => res.blob());
      const newFile = new File([blob], files[cropModal.index].name, {
        type: "image/jpeg",
      });

      // ✅ Create updated array
      const updated = files.map((f, i) =>
        i === cropModal.index ? newFile : f
      );

      // ✅ Trigger re-render & preview regeneration
      setFiles([...updated]); // 💥 this is the key line

      // ✅ Close modal
      closeCropper();
    } catch (err) {
      console.error("Crop failed", err);
    }
  };


  // ✅ Auto-shrink image so it fits entirely inside cropper area
  const handleImageLoad = (e) => {
    const img = e.target;
    const container = img.parentElement.getBoundingClientRect();
    const scaleFactor = Math.min(
      container.width / img.naturalWidth,
      container.height / img.naturalHeight,
      1
    );
    setScale(scaleFactor);
  };

  // ✅ Handle multitouch pinch-to-zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      setTouchData({ initialDist: dist, initialScale: scale });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchData) {
      const newDist = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = newDist / touchData.initialDist;
      let newScale = touchData.initialScale * scaleChange;
      newScale = Math.min(Math.max(newScale, 0.5), 3); // limit zoom range
      setScale(newScale);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => setTouchData(null);

  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  if (!cropModal.open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.9)", // ✅ slightly see-through black
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        overflow: "hidden",
        touchAction: "none", // prevent browser pinch zoom
      }}
    >

      <div
        style={{
          position: "relative",
          width: "100vw",
          maxWidth: "600px",
          height: "100vh",
          background: "transparent",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 0",
          margin: "0 auto",
          zIndex: 10000,
        }}
      >


        {/* 🖼 Crop Area */}
        <div
          ref={containerRef}
          style={{
            flex: "1 1 auto",
            width: "100%",
            height: "100vh", // ✅ leaves space for thumbnails & buttons
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            background: "#000",
            borderRadius: 0,
            zIndex: 10,
            touchAction: "none",
            boxSizing: "border-box",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        ><ReactCrop
          crop={crop}
          onChange={(c) => {
            setCrop(c);
            if (c.width && c.height)
              setDimensions({
                width: Math.round(c.width),
                height: Math.round(c.height),
              });
          }}
          onComplete={(pixelCrop) => {
            if (pixelCrop?.width && pixelCrop?.height)
              setCroppedAreaPixels(pixelCrop);
          }}
          ruleOfThirds
          keepSelection
          style={{ width: "100%", height: "100%" }}
          // ✅ only allow move when drag starts inside crop box
          onMouseDown={(e) => {
            const cropBox = document.querySelector(".ReactCrop__crop-selection");
            if (!cropBox || !cropBox.contains(e.target)) {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              const cropBox = document.querySelector(".ReactCrop__crop-selection");
              if (!cropBox || !cropBox.contains(e.target)) {
                // ✅ prevent crop from moving on single tap outside crop area
                e.stopPropagation();
                e.preventDefault();
              }
            }
          }}
        >
            <img
              ref={imgRef}
              src={cropModal.imageSrc}
              alt="Crop"
              onLoad={handleImageLoad}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, // ✅ pan instead of crop
                transformOrigin: "center center",
                userSelect: "none",
                WebkitUserDrag: "none",
                touchAction: "none",
                cursor: "grab",
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startPan = { ...pan };
                const moveHandler = (e2) => {
                  const dx = (e2.clientX - startX) / scale;
                  const dy = (e2.clientY - startY) / scale;
                  setPan({
                    x: startPan.x + dx,
                    y: startPan.y + dy,
                  });
                };
                const upHandler = () => {
                  window.removeEventListener("mousemove", moveHandler);
                  window.removeEventListener("mouseup", upHandler);
                };
                window.addEventListener("mousemove", moveHandler);
                window.addEventListener("mouseup", upHandler);
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  const touch = e.touches[0];
                  setTouchData({
                    ...touchData,
                    dragStart: { x: touch.clientX, y: touch.clientY },
                    panStart: { ...pan },
                  });
                } else if (e.touches.length === 2) {
                  // ✅ Stop ReactCrop from handling pinch zoom (fix flicker)
                  e.stopPropagation();
                  e.preventDefault();

                  const dist = getDistance(e.touches[0], e.touches[1]);
                  setTouchData({ initialDist: dist, initialScale: scale });
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 1 && touchData?.dragStart) {
                  const touch = e.touches[0];
                  const dx = (touch.clientX - touchData.dragStart.x) / scale;
                  const dy = (touch.clientY - touchData.dragStart.y) / scale;
                  setPan({
                    x: touchData.panStart.x + dx,
                    y: touchData.panStart.y + dy,
                  });
                  e.preventDefault();
                } else if (e.touches.length === 2 && touchData?.initialDist) {
                  e.stopPropagation();
                  e.preventDefault();

                  const newDist = getDistance(e.touches[0], e.touches[1]);
                  const scaleChange = newDist / touchData.initialDist;
                  let newScale = touchData.initialScale * scaleChange;
                  newScale = Math.min(Math.max(newScale, 0.5), 3);
                  setScale(newScale);
                }
              }}
              onTouchEnd={() => setTouchData(null)}
            />
          </ReactCrop>


          {/* 📏 Live dimension label */}
          {dimensions && (
            <div
              style={{
                position: "absolute",
                top: `${crop?.y || 0}px`,
                left: `${crop?.x || 0}px`,
                transform: "translate(4px, -28px)",
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "13px",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 10,
              }}
            >
              {dimensions.width} × {dimensions.height}px
            </div>
          )}
        </div>

        {/* 🖼 Thumbnails Strip */}
        {cropModal.allImages?.length > 1 && (
          <div
  className="thumbnail-strip"
  style={{
              position: "fixed",
              bottom: "80px", // keeps it above the button bar
              left: 0,
              width: "100%",
              display: "flex",
              overflowX: "auto",
              gap: "8px",
              padding: "10px 0",
              justifyContent: "center",
              alignItems: "flex-end",
              background: "transparent", // ✅ fully transparent background
              backdropFilter: "none",    // ✅ no blur or overlay
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              zIndex: 10001, // ✅ above the dark background, below buttons
              // below button bar

              
            }}
          >
            {cropModal.allImages.map((img, index) => {
              const isActive = cropModal.index === index;
              return (
                <img
                  key={index}
                  src={img}
                  alt={`thumb-${index}`}
                  onClick={() =>
                    setCropModal((prev) => ({
                      ...prev,
                      index,
                      imageSrc: img,
                    }))
                  }
                  style={{
                    height: isActive ? "70px" : "55px",
                    width: "auto",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: isActive
                      ? "2px solid #00ffb3"
                      : "1px solid rgba(255,255,255,0.4)",
                    transition: "all 0.2s ease",
                    opacity: isActive ? 1 : 0.7,
                    transform: isActive ? "translateY(-4px)" : "translateY(0)",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 🔘 Buttons */}
        <div
          style={{
            position: "fixed",          // ✅ stays fixed at bottom
            bottom: 0,                  // ✅ aligns to bottom edge
            left: 0,
            width: "100%",              // ✅ full width on all devices
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            padding: "10px 0",          // ✅ spacing for touch targets
            background: "rgba(0, 0, 0, 0.6)", // ✅ translucent overlay look
            backdropFilter: "blur(6px)", // ✅ nice glass effect on modern browsers
            zIndex: 20,                 // ✅ stays above other UI
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleCropSave}
            style={{
              background: "#28a745",
              color: "#fff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Save Crop
          </button>
          <button
            onClick={closeCropper}
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* ✨ Styling overrides */}
      <style>
        {`
    /* ✅ Make crop handles bigger and easier to grab */
    .ReactCrop__drag-handle {
      width: 22px !important;
      height: 22px !important;
      border: 3px solid #00ffb3 !important; /* bold neon green border */
      background: rgba(0, 0, 0, 0.4) !important;
      border-radius: 50% !important; /* make them circular */
      box-shadow: 0 0 6px rgba(0, 255, 179, 0.8) !important;
      cursor: grab !important;
    }

    /* When dragging */
    .ReactCrop__drag-handle:active {
      background: rgba(0, 255, 179, 0.8) !important;
      box-shadow: 0 0 10px rgba(0, 255, 179, 1) !important;
    }

    /* ✅ Make crop box border thicker and more visible */
    .ReactCrop__crop-selection {
      border: 3px solid rgba(0, 255, 179, 0.8) !important;
      box-shadow: 0 0 10px rgba(0, 255, 179, 0.4) inset !important;
    }

    @media (max-width: 480px) {
      div[style*="maxWidth: 600px"] {
        width: 100% !important;
        height: 75vh !important;
      }
      div[style*="overflow-x: auto"] img {
        height: 50px !important;
      }
      /* Slightly smaller handles for mobile */
      .ReactCrop__drag-handle {
        width: 18px !important;
        height: 18px !important;
        border-width: 2px !important;
      }
    }
     @media (max-height: 700px) {
  .thumbnail-strip {
    bottom: 300px !important; /* raises strip slightly on shorter screens */
  }
}

@media (max-width: 480px) {
  .thumbnail-strip img {
    height: 55px !important;
  }
  .thumbnail-strip {
    bottom: 100px !important;
  }
}

  `}
      </style>

    </div>
  );
}
