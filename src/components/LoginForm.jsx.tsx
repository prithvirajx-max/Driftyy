import { useState } from 'react';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
    // Add your login API call here
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="login-email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="login-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="login-password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="login-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="w-full px-3 py-2 border rounded"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <a href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot password?
        </a>
      </p>
    </div>
  );
}
