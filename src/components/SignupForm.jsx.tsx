import { useState } from 'react';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Signup data:', formData);
    // Add your signup API call here
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="signup-username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            type="text"
            id="signup-username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="cooluser123"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="signup-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="signup-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="signup-password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="signup-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="w-full px-3 py-2 border rounded"
            placeholder="••••••••"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="signup-confirm-password" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="signup-confirm-password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
