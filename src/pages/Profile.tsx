import { useState, useRef } from 'react';
import { 
  Heart, X, Star, Volume2, ChevronLeft, ChevronRight,
  MapPin, Briefcase, MessageSquare, Hash, Film, Music,
  Coffee, Wine, Smoking, TrendingUp, PawPrint, Sparkles
} from 'lucide-react';

const ProfileDisplay = ({ profile }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // Handle photo navigation
  const handlePhotoChange = (direction) => {
    setCurrentPhotoIndex(prev => 
      direction === 'next'
        ? (prev + 1) % profile.photos.length
        : (prev - 1 + profile.photos.length) % profile.photos.length
    );
  };

  // Toggle audio playback
  const toggleAudio = () => {
    if (audioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setAudioPlaying(!audioPlaying);
  };

  return (
    <div className="max-w-sm mx-auto bg-[#FAF5F0] rounded-2xl shadow-lg overflow-hidden font-[Poppins]">
      {/* Photo Gallery */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {profile.photos[currentPhotoIndex] && (
          <img 
            src={profile.photos[currentPhotoIndex]} 
            className="w-full h-full object-cover"
            alt={`Profile photo ${currentPhotoIndex + 1}`}
          />
        )}
        
        {/* Navigation Arrows */}
        {profile.photos.length > 1 && (
          <>
            <button 
              onClick={() => handlePhotoChange('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
            >
              <ChevronLeft className="text-[#D8A7B1]" size={20} />
            </button>
            <button 
              onClick={() => handlePhotoChange('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
            >
              <ChevronRight className="text-[#D8A7B1]" size={20} />
            </button>
          </>
        )}
        
        {/* Photo Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {profile.photos.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-[#FFC9DE] w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#D8A7B1]">
              {profile.name}, <span className="text-gray-600">{profile.age}</span>
            </h1>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <MapPin size={16} />
              <span>{profile.location}</span>
            </div>
            {profile.profession && (
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Briefcase size={16} />
                <span>{profile.profession}</span>
              </div>
            )}
          </div>
          
          {/* Voice Note */}
          {profile.voiceNote && (
            <button 
              onClick={toggleAudio}
              className={`p-3 rounded-full ${audioPlaying ? 'bg-[#CBAACB]' : 'bg-[#FFD9B3]'} text-white shadow-md`}
            >
              <Volume2 size={18} />
            </button>
          )}
        </div>
        <audio 
          ref={audioRef}
          src={profile.voiceNote} 
          onEnded={() => setAudioPlaying(false)}
          hidden
        />

        {/* About Me */}
        {profile.about && (
          <div className="bg-white/50 p-4 rounded-lg">
            <h2 className="font-semibold text-[#D8A7B1] mb-1">About Me</h2>
            <p className="text-gray-700">{profile.about}</p>
          </div>
        )}

        {/* Prompts */}
        {profile.prompts?.filter(p => p.answer).length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-[#D8A7B1]">Prompts</h2>
            {profile.prompts.map((prompt, index) => (
              prompt.answer && (
                <div key={index} className="bg-white/50 p-4 rounded-lg">
                  <p className="font-medium text-gray-600">{prompt.question}</p>
                  <p className="text-gray-700 mt-1">{prompt.answer}</p>
                </div>
              )
            ))}
          </div>
        )}

        {/* Lifestyle Tags */}
        <div className="flex flex-wrap gap-2">
          {profile.relationshipGoals && (
            <span className="bg-[#FFC9DE]/30 text-[#D8A7B1] px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Heart size={14} />
              {profile.relationshipGoals}
            </span>
          )}
          {profile.height && (
            <span className="bg-[#FFD9B3]/30 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <TrendingUp size={14} />
              {profile.height}
            </span>
          )}
          {profile.exercise && (
            <span className="bg-[#CBAACB]/30 text-[#6B4E71] px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <TrendingUp size={14} />
              {profile.exercise}
            </span>
          )}
          {profile.diet && (
            <span className="bg-[#D8A7B1]/30 text-[#8E5A6D] px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Utensils size={14} />
              {profile.diet}
            </span>
          )}
        </div>

        {/* Interests */}
        <div className="pt-2">
          <h2 className="font-semibold text-[#D8A7B1] mb-2">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {profile.artists?.length > 0 && (
              <span className="bg-white/70 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Music size={14} /> {profile.artists.join(', ')}
              </span>
            )}
            {profile.shows?.length > 0 && (
              <span className="bg-white/70 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Film size={14} /> {profile.shows.join(', ')}
              </span>
            )}
            {profile.languages?.length > 0 && (
              <span className="bg-white/70 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Languages size={14} /> {profile.languages.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex justify-center gap-6 bg-white/50">
        <button className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
          <X className="text-red-400" size={24} />
        </button>
        <button className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
          <Star className="text-blue-400" size={24} />
        </button>
        <button className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
          <Heart className="text-green-400" size={24} />
        </button>
      </div>
    </div>
  );
};

export default ProfileDisplay;