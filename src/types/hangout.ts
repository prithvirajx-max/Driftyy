import { Timestamp } from 'firebase/firestore';

export interface Location {
  lat: number;
  lng: number;
}

export interface UserAvailability {
  isAvailable: boolean;
  reason: string;
  duration: string;
  location: Location;
  lastActiveAt: Timestamp;
}

// This interface matches the mock User interface but uses Firebase data
export interface FirebaseUser {
  id: string;
  name: string;
  age: number;
  distance: number;
  photo: string;
  availabilityReason: string;
  availabilityDuration: string;
  religion?: string;
  height?: string;
  bio?: string;
  gender: 'male' | 'female' | 'other';
  lastActive?: string;
  location?: Location;
}
