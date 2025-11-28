import React, { useState, useEffect } from "react";

import { Routes, Route, useLocation } from "react-router-dom";
import PullToRefresh from "react-simple-pull-to-refresh";
import Home from "./pages/Home";
import ContactPage from "./pages/ContactPage";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import UserPage from "./pages/User";
import Home1 from "./pages/home1";
import UserDashboard from "./pages/UserDashboard";
import MyLeads from "./pages/MyLeads";
import ProtectedRoute from "./components/ProtectedRoute";
import UserOrders from "./pages/UserOrders";
import SkeletonLoader from "./components/SkeletonLoader";
import BuyCreditsPage from "./pages/BuyCreditsPage";
import Cart from "./pages/Cart"; // ✅ skeleton component
import { GlobalToaster } from "./utils/toaster";
import BottomNav from "./components/BottomNav";
import SupportContactPage from "./pages/ContactUs";
import DownloadAppButton from "./components/DownloadApp";
import TermsAndConditions from "./components/terms";


export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // ✅ detect which skeleton to show for this route
  const getPageType = (path) => {
    if (path.startsWith("/contact")) return "contact";
    if (path.startsWith("/UserOrders")) return "userOrders";
    if (path.startsWith("/user")) return "user";
    return "home";
  };

  // ✅ Detect mobile or tablet screens
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Refresh only current page, not entire app
  const handleRefresh = async () => {
    return new Promise((resolve) => {
      setIsRefreshing(true); // show skeleton
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1); // trigger re-render of current route
        setIsRefreshing(false);
        resolve();
      }, 1000); // simulate smooth reload
    });
  };

  return (
    <>

      <GlobalToaster />
      <Navbar />

      {/* ✅ Pull-To-Refresh with smooth skeleton */}
      <PullToRefresh
        onRefresh={handleRefresh}
        resistance={2.5}
        pullingContent={
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              color: "#666",
              fontWeight: 600,
            }}
          >
            ↓ Pull down to refresh
          </div>
        }
        refreshingContent={
          <SkeletonLoader page={getPageType(location.pathname)} />
        }
        style={{
          minHeight: "100vh",
          backgroundColor: "#fff",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          className="app-page-wrapper"
          style={{
            height: '100%',           // fill PullToRefresh container
            overflowY: 'auto',        // enable scrolling
            paddingBottom: isMobile ? '170px' : '0', // leave space for BottomNav
            boxSizing: 'border-box',
          }}
          key={`${location.pathname}-${refreshKey}`}>
          {isRefreshing ? (
            <SkeletonLoader page={getPageType(location.pathname)} />
          ) : (
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/home1" element={<Home1 />} />
              <Route path="/ContactUs" element={<SupportContactPage />} />
              <Route path="/DownloadApp" element={<DownloadAppButton />} />
              <Route path="/terms" element={<TermsAndConditions />} />



              {/* Protected Routes */}
             <Route
                path="/contact/:listingId"
                element={
               
                    <ContactPage />
                 
                }
              />
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <UserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buy-credits"
                element={
                  <ProtectedRoute>
                    <BuyCreditsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/UserOrders"
                element={
                  <ProtectedRoute>
                    <UserOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/UserDashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/MyLeads"
                element={
                  <ProtectedRoute>
                    <MyLeads />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          )}
        </div>
      </PullToRefresh>
      {isMobile && <BottomNav />}

    </>
  );
}
