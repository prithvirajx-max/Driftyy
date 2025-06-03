import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Video, Mic, MicOff, VideoOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { potentialMatches } from "../data/mockData";

const VideoChat: React.FC = () => {
  const navigate = useNavigate();
  const { matchId: _matchId } = useParams();
  const { toast } = useToast();
  
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionTime, setConnectionTime] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream|null>(null);
  const connectionTimerRef = useRef<NodeJS.Timeout|null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Couldn't access camera/microphone",
        variant: "destructive"
      });
    }
  }, [toast]);

  const simulateConnection = useCallback(() => {
    setIsConnected(true);
    if (remoteVideoRef.current && potentialMatches[0]) {
      remoteVideoRef.current.poster = potentialMatches[0].images[0];
      toast({
        title: "Connected!",
        description: `You're chatting with ${potentialMatches[0].name}`
      });
    }
  }, [toast]);

  useEffect(() => {
    const init = async () => {
      await startCamera();
      simulateConnection();
    };
    init();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
      }
    };
  }, [startCamera, simulateConnection]);

  useEffect(() => {
    if (isConnected) {
      connectionTimerRef.current = setInterval(() => {
        setConnectionTime(prev => prev + 1);
      }, 1000);
      return () => {
        if (connectionTimerRef.current) {
          clearInterval(connectionTimerRef.current);
        }
      };
    }
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex-1 relative bg-black">
        {isConnected && (
          <>
            <video 
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden border-2 border-white">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`}
              />
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsMicMuted(!isMicMuted)}
            aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMicMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsCameraOff(!isCameraOff)}
            aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {isCameraOff ? <VideoOff /> : <Video />}
          </Button>
        </div>
        
        <div className="text-sm">
          {formatTime(connectionTime)}
        </div>
        
        <Button 
          variant="destructive" 
          onClick={() => navigate('/messages')}
        >
          End Call
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;