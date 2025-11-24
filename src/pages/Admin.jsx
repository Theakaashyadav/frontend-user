// property posting page for users
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../api";
import "./style/Admin.css";
import { GlobalToaster, showSuccess, showError, showInfo } from "../utils/toaster"
import ImageCropper from "../components/ImageCropper";


import { Edit3 } from "lucide-react"; // ✅ add this import at the top of your file



// ✅ Admin main component
export default function Admin() {
  const { token, user, login, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [previews, setPreviews] = useState([]);

  function onFiles(e) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setFiles(selected);

    // ✅ This line is crucial
    e.target.value = ""; // reset input so same files can trigger change again
  }



  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    bhk: "",
    location: "",
    price: "",
    type: "",
    tenant: "",
    furnishing: "",
    residence: "",
    availability: "",
    bedrooms: "",
    bathrooms: "",
    phone: "",
    userId: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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
 
 // Convenience wrappers
 const tracksaveProp = () =>trackEvent("saveProp");


  const [cropModal, setCropModal] = useState({
    open: false,
    index: null,
    imageSrc: null,
    allImages: [],
  });








  // ✅ Auto-fill phone & userId when user is loaded
  useEffect(() => {
    if (user) {
      setForm((s) => ({
        ...s,
        phone: user.phone || "",
        userId: user.userId || "",
      }));
    }
  }, [user]);

  // ✅ Fetch properties
  async function fetchList() {
    try {
      const res = await fetch(`${API_BASE}/properties?userId=${user.userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new showError("Unauthorized or fetch failed");
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }

  useEffect(() => {
    if (files?.length > 0) {
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setPreviews(newPreviews);

      return () => {
        newPreviews.forEach((url) => URL.revokeObjectURL(url));
      };
    } else {
      setPreviews([]);
    }
  }, [files]);









  useEffect(() => {
    if (user?.phone) fetchList();
  }, [user?.phone]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }



  // ✅ Submit function
  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData();

    // Ensure phone & userId are always included
    const fullForm = {
      ...form,
      userId: user.userId,
      phone: form.phone || user.phone, // 👈 guarantee phone value
    };

    // Append form fields
    for (const [k, v] of Object.entries(fullForm)) {
      fd.append(k, v);
    }

    // Append files
    files.forEach((f) => fd.append("images", f));

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/properties`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text(); // get server error message
        throw new showError(errorText || "Failed to create property");
      }

      await fetchList(); // Refresh list

      // ✅ Track save property event
      tracksaveProp();

      // 🚀 Toast for success
      showSuccess(" Property submitted successfully! It will be live soon.");


      // Reset form (keep auto-filled phone & userId)
      setForm({
        bhk: "",
        location: "",
        price: "",
        type: "",
        tenant: "",
        furnishing: "",
        residence: "",
        availability: "",
        bedrooms: "",
        bathrooms: "",
        phone: user?.phone || "",
        userId: user?.userId || "",
      });
      setFiles([]);
      e.target.reset();
    } catch (err) {
      showInfo(err.message || "❌ Something went wrong. Please try again.");

    } finally {
      setLoading(false);
    }
  }




  if (!user) return <div>Loading...</div>;
  return (
    <div className="container" style={{ padding: 16 }}>


      {/* ✅ Show logged-in user info
      <div style={{ marginBottom: "20px" }}>
        <h2>User Info</h2>
        <p>
          <strong>User ID:</strong> {user.userId}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
      </div> */}



      {/* Form */}
      <div className="card" style={{ margin: "16px 0", padding: 16 }}>
        <h1>Add Property</h1>

        {/* IMAGE PREVIEW HORIZONTAL GRID - HIGH QUALITY */}




        <form
          onSubmit={onSubmit}
          className="grid"
          style={{ display: "grid", gap: 12 }}
        >
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              name="phone"
              defaultValue={user.phone} // preset value
              onChange={(e) => {
                // ✅ Remove all spaces and non-digit characters
                const cleaned = e.target.value.replace(/\s+/g, "").replace(/\D/g, "");
                setForm({ ...form, phone: cleaned });
              }}
              required
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit phone number"
            />

            <input
              type="hidden"
              name="userId"
              value={user.userId}
            />
          </div>



          <div>
            <label>BHK</label>
            <select name="bhk" value={form.bhk} onChange={onChange} required>
              <option value="">Select BHK</option>
              <option>1 RK</option>
              <option>1 BHK</option>
              <option>2 BHK</option>
              <option>3 BHK</option>
              <option>4 BHK</option>
            </select>
          </div>

          <div>
            <label>Location</label>
            <input
              name="location"
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => {
                const raw = e.target.value;
                // Convert to Proper Case
                const formatted = raw
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase());
                onChange({ target: { name: "location", value: formatted } });
              }}
              required
            />
          </div>

          <div>
            <label>Price</label>
            <input
              type="number"
              placeholder="Price"
              name="price"
              value={form.price}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label>Type</label>
            <select name="type" value={form.type} onChange={onChange} required>
              <option value="">Select Type</option>
              <option>Flat</option>
              <option>PG</option>
              <option>Apartment</option>
              <option>Floor</option>
            </select>
          </div>

          <div>
            <label>Tanent Type</label>
            <select
              name="tenant"
              value={form.tenant}
              onChange={onChange}
              required
            >
              <option value="">Select Tanent Type</option>
              <option>Bachelor</option>
              <option>Family</option>
              <option>Girls</option>
              <option>Boys</option>
            </select>
          </div>

          <div>
            <label>Furnishing</label>
            <select
              name="furnishing"
              value={form.furnishing}
              onChange={onChange}
              required
            >
              <option value="">Select Furnishing</option>
              <option>Unfurnished</option>
              <option>Semi-furnished</option>
              <option>Furnished</option>
              <option>Fully furnished</option>
            </select>
          </div>

          <div>
            <label>Residence</label>
            <select
              name="residence"
              value={form.residence}
              onChange={onChange}
              required
            >
              <option value="">Select Residence</option>
              <option>Independent</option>
              <option>With Owner</option>
              <option>Sharing</option>
            </select>
          </div>

          <div>
            <label>Availablity</label>
            <select
              name="availability"
              value={form.availability}
              onChange={onChange}
              required
            >
              <option value="">Select Availablity</option>
              <option>Immediate</option>
              <option>5 Days</option>
              <option>10 Days</option>
              <option>15 Days</option>
              <option>30 Days</option>
            </select>
          </div>

          <div>
            <label>Bedrooms</label>
            <input
              type="number"
              placeholder="Bedrooms"
              name="bedrooms"
              value={form.bedrooms}
              onChange={onChange}
            />
          </div>
          <div>
            <label>Bathrooms</label>
            <input
              type="number"
              placeholder="Bathrooms"
              name="bathrooms"
              value={form.bathrooms}
              onChange={onChange}
            />
          </div>



          <div className="upload-section">
            <label htmlFor="images">Images</label>

            {files?.length > 0 && (
              <div className="image-preview-strip">

                {files.map((file, idx) => {
                  const preview = URL.createObjectURL(file);
                  const isActive = cropModal.open && cropModal.index === idx;

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: "0 0 auto",
                        width: isActive ? 160 : 140,
                        height: isActive ? 160 : 140,
                        position: "relative",
                        borderRadius: 10,
                        overflow: "hidden",
                        border: isActive
                          ? "2px solid #00ffb3"
                          : "1px solid rgba(200,200,200,0.5)",
                        boxShadow: isActive
                          ? "0 4px 10px rgba(0,255,180,0.3)"
                          : "0 2px 8px rgba(0,0,0,0.2)",
                        transform: isActive ? "translateY(-6px)" : "none",
                        transition: "all 0.25s ease",
                        scrollSnapAlign: "center", // ✅ ensures centered scroll for active item
                      }}
                    >
                      {/* 🖼 Image Preview */}
                      <img
                        src={preview}
                        alt={`preview-${idx}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          userSelect: "none",
                          opacity: isActive ? 1 : 0.9,
                        }}
                        onLoad={() => URL.revokeObjectURL(preview)} // ✅ Clean memory
                        onClick={() =>
                          cropModal.open &&
                          setCropModal((prev) => ({
                            ...prev,
                            index: idx,
                            imageSrc: preview,
                          }))
                        } // ✅ allow tap to switch crop target while modal open
                      />

                      {/* 🗑 Delete Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, i) => i !== idx))
                        }
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          fontSize: 16,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Delete image"
                      >
                        ×
                      </button>

                      {/* ✏️ Crop Button */}
                      {/* ✏️ Crop Button (top-left) */}
                      {/* ✏️ Crop Button (top-left) */}
                      <button
                        type="button"
                        onClick={() => {
                          setCropModal({
                            open: true,
                            index: idx,
                            imageSrc: previews[idx],
                            allImages: previews, // use preview URLs
                          });
                        }}
                        style={{
                          position: "absolute",
                          top: -3,
                          left: 0,
                          background: "rgba(0,0,0,0.7)",
                          color: "#00ffb3",
                          border: "none",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          fontSize: 16,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
                          transition: "all 0.25s ease",
                          zIndex: 5,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "rgba(0,0,0,0.85)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "rgba(0,0,0,0.7)")
                        }
                        title="Crop image"
                      >
                        <Edit3 size={22} strokeWidth={2.2} />
                      </button>


                    </div>
                  );
                })}
              </div>
            )}


            <label htmlFor="images" className="custom-upload"> Choose Images</label>
            <input
              id="images"
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={onFiles} // ✅ same name as the top function
            />


            <button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Save Property"}
            </button>
          </div>

        </form>
      </div>

      <GlobalToaster />
      <ImageCropper
        cropModal={cropModal}
        setCropModal={setCropModal}
        files={files}
        setFiles={setFiles}
      />



    </div>
  );
}

