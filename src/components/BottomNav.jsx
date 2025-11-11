import React, { useState, useEffect, forwardRef, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, Package } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE } from "../api";
import { AuthContext } from "../context/AuthContext";

const BottomNav = forwardRef((props, ref) => {
  const links = [
    { to: "/", label: "Home", icon: <Home size={22} /> },
    { to: "/cart", label: "Cart", icon: <ShoppingCart size={22} /> },
    { to: "/UserOrders", label: "Orders", icon: <Package size={22} /> },
  ];

  const { user, token } = useContext(AuthContext);
  const [ordersCount, setOrdersCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Fetch orders count
  useEffect(() => {
    const fetchOrdersCount = async () => {
      if (!user?.userId) return;

      try {
        const res = await fetch(`${API_BASE}/cart/${user.userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const cartData = await res.json();

        const listingIds = Array.isArray(cartData) && cartData.length > 0
          ? cartData[0].listingIds || []
          : [];

        if (listingIds.length === 0) {
          setOrdersCount(0);
          return;
        }

        const propertiesRes = await fetch(`${API_BASE}/properties`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        const allProperties = await propertiesRes.json();

        const matched = allProperties.filter((p) =>
          listingIds.includes(p.listingId)
        );

        setOrdersCount(matched.length);
      } catch (err) {
        console.error("Error fetching orders count:", err);
        setOrdersCount(0);
      }
    };

    fetchOrdersCount();
    const interval = setInterval(fetchOrdersCount, 30000);
    return () => clearInterval(interval);
  }, [user?.userId, token]);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user?.userId) return;

      try {
        const res = await fetch(`${API_BASE}/leads/user/${user.userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const allListingIds = data.flatMap(lead =>
          lead.owners.flatMap(owner => owner.listingIds || [])
        );

        setCartCount(allListingIds.length);
      } catch (err) {
        console.error("Error fetching cart count:", err);
        setCartCount(0);
      }
    };

    fetchCartCount();
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, [user?.userId, token]);

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 0",
        zIndex: 1000,
        boxShadow: "0 -3px 15px rgba(0,0,0,0.1)",
      }}
    >
      {links.map((link, index) => {
        const isCart = link.label.toLowerCase() === "cart";
        const isOrders = link.label.toLowerCase() === "orders";

        return (
          <NavLink
            key={index}
            to={link.to}
            end
            style={({ isActive }) => ({
              color: isActive ? "#1b1d3a" : "#999",
              textAlign: "center",
              textDecoration: "none",
              flex: 1,
              fontWeight: isActive ? "600" : "500",
              position: "relative",
            })}
          >
            {({ isActive }) => (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isActive ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <div style={{ position: "relative" }} ref={isCart || isOrders ? ref : null}>
                  {link.icon}

                  {/* Cart count badge */}
                  {isCart && cartCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-0px",
                        background: "red",
                        color: "#fff",
                        borderRadius: "50%",
                        padding: "0px 0px",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        minWidth: "12px",
                        textAlign: "center",
                      }}
                    >
                      {cartCount}
                    </span>
                  )}

                  {/* Orders count badge */}
                  {isOrders && ordersCount > 0 && (
                    <span
                       style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-0px",
                        background: "red",
                        color: "#fff",
                        borderRadius: "50%",
                        padding: "0px 0px",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        minWidth: "12px",
                        textAlign: "center",
                      }}
                    >
                      {ordersCount}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      style={{
                        position: "absolute",
                        bottom: "-4px",
                        left: "40%",
                        transform: "translateX(-50%)",
                        width: "6px",
                        height: "6px",
                        background: "#1b1d3a",
                        borderRadius: "50%",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: isActive ? "#1b1d3a" : "#777",
                    transition: "color 0.3s ease",
                  }}
                >
                  {link.label}
                </span>
              </motion.div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
});

export default BottomNav;
