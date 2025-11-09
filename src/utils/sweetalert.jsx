// ✅ src/utils/sweetalert.jsx
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ===========================================================
   🔥 Reusable SweetAlert Utility
   Import and use across your app like:
   import { showSuccess, showError, showInfo, confirmDelete } from "../utils/sweetalert";
=========================================================== */

// ✅ Success Alert
export const showSuccess = (message = "Action completed successfully!") => {
  return Swal.fire({
    icon: "success",
    title: "Success!",
    text: message,
    timer: 2000,
    showConfirmButton: false,
    background: "#f0fdf4",
    iconColor: "#22c55e",
    customClass: {
      popup: "rounded-2xl shadow-lg w-[90%] max-w-sm",
      title: "text-green-700 font-semibold",
      htmlContainer: "text-green-600",
    },
  });
};

// ✅ Error Alert
export const showError = (message = "Something went wrong!") => {
  return Swal.fire({
    icon: "error",
    title: "Error!",
    text: message,
    confirmButtonColor: "#ef4444",
    background: "#fef2f2",
    iconColor: "#ef4444",
    customClass: {
      popup: "rounded-2xl shadow-lg w-[90%] max-w-sm",
      title: "text-red-700 font-semibold",
      htmlContainer: "text-red-600",
    },
  });
};

// ✅ Info / General Alert
export const showInfo = (message = "Here’s some information for you.") => {
  return Swal.fire({
    icon: "info",
    title: "Info",
    text: message,
    confirmButtonColor: "#3b82f6",
    background: "#eff6ff",
    iconColor: "#3b82f6",
    customClass: {
      popup: "rounded-2xl shadow-lg w-[90%] max-w-sm",
      title: "text-blue-700 font-semibold",
      htmlContainer: "text-blue-600",
    },
  });
};

// ✅ Confirmation for Deletion
export const confirmDelete = async (count = 1, onConfirm) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `You’re about to remove ${count} Item ${count > 1 ? "" : ""}from the Cart. This action cannot be undone!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    backdrop: true,
    customClass: {
      popup: "rounded-2xl shadow-lg max-w-sm w-[90%]",
      title: "text-lg font-semibold text-gray-800",
      htmlContainer: "text-sm text-gray-600",
      confirmButton: "px-5 py-2 text-white font-medium rounded-lg",
      cancelButton: "px-5 py-2 font-medium rounded-lg",
    },
  });

  if (result.isConfirmed && typeof onConfirm === "function") {
    onConfirm();
  }
};
