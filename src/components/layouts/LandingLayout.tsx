import { ReactNode } from "react";
import Navbar from "../Navbar"; // Assuming Navbar is in the components folder

interface LandingLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

const LandingLayout = ({ 
  children, 
  showNavbar = true 
}: LandingLayoutProps) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {showNavbar && <Navbar />}
    <main className="flex-1">
      {children}
    </main>
    {/* Optional footer can be added here */}
  </div>
);

export default LandingLayout;