import React from "react";
import { Toaster, toast } from "react-hot-toast";

// Example: your callback function (API call or state update)
const fireAfterToastClose = async () => {
  try {
    // 🔁 Replace this with your actual API endpoint
    await fetch("/api/toaster-closed", { method: "POST" });
    console.log("Toaster closed → triggered follow-up request ✅");
  } catch (error) {
    console.error("Failed to trigger post-toast request:", error);
  }
};

// ✅ Toast helper functions
export const showSuccess = (message) =>
  toast.success(message, {
    duration: 4000,
    style: { background: "green", color: "#fff", fontWeight: "600" },
    iconTheme: { primary: "#fff", secondary: "green" },
    // ✅ Fires after toast closes
    onClose: fireAfterToastClose,
  });

export const showError = (message) =>
  toast.error(message, {
    duration: 4000,
    style: { background: "red", color: "#fff", fontWeight: "600" },
    iconTheme: { primary: "#fff", secondary: "red" },
    onClose: fireAfterToastClose,
  });

export const showInfo = (message) =>
  toast(message, {
    duration: 4000,
    style: { background: "#007BFF", color: "#fff", fontWeight: "600" },
    iconTheme: { primary: "#fff", secondary: "#007BFF" },
    onClose: fireAfterToastClose,
  });

// ✅ Global Toaster (use once in App.jsx)
export const GlobalToaster = () => (
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
      success: {
        duration: 3000,
        style: { background: "green" },
        iconTheme: { primary: "#fff", secondary: "green" },
      },
      error: {
        duration: 3000,
        style: { background: "red" },
        iconTheme: { primary: "#fff", secondary: "red" },
      },
      custom: {
        duration: 3000,
        style: { background: "#007BFF" },
        iconTheme: { primary: "#fff", secondary: "#007BFF" },
      },
    }}
  />
);
