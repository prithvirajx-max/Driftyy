import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Drifty!</h1>
      <p className="text-lg mb-8">Find your perfect match</p>
      
      {/* Only added this button - rest remains unchanged */}
      <Link
        to="/profile"
        className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Go to Profile
      </Link>
    </div>
  );
}