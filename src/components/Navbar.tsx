import { Link } from "react-router-dom";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded"
        >
          <svg 
            className="w-6 h-6 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Link 
          to="/" 
          className="text-xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
        >
          Drifty
        </Link>
        <div className="flex gap-6">
          <Link 
            to="/matches" 
            className="text-gray-600 hover:text-purple-600 transition-colors"
            aria-label="View matches"
          >
            Matches
          </Link>
          <Link 
            to="/messages" 
            className="text-gray-600 hover:text-purple-600 transition-colors"
            aria-label="View messages"
          >
            Messages
          </Link>
          <Link 
            to="/profile" 
            className="text-gray-600 hover:text-purple-600 transition-colors"
            aria-label="View profile"
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}