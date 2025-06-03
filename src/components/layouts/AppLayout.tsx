import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar (shown on all app pages) */}
      <nav className="bg-white shadow-sm p-4">
        <div className="flex space-x-4">
          <Link 
            to="/dashboard" 
            className="text-blue-600 hover:text-blue-800"
          >
            Dashboard
          </Link>
          <Link 
            to="/profile" 
            className="text-blue-600 hover:text-blue-800"
          >
            Profile
          </Link>
        </div>
      </nav>

      {/* Only the current page renders here */}
      <main className="p-4">
        <Outlet /> 
      </main>
    </div>
  );
}