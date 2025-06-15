export interface GoogleUser {
  id: string; // This is equivalent to uid
  name: string;
  email: string;
  picture: string;
  token: string;
}

export interface AuthContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}
