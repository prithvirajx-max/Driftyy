export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  bio: string;
  interests: string[];
  photos: string[];
  location: {
    city: string;
    state: string;
  };
  preferences: {
    minAge: number;
    maxAge: number;
    gender: ('male' | 'female' | 'non-binary' | 'other')[];
  };
  lookingFor?: string[];
  height?: string;
  education?: string;
  job?: string;
  jobTitle?: string;
  religion?: string;
  drinking?: string;
  smoking?: string;
  languages?: string[];
  lastActive: Date;
}
