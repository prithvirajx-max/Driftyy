import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Styles for glassmorphism UI
const glassCard = "backdrop-blur-xl bg-white/30 border border-white/30 shadow-2xl rounded-2xl p-7 max-w-md w-full mx-auto flex flex-col gap-5 relative overflow-hidden";
const socialButton = "flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl text-gray-800 font-medium transition-all duration-200 border border-white/40 bg-white/50 hover:bg-white/70 backdrop-filter backdrop-blur-sm shadow-md hover:shadow-lg";

// Hook to handle clicking outside the modal to close it
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

export const AuthModal: React.FC<{
  open: boolean;
  onClose: () => void;
  mode?: "login" | "signup" | "all";
}> = ({ open, onClose, mode = "all" }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(mode === "login");
  useOutsideClick(modalRef, onClose);
  
  // Get auth functions from context
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const [isGoogleLoginProcessing, setIsGoogleLoginProcessing] = useState(false);

  // Handle Google login button
  const handleGoogleLogin = () => {
    setIsGoogleLoginProcessing(true);
    loginWithGoogle();
  };

  useEffect(() => {
    if (isAuthenticated || !open) {
      setIsGoogleLoginProcessing(false);
    }
  }, [isAuthenticated, open]);


  // Toggle between login and signup modes
  const toggleMode = () => {
    if (mode === "all") {
      setIsLoggingIn(!isLoggingIn);
    }
  };

  // Get the title based on mode
  const getTitle = () => {
    if (mode === "login") return "Log in to Drifty";
    if (mode === "signup") return "Create your Drifty account";
    return isLoggingIn ? "Log in to Drifty" : "Join Drifty";
  };

  // Get the subtitle based on mode
  const getSubtitle = () => {
    if (mode === "login" || (mode === "all" && isLoggingIn)) {
      return "Sign in with your social accounts";
    }
    return "Create an account with:";
  };

  // Get the toggle text based on current mode
  const getToggleText = () => {
    if (mode !== "all") return null;
    if (isLoggingIn) {
      return (
        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account?{" "}
          <button onClick={toggleMode} className="text-pink-600 hover:text-pink-700 font-medium">
            Sign up
          </button>
        </p>
      );
    }
    return (
      <p className="text-center text-gray-600 text-sm mt-4">
        Already have an account?{" "}
        <button onClick={toggleMode} className="text-pink-600 hover:text-pink-700 font-medium">
          Log in
        </button>
      </p>
    );
  };

  // Render the content of the auth modal with social buttons
  const renderAuthContent = () => (
    <div className="flex flex-col gap-6 w-full">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{getTitle()}</h2>
        <p className="text-gray-600">{getSubtitle()}</p>
      </div>
      
      <button
        onClick={() => {
          // Do NOT close modal or navigate away here
          handleGoogleLogin();
        }}
        disabled={isGoogleLoginProcessing}
        className={`${socialButton}`}
      >
        <FcGoogle size={24} />
        <span>{isGoogleLoginProcessing ? "Please wait..." : "Continue with Google"}</span>
      </button>
      {isGoogleLoginProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
            <svg className="animate-spin h-7 w-7 text-pink-500 mb-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-pink-600 font-medium">Redirecting to Google...</span>
          </div>
        </div>
      )}

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300/50"></div>
        </div>
      </div>
      
      {getToggleText()}
      
      <p className="text-center text-gray-600 text-sm">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 py-8 overflow-auto bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
          >
            <div className={`${glassCard} shadow-pink-500/10`} ref={modalRef}>
              {/* Disable closing modal by clicking close button if loading */}
              <button
                onClick={() => {
                  if (!isGoogleLoginProcessing) onClose();
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close"
                disabled={isGoogleLoginProcessing}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              
              {renderAuthContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
