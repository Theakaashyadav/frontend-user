import { useState, useEffect } from "react";

export default function PropertyFilter({ list = [], onFilter = () => { } }) {
  const [filters, setFilters] = useState({
    bhk: "",
    location: "",
    price: "",
    type: "",
    tenant: "",
    furnishing: "",
    residence: "",
    availability: "",
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  // ✅ Update handleChange to accept (name, value)
  const handleChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Apply filters with fallback
  const handleApply = () => {
    let results = [...list];

    // --- Exact filters ---
    if (filters.bhk) {
      results = results.filter((p) => p.bhk === filters.bhk);
    }
    if (filters.location) {
      results = results.filter((p) =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.price) {
      results = results.filter((p) => p.price <= Number(filters.price));
    }
    if (filters.type) {
      results = results.filter((p) => p.type === filters.type);
    }
    if (filters.tenant) {
      results = results.filter((p) => p.tenant === filters.tenant);
    }
    if (filters.furnishing) {
      results = results.filter((p) => p.furnishing === filters.furnishing);
    }
    if (filters.residence) {
      results = results.filter((p) => p.residence === filters.residence);
    }
    if (filters.availability) {
      const needle = String(filters.availability).toLowerCase().trim();
      results = results.filter((p) =>
        String(p?.availability ?? "").toLowerCase().includes(needle)
      );
    }

    // --- Fallback chain ---
    if (results.length === 0) {
      let fallback = [...list];

      // ✅ Smart BHK sorting: exact match → smaller (1RK < 1BHK < 2BHK ...) → larger
      if (filters.bhk) {
        const bhkNumber = parseInt(filters.bhk);
        if (!isNaN(bhkNumber)) {
          // ✅ Normalize: treat "1 RK" as 0.5, "1 BHK" as 1, etc.
          const normalize = (val) => {
            if (!val) return 0;
            const str = String(val).toLowerCase().trim();
            const num = parseInt(str);
            if (isNaN(num)) return 0;
            // "1 rk" < "1 bhk"
            if (str.includes("rk")) return num - 0.5;
            return num;
          };

          fallback = [...fallback].sort((a, b) => {
            const aBhk = normalize(a.bhk);
            const bBhk = normalize(b.bhk);

            // ✅ Exact match first
            if (aBhk === bhkNumber && bBhk !== bhkNumber) return -1;
            if (bBhk === bhkNumber && aBhk !== bhkNumber) return 1;

            // ✅ Then smaller bhk (descending order)
            if (aBhk < bhkNumber && bBhk >= bhkNumber) return -1;
            if (bBhk < bhkNumber && aBhk >= bhkNumber) return 1;

            // ✅ Finally, sort by absolute closeness
            const aDiff = Math.abs(aBhk - bhkNumber);
            const bDiff = Math.abs(bBhk - bhkNumber);
            if (aDiff === bDiff) return aBhk - bBhk;
            return aDiff - bDiff;
          });
        }
      }


      // ✅ Smart price sorting: below searched price first, then higher
      if (filters.price) {
        const targetPrice = Number(filters.price);

        if (!isNaN(targetPrice)) {
          // Separate into below and above groups
          const below = fallback.filter((p) => Number(p.price) <= targetPrice);
          const above = fallback.filter((p) => Number(p.price) > targetPrice);

          // Sort both groups by closeness to target price
          below.sort((a, b) => targetPrice - Number(a.price) - (targetPrice - Number(b.price)));
          above.sort((a, b) => Number(a.price) - targetPrice - (Number(b.price) - targetPrice));

          // Combine: below first, then above
          fallback = [...below, ...above];
        }
      }


      // Relax location → show partial matches anywhere
      if (filters.location) {
        const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "").trim() || "";
        const search = normalize(filters.location);

        const fullyMatched = [];
        const partiallyMatched = [];
        const nonMatched = [];

        for (const property of list) {
          const location = normalize(property.location || "");

          if (location === search) {
            fullyMatched.push(property);
          } else if (location.includes(search) || search.includes(location)) {
            partiallyMatched.push(property);
          } else {
            nonMatched.push(property);
          }
        }

        // ✅ Show exact matches first, then partial, then others
        results = [...fullyMatched, ...partiallyMatched, ...nonMatched];
      }


      // Relax availability → allow nearby ranges
      if (filters.availability) {
        const target = parseInt(filters.availability);
        if (!isNaN(target)) {
          fallback = fallback.filter((p) => {
            const avail = parseInt(p?.availability);
            return !isNaN(avail) && Math.abs(avail - target) <= 10; // within 10 days
          });
        }
      }

      // If still nothing, just return whole list as last resort
      if (fallback.length === 0) {
        results = [...list];
      } else {
        results = fallback;
      }
    }

    onFilter(results);
  };



  // ✅ Clear filters
  const handleClear = () => {
    const cleared = {
      bhk: "",
      location: "",
      price: "",
      type: "",
      tenant: "",
      furnishing: "",
      residence: "",
      availability: "",
    };
    setFilters(cleared);
    onFilter(list);
  };

  // ✅ Show filter icon on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) setShowIcon(true);
      else setShowIcon(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="filter-card">
        <h2 className="filter-title">Property Filters</h2>

        <div className="filter-grid">
          {/* BHK */}
          <div className="filter-field">
            <label>BHK</label>
            <select
              value={filters.bhk}
              onChange={(e) => handleChange("bhk", e.target.value)}
            >
              <option value="">Select BHK</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
            </select>
          </div>

          {/* Location */}
          <div className="filter-field">
            <label>Location</label>
            <input
              type="text"
              placeholder="Enter location"
              value={filters.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>

          {/* Max Price */}
          <div className="filter-field">
            <label>Max Price</label>
            <input
              type="number"
              placeholder="e.g. 12000"
              value={filters.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </div>

          {/* Property Type */}
          <div className="filter-field">
            <label>Property Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="">Select type</option>
              <option value="PG">PG</option>
              <option value="Flat">Flat</option>
              <option value="Apartment">Apartment</option>
              <option value="Floor">Floor</option>
            </select>
          </div>

          {/* Tenant */}
          <div className="filter-field">
            <label>Tenant Preference</label>
            <select
              value={filters.tenant}
              onChange={(e) => handleChange("tenant", e.target.value)}
            >
              <option value="">Select tenant</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Family">Family</option>
              <option value="Bachelor">Bachelor</option>
            </select>
          </div>

          {/* Furnishing */}
          <div className="filter-field">
            <label>Furnishing</label>
            <select
              value={filters.furnishing}
              onChange={(e) => handleChange("furnishing", e.target.value)}
            >
              <option value="">Select furnishing</option>
              <option value="Fully-furnished">Fully-furnished</option>
              <option value="Semi-furnished">Semi-furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>

          {/* Residence */}
          <div className="filter-field">
            <label>Residence</label>
            <select
              value={filters.residence}
              onChange={(e) => handleChange("residence", e.target.value)}
            >
              <option value="">Select residence</option>
              <option value="With Owner">With Owner</option>
              <option value="Independent">Independent</option>
              <option value="Sharing">Sharing</option>
            </select>
          </div>

          {/* Availability */}
          <div className="filter-field">
            <label>Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => handleChange("availability", e.target.value)}
            >
              <option value="">Select Availability</option>
              <option value="Immediate">Immediate</option>
              <option value="5 Days">5 Days</option>
              <option value="10 Days">10 Days</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
            </select>
          </div>

        </div>

        {/* Actions */}
        <div className="filter-actions">
          <button className="btn-outline" onClick={handleClear}>
            Clear
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              handleApply(); // Apply filters
              setIsMobileOpen(false); // Close popup
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
  .filter-card {
  background: #94a0acff;  /* removed alpha for opaque color */
  padding: 1.6rem;       /* reduced from 2rem */
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-width: 75%;
  margin: 2.4rem auto;   /* reduced margin */
  transition: all 0.3s ease;
  z-index: 10;
}

/* Spacing wrapper */
.filter-wrapper {
  padding: 1.6rem 1rem;  
  background: transparent;
  display: flex;
  justify-content: center;
}

@media(min-width: 768px) {
  .filter-card {
    position: sticky;
    top: 90px;
    margin: 1.6rem 0;  
    width: 100%;
  }
}


  .filter-title {
    font-size: 1.4rem;  /* ↓ slightly smaller text */
    font-weight: bold;
    color: #1b1d3a;
    margin-bottom: 0.8rem;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.8rem;  /* ↓ reduced spacing */
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

 .filter-field label {
  font-weight: 700;   /* bold */
  color: #000000;     /* black */
  font-size: 0.85rem; /* keep original size */
}


  .filter-field input,
  .filter-field select {
    padding: 0.4rem;  /* ↓ reduced input height */
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem; /* ↓ reduced spacing */
    margin-top: 1.2rem; /* ↓ smaller margin */
    flex-wrap: wrap;
  }

  .btn-outline {
    background: #fff;
    color: #1b1d3a;
    border: 1px solid #d1d5db;
    padding: 0.4rem 0.9rem; /* ↓ smaller buttons */
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-outline:hover {
    background: #f3f4f6;
  }

  .btn-primary {
    background: #3b82f6;
    color: #fff;
    border: none;
    padding: 0.4rem 0.9rem; /* ↓ smaller buttons */
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    background: #2563eb;
  }
`}</style>


    </>
  );
}
