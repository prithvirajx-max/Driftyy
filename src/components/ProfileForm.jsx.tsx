import { useState } from 'react';

export default function ProfileForm({ initialData = {} }) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    bio: initialData.bio || '',
    age: initialData.age || '',
    location: initialData.location || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile data:', formData);
    // Add your profile update API call here
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="profile-first-name" className="block text-sm font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              id="profile-first-name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="profile-last-name" className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="profile-last-name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="profile-bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border rounded"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="profile-age" className="block text-sm font-medium mb-1">
              Age
            </label>
            <input
              type="number"
              id="profile-age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="profile-location" className="block text-sm font-medium mb-1">
              Location
            </label>
            <input
              type="text"
              id="profile-location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}