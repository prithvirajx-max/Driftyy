type Profile = {
  photos: (string | null)[];
  name: string;
  dob: string;
  gender: string;
  orientation: string;
  location: { city: string; country: string };
  bio: string;
  interests: string[];
  lifestyle: { smoking: string; drinking: string; diet: string };
  height: string;
  occupation: string;
  education: string;
  religion: string;
  lookingFor: string[];
  instagram: string;
};
