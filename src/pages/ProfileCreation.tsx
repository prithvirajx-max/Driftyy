import { useState, useRef } from 'react';
import {
  Camera, Mic, ChevronRight, ChevronLeft, Save,
  User, Calendar, Heart, Globe, Briefcase, GraduationCap,
  Utensils, Wine, /* Smoking, */ TrendingUp, Flag, Music, Film,
  Languages, PawPrint, Sparkles, X
} from 'lucide-react';

interface ProfileState {
    name: string;
    age: string;
    gender: string;
    pronouns: string;
    orientation: string[];
    location: string;
    profession: string;
    education: string;
    voiceNote: string | null;
    about: string;
    prompts: { question: string; answer: string }[];
    relationshipGoals: string;
    height: string;
    bodyType: string;
    exercise: string;
    diet: string;
    smokes: string;
    drinks: string;
    greenFlags: string[];
    redFlags: string[];
    artists: string[];
    shows: string[];
    languages: string[];
    pets: string;
    religion: string;
    zodiac: string;
    photos: (string | null)[];
    instagram: string;
  }

const ProfileCreation = () => {
  // Form state
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileState>({
    // Section 1: Basics
    name: '',
    age: '',
    gender: '',
    pronouns: '',
    orientation: [],
    location: '',
    profession: '',
    education: '',
    voiceNote: null as string | null,
    about: '',
    prompts: Array(3).fill({ question: '', answer: '' }),
    
    // Section 2: Lifestyle
    relationshipGoals: '',
    height: '',
    bodyType: '',
    exercise: '',
    diet: '',
    smokes: '',
    drinks: '',
    greenFlags: [],
    redFlags: [],
    
    // Section 3: Interests
    artists: [],
    shows: [],
    languages: [],
    pets: '',
    religion: '',
    zodiac: '',
    
    // Section 4: Media
    photos: Array(6).fill(null) as (string | null)[],
    instagram: ''
  });

  // Voice recording
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Available options
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Custom'];
  const pronounOptions = ['he/him', 'she/her', 'they/them', 'Custom'];
  const orientationOptions = ['Straight', 'Gay', 'Bisexual', 'Pansexual', 'Queer'];
  const relationshipOptions = [
  'Local Friend',
  'Travel Buddy',
  'Casual Friend',
  'Hangout',
  'Deep Talk',
  'Companion',
  'True Love',
  'Culture Exchange',
  'Adventure Partner',
  'Coffee Date',
  'Real Connection',
  'Unexpected Moments',
  'City Explorer',
  'Language Partner',
  'Meaningful Bond',
  'Stranger to Soulmate'
];
  const flagOptions = ['Good listener', 'Empathetic', 'Honest', 'Adventurous'];
  const promptQuestions = [
    "My perfect day would be...",
    "I'm weirdly attracted to...",
    "Best life advice I've received..."
  ];

  // Handlers
  const handlePhotoUpload = (index: number, file: File | undefined | null) => {
    if (!file) {
      return; // No file selected or dialog cancelled
    }
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setProfile(prev => ({
        ...prev,
        photos: prev.photos.map((p, i) => i === index ? reader.result as string : p)
      }));
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current);
        const audioUrl = URL.createObjectURL(audioBlob);
        setProfile(prev => ({ ...prev, voiceNote: audioUrl }));
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Error recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const saveSection = () => {
    // Implement auto-save logic here
    console.log('Saved section', step, profile);
  };

  return (
    <div className="max-w-md mx-auto p-4 font-[Poppins] text-gray-700">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {['Basics', 'Lifestyle', 'Interests', 'Media'].map((label, i) => (
          <div key={label} className="text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2
              ${i+1 <= step ? 'bg-[#FFC9DE] text-white' : 'bg-gray-200'}`}>
              {i+1}
            </div>
            <span className={`text-xs ${i+1 <= step ? 'text-[#D8A7B1] font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* SECTION 1: BASICS */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-[#D8A7B1] mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <User size={16} /> Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CBAACB]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar size={16} /> Age
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CBAACB]"
                    min="18"
                    max="100"
                  />
                </div>
              </div>

              {/* Gender & Pronouns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Heart size={16} /> Gender
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({...profile, gender: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CBAACB]"
                  >
                    <option value="">Select</option>
                    {genderOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    Pronouns
                  </label>
                  <select
                    value={profile.pronouns}
                    onChange={(e) => setProfile({...profile, pronouns: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CBAACB]"
                  >
                    <option value="">Select</option>
                    {pronounOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Profession */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Globe size={16} /> Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CBAACB]"
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase size={16} /> Profession
                </label>
                <input
                  type="text"
                  value={profile.profession}
                  onChange={(e) => setProfile({...profile, profession: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CBAACB]"
                />
              </div>

              {/* Voice Note */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Voice Introduction</label>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    className={`p-3 rounded-full ${recording ? 'bg-red-500' : 'bg-[#CBAACB]'} text-white`}
                  >
                    <Mic size={18} />
                  </button>
                  {profile.voiceNote && (
                    <audio controls src={profile.voiceNote} className="flex-1" />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* SECTION 4: MEDIA (Photos) */}
        {step === 4 && (
          <>
            <h2 className="text-2xl font-bold text-[#D8A7B1] mb-4">Photos (6)</h2>
            <div className="grid grid-cols-3 gap-4">
              {profile.photos.map((photo, index) => (
                <div key={index} className="aspect-[3/4] bg-gray-100 rounded-xl relative overflow-hidden">
                  {photo ? (
                    <>
                      <img 
                        src={photo} 
                        className="w-full h-full object-cover rounded-xl" 
                        alt={`Profile ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setProfile(prev => ({
                          ...prev,
                          photos: prev.photos.map((p, i) => i === index ? null : p)
                        }))}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 transition-colors"
                      >
                        <X className="text-red-500" size={16} />
                      </button>
                    </>
                  ) : (
                    <label
                      htmlFor={`photo-upload-${index}`}
                      className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        id={`photo-upload-${index}`}
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handlePhotoUpload(index, e.target.files[0]);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="text-gray-400" size={24} />
                        <span className="text-xs text-gray-500">Add photo</span>
                      </div>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-12 flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              saveSection();
              setStep(step - 1);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#FAF5F0] text-[#D8A7B1] rounded-lg"
          >
            <ChevronLeft size={18} /> Back
          </button>
        )}
        
        {step < 4 ? (
          <button
            type="button"
            onClick={() => {
              saveSection();
              setStep(step + 1);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFC9DE] text-white rounded-lg ml-auto"
          >
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              saveSection();
              console.log('Final profile:', profile);
              // Add submission logic here
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#D8A7B1] text-white rounded-lg ml-auto"
          >
            <Save size={18} /> Complete Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCreation;