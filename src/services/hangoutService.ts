import { doc, updateDoc, query, collection, where, getDocs, GeoPoint, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Location, UserAvailability, FirebaseUser } from '../types/hangout';

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export const hangoutService = {
  // Update user's availability status
  async updateAvailability(
    userId: string,
    data: {
      isAvailable: boolean;
      reason: string;
      duration: string;
      location: Location;
    }
  ): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const availability: UserAvailability = {
      isAvailable: data.isAvailable,
      reason: data.reason,
      duration: data.duration,
      location: data.location,
      lastActiveAt: Timestamp.now()
    };

    await updateDoc(userRef, {
      'availability': availability
    });
  },

  // Get nearby available users within radius
  async getNearbyUsers(
    currentUserLocation: Location,
    maxDistance: number = 30,
    genderFilter: 'all' | 'male' | 'female' = 'all'
  ): Promise<FirebaseUser[]> {
    try {
      // Query for users who are available
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('availability.isAvailable', '==', true),
        orderBy('availability.lastActiveAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const nearbyUsers: FirebaseUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        
        // Skip if no location data
        if (!userData?.availability?.location) return;
        
        const distance = calculateDistance(
          currentUserLocation.lat,
          currentUserLocation.lng,
          userData.availability.location.lat,
          userData.availability.location.lng
        );
        
        // Check if user is within the specified distance
        if (distance <= maxDistance) {
          // Apply gender filter if specified
          if (genderFilter === 'all' || userData.gender === genderFilter) {
            nearbyUsers.push({
              id: doc.id,
              name: userData.name || 'Anonymous',
              age: userData.age || 0,
              distance: distance,
              photo: userData.photo || '',
              availabilityReason: userData.availability?.reason || '',
              availabilityDuration: userData.availability?.duration || '',
              religion: userData.religion,
              height: userData.height,
              bio: userData.bio,
              gender: userData.gender || 'other',
              lastActive: userData.availability?.lastActiveAt?.toDate().toLocaleString(),
              location: userData.availability?.location
            });
          }
        }
      });
      
      // Sort by distance
      return nearbyUsers.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      throw error;
    }
  },

  // Get current location
  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
};
