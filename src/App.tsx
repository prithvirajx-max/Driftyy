import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/MotionComponentFix.css';
import HomePage from './pages/HomePage';
import MainApp from './pages/MainApp';
import ProfilePage from './pages/ProfilePage';
import HangoutPage from './pages/HangoutPage';
import VideoChatPage from './pages/VideoChatPage';
import LandingExperience from './pages/LandingExperience';
import Messages from './pages/Messages';
import ChatRoom from './pages/ChatRoom';
import MatchingPage from './pages/MatchingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PhoneVerification from './components/PhoneVerification';
import BackButton from './components/BackButton';
import AppProvider from './contexts/AppProvider';
import { AdminRoute } from './components/auth/AuthRoutes';
import AuthRoutes from './components/auth/AuthRoutes';

import { DriftyyGoogleOAuthProvider } from './GoogleOAuthProvider';

function App() {
  return (
    <DriftyyGoogleOAuthProvider>
      <AppProvider>
        <Router>
        <BackButton />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/experience" element={<LandingExperience />} />
          <Route path="/home" element={<HomePage />} />
          
          {/* Auth routes for OAuth callbacks */}
          <Route path="/auth/*" element={<AuthRoutes />} />
          
          {/* Phone verification route - direct access for testing */}
          <Route path="/phone-verification" element={<PhoneVerification />} />
          
          {/* Routes accessible without authentication */}
          <Route path="/app" element={<MainApp />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/hangout" element={<HangoutPage />} />
          <Route path="/video-chat" element={<VideoChatPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat/:id" element={<ChatRoom />} />
          <Route path="/matching" element={<MatchingPage />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
        </Routes>
      </Router>
      </AppProvider>
    </DriftyyGoogleOAuthProvider>
  );
}

export default App;