'use client';

import { useState, useEffect } from 'react';

interface LightSettings {
  position: [number, number, number];
  color: string;
  intensity: number;
}

interface LightPanelProps {
  lightSettings: LightSettings;
  onUpdateLight: (settings: Partial<LightSettings>) => void;
  onClose: () => void;
}

export default function LightPanel({ lightSettings, onUpdateLight, onClose }: LightPanelProps) {
  const [position, setPosition] = useState(lightSettings.position);
  const [intensity, setIntensity] = useState(lightSettings.intensity);

  // 同步外部状态变化
  useEffect(() => {
    setPosition(lightSettings.position);
    setIntensity(lightSettings.intensity);
  }, [lightSettings.position, lightSettings.intensity]);

  const handlePositionChange = (axis: 0 | 1 | 2, value: number) => {
    const newPosition: [number, number, number] = [...position] as [number, number, number];
    newPosition[axis] = value;
    setPosition(newPosition);
    onUpdateLight({ position: newPosition });
  };

  const handleColorPreset = (color: string) => {
    onUpdateLight({ color });
  };

  return (
    <div className="absolute top-16 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          灯光设置
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 灯光位置控制 */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">灯光位置</label>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">💡 可直接拖动场景中的黄色小球</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 w-4">X</span>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.5"
              value={position[0]}
              onChange={(e) => handlePositionChange(0, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-mono text-gray-600 w-12 text-right">{position[0].toFixed(1)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 w-4">Y</span>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={position[1]}
              onChange={(e) => handlePositionChange(1, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-mono text-gray-600 w-12 text-right">{position[1].toFixed(1)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 w-4">Z</span>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.5"
              value={position[2]}
              onChange={(e) => handlePositionChange(2, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-mono text-gray-600 w-12 text-right">{position[2].toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* 灯光强度 */}
      <div className="space-y-2 mb-4">
        <label className="text-sm font-medium text-gray-700 block">灯光强度</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={intensity}
            onChange={(e) => {
              const newIntensity = parseFloat(e.target.value);
              setIntensity(newIntensity);
              onUpdateLight({ intensity: newIntensity });
            }}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-mono text-gray-600 w-12 text-right">{intensity.toFixed(1)}</span>
        </div>
      </div>

      {/* 色温预设 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">色温预设</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleColorPreset('#FFD4A3')}
            className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
              lightSettings.color === '#FFD4A3' 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#FFD4A3]"></div>
            <span className="text-xs font-medium text-gray-700">暖光</span>
          </button>
          
          <button
            onClick={() => handleColorPreset('#E8F4FF')}
            className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
              lightSettings.color === '#E8F4FF' 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#E8F4FF]"></div>
            <span className="text-xs font-medium text-gray-700">冷光</span>
          </button>
          
          <button
            onClick={() => handleColorPreset('#FFF5E6')}
            className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
              lightSettings.color === '#FFF5E6' 
                ? 'border-yellow-400 bg-yellow-50' 
                : 'border-gray-200 hover:border-yellow-300'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#FFF5E6]"></div>
            <span className="text-xs font-medium text-gray-700">自然光</span>
          </button>
          
          <button
            onClick={() => handleColorPreset('#FFFFFF')}
            className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
              lightSettings.color === '#FFFFFF' 
                ? 'border-gray-400 bg-gray-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
            <span className="text-xs font-medium text-gray-700">白光</span>
          </button>
        </div>
      </div>

      {/* 自定义颜色 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <label className="text-sm font-medium text-gray-700 block mb-2">自定义颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={lightSettings.color}
            onChange={(e) => onUpdateLight({ color: e.target.value })}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
          />
          <span className="text-xs font-mono text-gray-600">{lightSettings.color}</span>
        </div>
      </div>
    </div>
  );
}
