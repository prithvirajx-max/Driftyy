import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import AuthModal from './auth/AuthModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Named export (recommended)
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#D8A7B1]">Drifty</h2>
            <div className="flex items-center gap-2">
              <button
                className="auth-login-btn"
                onClick={() => { setAuthTab('login'); setAuthOpen(true); }}
              >
                Login
              </button>
              <button
                className="auth-signup-btn"
                onClick={() => { setAuthTab('signup'); setAuthOpen(true); }}
              >
                Signup
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {[
              { path: '/dashboard', label: 'Dashboard' },
              { path: '/matches', label: 'Matches' },
              { path: '/messages', label: 'Messages' },
              { path: '/profile', label: 'Profile' },
              { path: '/settings', label: 'Settings' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="block px-4 py-3 text-gray-600 hover:bg-[#FFC9DE]/20 hover:text-[#D8A7B1] rounded mx-2 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {authOpen && (
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
      )}
    </>
  );
};

export default Sidebar;
