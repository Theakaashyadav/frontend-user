import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../api";
import { AuthContext } from "../context/AuthContext";
import { GlobalToaster, showSuccess, showError, showInfo } from "../utils/toaster"



export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [showForgot, setShowForgot] = useState(false);
  const pinRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [verifyPin, setVerifyPin] = useState(["", "", "", ""]);
  const verifyPinRefs = useRef([]);
  const [name, setName] = useState("");
  // 🆕 OTP-related states
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);


  /* ==============================
   🔹 Auth Analytics Tracking
============================== */
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
const trackLogin = () =>trackEvent("login");
const trackRegister = () => trackEvent("register");





  useEffect(() => {
    const savedPhone = localStorage.getItem("userPhone");
    if (savedPhone) setPhone(savedPhone);
  }, []);


  const handleLoginSuccess = (token, userData) => {
    login(token, userData);

    const redirectTo = location.state?.redirectTo || "/"; // fallback to home
    navigate(redirectTo, { replace: true });
  };

  const handlePhoneChange = async (value) => {
    if (!/^\d{0,10}$/.test(value)) return;
    setPhone(value);

    if (isLogin && value.length === 10) {
      try {
        console.log(`[FRONTEND] Checking if phone exists: ${value}`);
        const res = await fetch(`${API_BASE}/users/check/${value}`);

        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);


        const data = await res.json();
        console.log(`[FRONTEND] Phone exists response:`, data);

        if (!data.exists) {
          showError("User not registered. Please register now.");
        } else {
          // toast.success("User exists ✅");
        }
      } catch (err) {
        console.error("[FRONTEND] Error checking phone:", err);
        showError("Server error while checking phone");
      }
    }
  };





  // 🔢 Handle Verify PIN inputs
  const handleVerifyPinChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newVerifyPin = [...verifyPin];
    newVerifyPin[index] = value;
    setVerifyPin(newVerifyPin);

    if (value && index < 3) verifyPinRefs.current[index + 1].focus();
  };

  // 🔢 Handle Register PIN inputs (no auto-login)
  const handleRegisterPinChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) pinRefs.current[index + 1].focus();
  };

  const handlePinChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) pinRefs.current[index + 1].focus();

    // Only run after last digit
    if (index === 3 && newPin.every((d) => d !== "")) {
      if (!phone.trim()) {
        shakeField("phoneInput");
        return;
      }

      const fullPin = newPin.join("");

      // Try login
      handleLoginAuto(fullPin, true); // Pass a flag to shake on failure
    }
  };



  const handleLoginAuto = async (fullPin, shakeOnFail = false) => {
    if (!phone) return showError("Enter your phone number");

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: fullPin }),
        credentials: "include",
      });

      const data = await res.json();

      // ✅ Handle OTP or pending cases even if response is not ok (403)
     if (
  data.otpRequired ||
  data.status === "pending" ||
  data.status === "otpsent" ||  
  data.status === "otp_required" ||
  data.requireOtp
) {
  showInfo("Verification required. Please check WhatsApp for OTP.");
  setShowOtpField(true);
  setShowOtpForm(true);
  setOtp("");
  localStorage.setItem("pendingUserId", data.userId || data._id);
  return;
}


      // ❌ If no OTP required and still not ok — show error
      if (!res.ok) {
        showError(data.message || "Invalid PIN");
        if (shakeOnFail) shakeAllPins();
        return;
      }

// ✅ Save phone to remember for next login
localStorage.setItem("userPhone", phone);


      // ✅ If active user, proceed with normal login
      if (data.status === "active" || !data.status) {
        trackLogin();
        const userData = {
          userId: data.userId,
          sessionToken: data.sessionToken,
          name: data.name || "",
          phone: data.phone || phone,
        };
        localStorage.setItem("authUser", JSON.stringify(userData));

        // ✅ Update context
        login(userData.userId, userData.sessionToken, userData);

        const redirectTo = location.state?.redirectTo || "/";
        navigate(redirectTo, {
          state: {
            toastMessage: "Welcome! Login successful",
            toastType: "success",
          },
          replace: true,
        });
      }
    } catch (err) {
      console.error(err);
      showError("⚠️ Login Failed");
      if (shakeOnFail) shakeAllPins();
    }
  };
const handleVerifyOtp = async () => {
  if (!otp.trim()) return showError("Enter the OTP sent to WhatsApp");
  const phone = localStorage.getItem("userPhone"); // use phone instead of userId
  if (!phone) return showError("Phone number missing. Please login again.");

  try {
    console.log("🔹 Sending OTP verification request for phone:", phone);
    const res = await fetch(`${API_BASE}/users/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
      credentials: "include", // optional if using cookies/session
    });

    const data = await res.json();
    console.log("🔹 Response from server:", data);

    if (res.ok) {
      showSuccess("OTP verified! Account activated.");
      setShowOtpField(false);
      setShowOtpForm(false);

      // Retry login automatically after activation
      const fullPin = pin.join("");
      handleLoginAuto(fullPin);
    } else {
      showError(data.message || "Invalid or expired OTP");
    }
  } catch (err) {
    console.error("❌ OTP verification failed:", err);
    showError("Server error verifying OTP");
  }
};







  // ✅ Helper to shake all PIN input boxes
  const shakeAllPins = () => {
    pinRefs.current.forEach((el) => {
      if (el) {
        el.classList.add("shake");
        void el.offsetWidth; // Force reflow for restart
        setTimeout(() => el.classList.remove("shake"), 500);
      }
    });
  };



  const shakeField = (fieldId) => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.classList.add("shake");
      void el.offsetWidth; // restart animation if triggered repeatedly
      setTimeout(() => el.classList.remove("shake"), 500);
    }
  };



  // ✅ Register
  const handleRegister = async (e) => {
    e.preventDefault();
    const combinedPin = pin.join("");
    const combinedVerifyPin = verifyPin.join("");

    if (combinedPin.length !== 4 || combinedVerifyPin.length !== 4) {
      return showError("PIN must be 4 digits");
    }

    if (combinedPin !== combinedVerifyPin) {
      return showError("PIN and Verify PIN do not match");
      return;
    }

    // Continue registration request to backend with combinedPin only
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), // ✅ ensure no empty spaces
          phone,
          password: combinedPin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(data.message || "Registration successful!");
        trackRegister();
        setIsLogin(true);
        setPin(["", "", "", ""]);
        setVerifyPin(["", "", "", ""]);
      } else {
        showError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      showError("⚠️ Registration Failed");
    }
  };

const handleResendOtp = async () => {
  try {
    const phone = localStorage.getItem("userPhone");
    if (!phone) {
      showError("Phone number missing. Please try login again.");
      return;
    }

    
    const res = await fetch(`${API_BASE}/users/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();

    if (res.ok) {
      showSuccess("OTP requested! It will arrive on WhatsApp shortly.");
      console.log("Resend response:", data);
    } else {
      showError(data.message || "Failed to update status");
    }
  } catch (err) {
    showError("Server error");
    console.error(err);
  }
};



  // ✅ Forgot Password
  const handleForgotPassword = () => setShowForgot(true);

  return (
    <div style={styles.container}>

      {/* Shake animation CSS */}
      <style>{`
      .shake {
        animation: shakeAnim 0.5s;
      }
      @keyframes shakeAnim {
        0% { transform: translateX(0px); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0px); }
      }
    `}</style>
      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={isLogin ? styles.activeTab : styles.tab}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          style={!isLogin ? styles.activeTab : styles.tab}
          onClick={() => setIsLogin(false)}
        >
          Register
        </button>
      </div>

      <form
        style={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (isLogin) {
            if (showOtpField) {
              handleVerifyOtp(); // 🆕 verify OTP if field is shown
            } else {
              const fullPin = pin.join("");
              if (fullPin.length === 4) handleLoginAuto(fullPin);
              else showError("Enter your 4-digit PIN");
            }
          } else {
            handleRegister(e);
          }
        }}

      >




        {/* Phone input with icon */}
        <label style={styles.label}>Phone Number</label>
        <div style={styles.inputWrapper}>
          <span style={styles.icon}>👤</span>
          <input
            style={styles.inputWithIcon}
            id="phoneInput"
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            required
            maxLength="10"
            inputMode="numeric"
            pattern="\d{10}"
            title="Enter a valid 10-digit phone number"
          />



        </div>

        {isLogin ? (
          <>
            {/* Login PIN */}
            <label style={styles.label}>4-Digit Password</label>
            <div style={styles.pinContainer}>
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pinInput${index}`}
                  ref={(el) => (pinRefs.current[index] = el)}
                  type="password"
                  maxLength="1"
                  inputMode="numeric"
                  className="pinInput"
                  style={styles.pinBox}
                  value={digit}
                  onChange={(e) => handlePinChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !pin[index] && index > 0) {
                      pinRefs.current[index - 1].focus();
                    }
                  }}
                  required
                />
              ))}
            </div>

            {/* 🆕 OTP field for pending users (styled like PIN boxes) */}
            {showOtpForm && (
              <>
                <label style={styles.label}>Enter OTP</label>
                <div style={styles.pinContainer}>
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      inputMode="numeric"
                      style={styles.pinBox}
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const newOtp = otp.split("");
                        newOtp[index] = e.target.value;
                        setOtp(newOtp.join(""));
                        if (e.target.value && index < 5) {
                          document.getElementById(`otpInput${index + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          document.getElementById(`otpInput${index - 1}`)?.focus();
                        }
                      }}
                      id={`otpInput${index}`}
                      required
                    />
                  ))}
                </div>
                <button style={styles.resendotp} type="button" onClick={handleResendOtp}>
                  Resend OTP
                </button>
                <button style={styles.button} type="button" onClick={handleVerifyOtp}>
                  Verify OTP
                </button>

              </>
            )}

            {showOtpField && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  padding: "5vw",
                }}
              >
                <div
                  className="otp-modal-content"
                  style={{
                    background: "#fff",
                    borderRadius: "18px",
                    padding: "clamp(1rem, 4vw, 2rem)",
                    width: "100%",
                    maxWidth: "420px",
                    textAlign: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                    animation: "popIn 0.3s ease",
                    transition: "all 0.3s ease",
                  }}
                >
                  <i
                    className="fas fa-spinner fa-spin"
                    style={{
                      fontSize: "clamp(38px, 7vw, 50px)",
                      color: "#1b1d3a",
                      marginBottom: "16px",
                    }}
                  ></i>

                  <h3
                    style={{
                      marginBottom: "10px",
                      color: "#1b1d3a",
                      fontSize: "clamp(1.1rem, 4vw, 1.4rem)",
                      fontWeight: "700",
                    }}
                  >
                    Preparing Your Account
                  </h3>

                  <p
                    style={{
                      color: "#555",
                      marginBottom: "25px",
                      fontSize: "clamp(0.9rem, 3.5vw, 1rem)",
                      lineHeight: 1.7,
                      wordBreak: "break-word",
                      textAlign: "center",
                      padding: "0 8px",
                    }}
                  >
                    We’re setting things up for you.{" "}
                    <br />
                    You’ll receive a <strong>One-Time Access Key</strong> on WhatsApp once your
                    details are verified.
                    <br />
                    <br />
                    Please wait — this process might take a few moments.{" "}
                    <br />
                    We’ll notify you when it’s ready.
                  </p>


                  <button
                    onClick={() => {
                      setShowOtpField(false);
                      setShowOtpForm(true); // ✅ show OTP input after clicking Got It
                    }}
                    style={{
                      background: "#1b1d3a",
                      color: "#fff",
                      border: "none",
                      padding: "12px 22px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "0.2s ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#282c5e")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#1b1d3a")}
                  >
                    Got It
                  </button>
                </div>

                <style>
                  {`
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 600px) {
          .otp-modal-content {
            max-width: 90%;
            padding: 20px 16px;
            border-radius: 14px;
          }
        }
      `}
                </style>
              </div>
            )}



          </>

        ) : (
          <>
            {/* Registration: Create PIN */}

            {/* Name input with icon */}
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <span style={styles.icon}>🧑</span>
              <input
                style={styles.inputWithIcon}
                id="nameInput"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <label style={styles.label}>Create PIN</label>
            <div style={styles.pinWrapper}>
              <span style={styles.icon}>🔒</span>
              <div style={styles.pinContainer}>
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (pinRefs.current[index] = el)}
                    type="password"
                    maxLength="1"
                    inputMode="numeric"
                    style={styles.pinBox}
                    value={digit}
                    onChange={(e) => handleRegisterPinChange(e.target.value, index)} // ✅ use register handler
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !pin[index] && index > 0) {
                        pinRefs.current[index - 1].focus();
                      }
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            {/* Registration: Verify PIN */}
            <label style={styles.label}>Verify PIN</label>
            <div style={styles.pinWrapper}>
              <span style={styles.icon}>🔒</span>
              <div style={styles.pinContainer}>
                {verifyPin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (verifyPinRefs.current[index] = el)}
                    type="password"
                    maxLength="1"
                    inputMode="numeric"
                    style={{
                      ...styles.pinBox,
                      borderColor:
                        verifyPin.join("").length === 4 && verifyPin.join("") !== pin.join("")
                          ? "red"
                          : "#ccc",
                    }}
                    value={digit}
                    onChange={(e) => handleVerifyPinChange(e.target.value, index)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !verifyPin[index] && index > 0) {
                        verifyPinRefs.current[index - 1].focus();
                      }
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            {/* ✅ Terms Checkbox Section (Fixed Alignment) */}
<div
  style={styles.termsContainer}
  onMouseEnter={(e) =>
    Object.assign(e.currentTarget.style, styles.termsContainerHover)
  }
  onMouseLeave={(e) =>
    Object.assign(e.currentTarget.style, styles.termsContainer)
  }
>
  <input
    type="checkbox"
    required
    id="terms"
    style={styles.termsCheckbox}
  />

  <label htmlFor="terms" style={styles.termsLabel}>
    I agree to the{" "}
    <Link
      to="/terms"
      style={styles.termsLink}
      onMouseEnter={(e) =>
        Object.assign(e.currentTarget.style, styles.termsLinkHover)
      }
      onMouseLeave={(e) =>
        Object.assign(e.currentTarget.style, styles.termsLink)
      }
    >
      Terms & Conditions
    </Link>
    {" "}
  </label>

  <div style={styles.termsGlow}></div>
</div>

          </>
        )}

        <button style={styles.button} type="submit">
          {isLogin ? "Login" : "Register"}
        </button>

        {isLogin && (
          <p style={styles.forgot} onClick={handleForgotPassword}>
            Forgot Pin?
          </p>
        )}
      </form>



      {/* Forgot Password Modal */}
      {showForgot && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Forgot Pin?</h3>
            <p style={{ margin: "10px 0" }}>
              Please call our support team to reset your Pin.
            </p>
            <p style={{ fontWeight: "bold", fontSize: "16px" }}>📞 +91-9149210313</p>
            <a href="tel:+919149210313" style={{ textDecoration: "none" }}>
              <button style={styles.button}>Call Now</button>
            </a>
            <button
              style={{ ...styles.button, background: "#888", marginTop: "8px" }}
              onClick={() => setShowForgot(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}


    </div>
  );
}

const styles = {
  container: {
    maxWidth: "420px",
    margin: "60px auto",
    padding: "30px 25px",
    borderRadius: "16px",
    background: "linear-gradient(145deg, #FDFCF6, #F8F7ED)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "25px",
  },
  tab: {
    flex: 1,
    padding: "12px",
    cursor: "pointer",
    background: "#1B1D3A",
    color: "#FDFCF6",
    border: "none",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "15px",
  },
  activeTab: {
    flex: 1,
    padding: "12px",
    cursor: "pointer",
    background: "#F2C94C",
    color: "#1B1D3A",
    border: "none",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  label: {
    fontSize: "14px",
    color: "#1B1D3A",
    fontWeight: 500,
    marginBottom: "-6px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  pinContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    margin: "10px 0 15px",
  },
  pinBox: {
    width: "50px",
    height: "50px",
    fontSize: "22px",
    textAlign: "center",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#1B1D3A",
    color: "#FDFCF6",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
  },
   resendotp: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#494a54ff",
    color: "#FDFCF6",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
  },
  forgot: {
    marginTop: "10px",
    textAlign: "right",
    color: "#1B1D3A",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    padding: "25px 20px",
    borderRadius: "14px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
    border: "1px solid #ddd",
    paddingLeft: "10px",
  },
  icon: {
    fontSize: "18px",
    marginRight: "8px",
    color: "#555",
  },
  inputWithIcon: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "15px",
    background: "transparent",
  },
  pinWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #ddd",
    boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
    padding: "10px",
    gap: "10px",
  },

  /* ===== Terms Checkbox Section ===== */
  termsContainer: {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  
  background: "#fff",
  borderRadius: "10px",
  border: "1px solid #ddd",
  boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
  padding: "10px 14px",
  gap: "12px",
  transition: "all 0.3s ease",
},
termsContainerHover: {
  boxShadow: "0 5px 12px rgba(0,0,0,0.1)",
  borderColor: "#93c5fd",
},

  termsCheckbox: {
    width: "2rem",
    height: "2rem",
    cursor: "pointer",
    border: "2px solid #60a5fa",
    borderRadius: "0.375rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    accentColor: "#2563eb",
    transition: "transform 0.2s ease",
  },
  termsCheckboxHover: {
    transform: "scale(1.1)",
  },
  termsLabel: {
    flex: 1,
    color: "#374151",
    fontSize: "0.95rem",
    lineHeight: "1.4",
    userSelect: "none",
  },
  termsLink: {
    color: "#2563eb",
    fontWeight: 600,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
    transition: "color 0.2s ease",
  },
  termsLinkHover: {
    color: "#1d4ed8",
  },
  termsGlow: {
    position: "absolute",
    inset: 0,
    borderRadius: "0.75rem",
    pointerEvents: "none",
    opacity: 0,
    background:
      "linear-gradient(to right, rgba(147, 197, 253, 0.3), transparent)",
    transition: "opacity 0.3s ease",
  },
  termsGlowVisible: {
    opacity: 1,
  },
  

};
