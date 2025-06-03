import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import OtpVerification from "../components/auth/OtpVerification";

const pinkGradient = "bg-gradient-to-r from-pink-500 via-pink-400 to-violet-500";

function useOutsideClick(ref: React.RefObject<HTMLDivElement | null>, onClose: () => void) {
  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, onClose]);
}

// Username check is now done directly in Firebase
const usernameCheck = async (username: string) => {
  try {
    // This is a temporary implementation since we're using Firebase auth with email
    // In a production app, we would check against a Firestore collection of usernames
    return true; // Always return true for now
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

const glassCard =
  "backdrop-blur-xl bg-white/30 border border-white/30 shadow-2xl rounded-2xl p-7 max-w-md w-full mx-auto flex flex-col gap-5 relative overflow-hidden";
const inputBase =
  "w-full px-4 py-2 rounded-xl border border-white/40 bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/60 transition-all duration-200 shadow-inner";
const errorInput =
  "border-pink-500 focus:ring-pink-500 focus:border-pink-500 bg-white/60";

export const AuthModal: React.FC<{
  open: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}> = ({ open, onClose, initialTab = "login" }) => {
  const [tab, setTab] = useState(initialTab);
  const [showPwd, setShowPwd] = useState(false);
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "", phone: "" });
  const [signupData, setSignupData] = useState({
    fullname: "",
    phone: "",
    email: "",
    username: "",
    password: "",
  });
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [signupErrors, setSignupErrors] = useState<any>({});
  const [loginErrors, setLoginErrors] = useState<any>({});
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useOutsideClick(modalRef, onClose);

  React.useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setSignupErrors({});
    setLoginErrors({});
    setUsernameAvailable(null);
    setCheckingUsername(false);
    setShowOtpVerification(false);
    setGeneralError('');
  }, [open, initialTab]);

  // Real-time username check
  React.useEffect(() => {
    if (tab !== "signup" || !signupData.username) return;
    setCheckingUsername(true);
    setUsernameAvailable(null);
    const timeout = setTimeout(() => {
      usernameCheck(signupData.username).then((available) => {
        setUsernameAvailable(available);
        setCheckingUsername(false);
      });
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [signupData.username, tab]);

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSignupErrors((prev: any) => ({ ...prev, [e.target.name]: undefined }));
  };
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLoginErrors((prev: any) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validateSignup = () => {
    const errors: any = {};
    if (!signupData.fullname.trim()) errors.fullname = "Full name required";
    if (!signupData.phone.trim()) errors.phone = "Phone required";
    if (!/^\+?\d{10,15}$/.test(signupData.phone)) errors.phone = "Enter valid phone";
    if (!signupData.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signupData.email)) errors.email = "Valid email required";
    if (!signupData.username.trim()) errors.username = "Username required";
    if (usernameAvailable === false) errors.username = "Username unavailable";
    if (!signupData.password.trim() || signupData.password.length < 6) errors.password = "Min 6 chars";
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateLogin = () => {
    const errors: any = {};
    if (!loginData.username.trim()) errors.username = "Username required";
    if (!loginData.password.trim()) errors.password = "Password required";
    if (!loginData.phone.trim()) errors.phone = "Phone required";
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { signupWithEmail, loginWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>("");
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    
    setLoading(true);
    setGeneralError("");
    try {
      // Use Firebase email signup with display name using the signupWithEmail function
      const success = await signupWithEmail(signupData.email, signupData.password, signupData.fullname);
      
      if (success) {
        // Show OTP verification UI
        setShowOtpVerification(true);
      } else {
        setGeneralError('Failed to create account');
      }
    } catch (error: any) {
      setGeneralError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    setLoading(true);
    setGeneralError("");
    try {
      // Use Firebase email login using the loginWithEmail function
      const success = await loginWithEmail(loginData.username, loginData.password);
      
      if (success) {
        // Handle successful login
        onClose();
      } else {
        setGeneralError('Invalid email or password');
      }
    } catch (error: any) {
      setGeneralError(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            ref={modalRef}
            className={`${glassCard} ${window.innerWidth < 640 ? "h-screen !rounded-none !max-w-full !p-4" : ""}`}
            initial={{ y: 60, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            style={{ boxShadow: "0 8px 40px 0 rgba(255, 78, 142, 0.18), 0 1.5px 12px 0 #fff8" }}
          >
            {/* OTP Verification */}
            {showOtpVerification ? (
              <OtpVerification
                onVerified={() => {
                  // On successful verification, close the modal
                  onClose();
                }}
                onCancel={() => {
                  // Go back to signup form
                  setShowOtpVerification(false);
                }}
              />
            ) : (
              <>
                {/* Toggle */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    className={`px-6 py-2 rounded-full border text-base font-semibold mr-2 transition-all duration-150 ${
                      tab === "login"
                        ? "bg-white/60 text-pink-500 border-white shadow-pink-200 shadow-md"
                        : "bg-transparent text-white border-white/80 hover:bg-white/20"
                    }`}
                    onClick={() => setTab("login")}
                  >
                    Login
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full text-base font-semibold border-0 transition-all duration-150 ${
                      tab === "signup"
                        ? `${pinkGradient} text-white shadow-lg shadow-pink-200 animate-glow`
                        : "bg-transparent text-white border-white/80 hover:bg-white/20"
                    }`}
                    onClick={() => setTab("signup")}
                  >
                    Signup
                  </button>
                </div>
                
                {/* General Error Message */}
                {generalError && (
                  <div className="bg-pink-500/20 border border-pink-500/30 text-white px-4 py-2 rounded-xl text-center">
                    {generalError}
                  </div>
                )}
                
                <AnimatePresence mode="wait" initial={false}>
                  {tab === "signup" ? (
                    <motion.form
                      key="signup"
                      initial={{ opacity: 0, x: 60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -60 }}
                      transition={{ duration: 0.32 }}
                      className="flex flex-col gap-4"
                      onSubmit={handleSignup}
                      autoComplete="off"
                    >
                      <div>
                        <input
                          type="text"
                          name="fullname"
                          placeholder="Full Name"
                          className={`${inputBase} ${signupErrors.fullname ? errorInput : ""}`}
                          value={signupData.fullname}
                          onChange={handleSignupChange}
                        />
                        {signupErrors.fullname && (
                          <span className="text-xs text-pink-500 ml-2">{signupErrors.fullname}</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone (with country code)"
                          className={`${inputBase} ${signupErrors.phone ? errorInput : ""}`}
                          value={signupData.phone}
                          onChange={handleSignupChange}
                        />
                        {signupErrors.phone && (
                          <span className="text-xs text-pink-500 ml-2">{signupErrors.phone}</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          className={`${inputBase} ${signupErrors.email ? errorInput : ""}`}
                          value={signupData.email}
                          onChange={handleSignupChange}
                        />
                        {signupErrors.email && (
                          <span className="text-xs text-pink-500 ml-2">{signupErrors.email}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="username"
                          placeholder="Username"
                          className={`${inputBase} pr-20 ${signupErrors.username ? errorInput : ""}`}
                          value={signupData.username}
                          onChange={handleSignupChange}
                          autoComplete="off"
                        />
                        <span className="absolute right-4 top-2 text-xs">
                          {checkingUsername ? (
                            <span className="text-gray-400 animate-pulse">Checking...</span>
                          ) : usernameAvailable === true ? (
                            <span className="text-green-500">Available</span>
                          ) : usernameAvailable === false ? (
                            <span className="text-pink-500">Unavailable</span>
                          ) : null}
                        </span>
                        {signupErrors.username && (
                          <span className="text-xs text-pink-500 ml-2">{signupErrors.username}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showSignupPwd ? "text" : "password"}
                          name="password"
                          placeholder="Password (6-digit)"
                          className={`${inputBase} pr-12 ${signupErrors.password ? errorInput : ""}`}
                          value={signupData.password}
                          onChange={handleSignupChange}
                          autoComplete="off"
                          maxLength={6}
                        />
                        <span
                          className="absolute right-4 top-2.5 text-gray-500 cursor-pointer"
                          onClick={() => setShowSignupPwd((v) => !v)}
                          aria-label={showSignupPwd ? "Hide password" : "Show password"}
                        >
                          {showSignupPwd ? <FaEyeSlash /> : <FaEye />}
                        </span>
                        {signupErrors.password && (
                          <span className="text-xs text-pink-500 ml-2">{signupErrors.password}</span>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`${pinkGradient} w-full py-3 rounded-xl text-lg font-bold text-white shadow-lg shadow-pink-200 mt-2 hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 animate-glow ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                      </button>
                      <div className="text-center text-sm mt-2">
                        Already have an account?{' '}
                        <span
                          className="text-pink-500 cursor-pointer hover:underline"
                          onClick={() => setTab("login")}
                        >
                          Log in
                        </span>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      transition={{ duration: 0.32 }}
                      className="flex flex-col gap-4"
                      onSubmit={handleLogin}
                      autoComplete="off"
                    >
                      <div>
                        <input
                          type="text"
                          name="username"
                          placeholder="Username"
                          className={`${inputBase} ${loginErrors.username ? errorInput : ""}`}
                          value={loginData.username}
                          onChange={handleLoginChange}
                        />
                        {loginErrors.username && (
                          <span className="text-xs text-pink-500 ml-2">{loginErrors.username}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          name="password"
                          placeholder="Password (6-digit)"
                          className={`${inputBase} pr-12 ${loginErrors.password ? errorInput : ""}`}
                          value={loginData.password}
                          onChange={handleLoginChange}
                          autoComplete="off"
                          maxLength={6}
                        />
                        <span
                          className="absolute right-4 top-2.5 text-gray-500 cursor-pointer"
                          onClick={() => setShowPwd((v) => !v)}
                          aria-label={showPwd ? "Hide password" : "Show password"}
                        >
                          {showPwd ? <FaEyeSlash /> : <FaEye />}
                        </span>
                        {loginErrors.password && (
                          <span className="text-xs text-pink-500 ml-2">{loginErrors.password}</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          className={`${inputBase} ${loginErrors.phone ? errorInput : ""}`}
                          value={loginData.phone}
                          onChange={handleLoginChange}
                        />
                        {loginErrors.phone && (
                          <span className="text-xs text-pink-500 ml-2">{loginErrors.phone}</span>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`${pinkGradient} w-full py-3 rounded-xl text-lg font-bold text-white shadow-lg shadow-pink-200 mt-2 hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 animate-glow ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'Logging In...' : 'Log In'}
                      </button>
                      <div className="text-center text-sm mt-2">
                        New here?{' '}
                        <span
                          className="text-pink-500 cursor-pointer hover:underline"
                          onClick={() => setTab("signup")}
                        >
                          Sign up
                        </span>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
                
                {/* Close button */}
                <button
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/50 hover:bg-white/70 text-pink-500 text-xl flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none"
                  onClick={onClose}
                  aria-label="Close"
                  type="button"
                >
                  ×
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
