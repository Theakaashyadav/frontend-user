import React, { forwardRef } from "react";
import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, Package } from "lucide-react";
import { motion } from "framer-motion";

const BottomNav = forwardRef((props, ref) => {
  const links = [
    { to: "/", label: "Home", icon: <Home size={22} /> },
    { to: "/cart", label: "Cart", icon: <ShoppingCart size={22} /> },
    { to: "/UserOrders", label: "Orders", icon: <Package size={22} /> },
  ];

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
                <div
                  style={{ position: "relative" }}
                  ref={isCart ? ref : null} // attach ref only to cart icon
                >
                  {link.icon}
                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      style={{
                        position: "absolute",
                        bottom: "-6px",
                        left: "50%",
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
