import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { WASM_FILES_URL } from '../constants';

interface HandTrackerProps {
  onHandUpdate: (distance: number, isTracking: boolean) => void;
  isEnabled: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, isEnabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastVideoTimeRef = useRef(-1);
  // Initialize useRef with undefined to satisfy strict argument requirements
  const requestRef = useRef<number | undefined>(undefined);
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  // 1. Initialize Model once
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_FILES_URL);
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        setModelReady(true);
        setLoading(false);
      } catch (err) {
        console.error("Failed to init MediaPipe:", err);
        setError("无法加载手势识别模型");
        setLoading(false);
      }
    };

    initMediaPipe();
    
    // Cleanup model on unmount (optional, usually kept alive)
    return () => {
       if (landmarkerRef.current) {
         landmarkerRef.current.close();
       }
    };
  }, []);

  // 2. Handle Camera Start/Stop based on isEnabled and modelReady
  useEffect(() => {
    if (!modelReady) return;

    const startWebcam = async () => {
      if (!videoRef.current) return;
      setError(null);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user' 
          } 
        });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      } catch (err) {
        console.error("Webcam error:", err);
        setError("摄像头访问被拒绝");
      }
    };

    const stopWebcam = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };

    if (isEnabled) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, modelReady]);

  const predictWebcam = () => {
    if (!landmarkerRef.current || !videoRef.current || !isEnabled) return;

    let startTimeMs = performance.now();
    
    if (videoRef.current.currentTime && lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      
      try {
        const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          let distance = 0;
          
          if (results.landmarks.length === 2) {
            // Two hands - distance between wrists
            const hand1 = results.landmarks[0][0];
            const hand2 = results.landmarks[1][0];
            const dx = hand1.x - hand2.x;
            const dy = hand1.y - hand2.y;
            const rawDist = Math.sqrt(dx * dx + dy * dy);
            distance = Math.min(Math.max((rawDist - 0.1) * 2.5, 0), 2);
          } else {
            // One hand - Pinch
            const hand = results.landmarks[0];
            const thumb = hand[4];
            const index = hand[8];
            const dx = thumb.x - index.x;
            const dy = thumb.y - index.y;
            const rawDist = Math.sqrt(dx * dx + dy * dy);
            distance = Math.min(Math.max((rawDist * 8), 0.2), 1.5);
          }

          onHandUpdate(distance, true);
        } else {
          onHandUpdate(0, false);
        }
      } catch (e) {
        console.warn("Detection error", e);
      }
    }

    if (isEnabled) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  if (!isEnabled) {
    return (
      <div className="absolute top-4 right-4 z-50 pointer-events-none">
         <div className="flex items-center justify-center w-32 h-24 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 text-white/30 text-xs">
            摄像头已关闭
         </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg bg-black/50 backdrop-blur-sm">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
          autoPlay 
          playsInline
          muted
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white bg-black/80">
            加载模型...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-[10px] text-red-400 bg-black/90">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className="absolute bottom-1 right-1">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] text-white/80 uppercase">Live</span>
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-white/60 text-right max-w-[150px]">
        尝试双手合拢/张开<br/>或单手捏合
      </p>
    </div>
  );
};

export default HandTracker;