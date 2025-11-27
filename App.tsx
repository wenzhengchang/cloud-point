import React, { useState, useCallback, useEffect } from 'react';
import ParticleScene from './components/ParticleScene';
import HandTracker from './components/HandTracker';
import Controls from './components/UI/Controls';
import { ShapeType } from './types';

const App: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>(ShapeType.HEART);
  const [color, setColor] = useState<string>('#60a5fa'); // Tailwind Blue-400
  const [handDistance, setHandDistance] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(true);

  // Callback from HandTracker
  const handleHandUpdate = useCallback((dist: number, tracking: boolean) => {
    setHandDistance(dist);
    setIsTracking(tracking);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const toggleCamera = () => {
    setIsCameraEnabled(prev => !prev);
    // If turning off camera, ensure tracking stops immediately
    if (isCameraEnabled) {
      setIsTracking(false);
      setHandDistance(0);
    }
  };

  // Listen for fullscreen changes via ESC key
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return (
    <div className="relative w-full h-full font-sans select-none text-white">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <ParticleScene 
          shape={shape} 
          color={color} 
          handDistance={handDistance} 
          isTracking={isTracking}
        />
      </div>

      {/* Vision Layer */}
      <HandTracker 
        onHandUpdate={handleHandUpdate} 
        isEnabled={isCameraEnabled}
      />

      {/* UI Layer */}
      <Controls 
        currentShape={shape} 
        setShape={setShape} 
        color={color} 
        setColor={setColor}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        isCameraEnabled={isCameraEnabled}
        toggleCamera={toggleCamera}
      />

      {/* Status Indicators (Optional debug) */}
      {!isTracking && (
        <div className="absolute top-4 left-4 z-30 pointer-events-none opacity-50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCameraEnabled ? 'bg-blue-400' : 'bg-gray-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isCameraEnabled ? 'bg-blue-500' : 'bg-gray-500'}`}></span>
            </span>
            <span className="text-xs text-blue-200">
              {isCameraEnabled ? '自动演示模式 (未检测到手势)' : '自动演示模式 (摄像头已关闭)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;