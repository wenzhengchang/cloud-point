import React from 'react';
import { ShapeType } from '../../types';
import { SHAPE_CONFIGS } from '../../constants';

interface ControlsProps {
  currentShape: ShapeType;
  setShape: (s: ShapeType) => void;
  color: string;
  setColor: (c: string) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isCameraEnabled: boolean;
  toggleCamera: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  currentShape, 
  setShape, 
  color, 
  setColor,
  isFullscreen,
  toggleFullscreen,
  isCameraEnabled,
  toggleCamera
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-40">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-fade-in-up">
        
        {/* Header and Top Actions */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
              粒子视界 Controller
            </h1>
            <p className="text-xs text-blue-200/60 mt-1">使用摄像头手势控制粒子张缩</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleCamera}
              className={`p-2 rounded-full transition-colors ${isCameraEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'}`}
              title={isCameraEnabled ? "关闭摄像头" : "开启摄像头"}
            >
              {isCameraEnabled ? (
                 // Camera On Icon
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              ) : (
                 // Camera Off Icon
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              )}
            </button>
            
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80"
              title="全屏模式"
            >
              {isFullscreen ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Shape Selectors */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {SHAPE_CONFIGS.map((config) => (
              <button
                key={config.id}
                onClick={() => setShape(config.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${currentShape === config.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}
                `}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            ))}
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5 ml-auto">
            <span className="text-xs text-white/60 whitespace-nowrap">粒子色调</span>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 hover:scale-110 transition-transform cursor-pointer">
              <input 
                type="color" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-0"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Controls;