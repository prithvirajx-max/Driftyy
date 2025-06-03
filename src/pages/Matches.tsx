import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Heart, X, MessageSquare } from 'lucide-react';

interface MatchCardProps {
  user: User;
  onLike: () => void;
  onPass: () => void;
  onMessage: () => void;
}

const MatchCard = ({ user, onLike, onPass, onMessage }: MatchCardProps) => {
  return (
    <div className="relative w-full max-w-sm mx-auto mb-6 bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Profile Image */}
      <div className="aspect-[3/4] bg-gray-100">
        {user.photos[0] && (
          <img 
            src={user.photos[0]} 
            className="w-full h-full object-cover"
            alt={user.name}
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{user.name}, {user.age}</h3>
        <p className="text-gray-600 mb-4">{user.bio}</p>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onPass}
            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            onClick={onMessage}
            className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          
          <button 
            onClick={onLike}
            className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Matches() {
  const [matches, setMatches] = useState<User[]>([]);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);

  // Hide any ProfileCreation components that might be showing on this page
  useEffect(() => {
    // Find and hide any ProfileCreation components
    const profileCreationElements = document.querySelectorAll('[data-component-name="ProfileCreation"]');
    profileCreationElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.display = 'none';
      }
    });

    return () => {
      // Restore elements if needed when component unmounts
      profileCreationElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = '';
        }
      });
    };
  }, []);

  const handleLike = (userId: string) => {
    setLikedUsers(prev => [...prev, userId]);
  };

  const handlePass = (userId: string) => {
    setMatches(prev => prev.filter(user => user.id !== userId));
  };

  const handleMessage = (userId: string) => {
    // TODO: Implement messaging functionality
    console.log('Message sent to:', userId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Potential Matches</h1>
      <div className="space-y-6">
        {matches.map((user) => (
          <MatchCard
            key={user.id}
            user={user}
            onLike={() => handleLike(user.id)}
            onPass={() => handlePass(user.id)}
            onMessage={() => handleMessage(user.id)}
          />
        ))}
      </div>
    </div>
  );
};
