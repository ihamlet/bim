'use client';

import type { SceneObjectData } from '../types/editor';

interface PropertiesPanelProps {
  object: SceneObjectData | undefined;
  onUpdate: (updates: Partial<SceneObjectData>) => void;
}

export default function PropertiesPanel({ object, onUpdate }: PropertiesPanelProps) {
  if (!object) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">属性面板</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
          <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-sm text-center font-medium">选择一个对象</p>
          <p className="text-xs text-center mt-1">查看和编辑属性</p>
        </div>
      </div>
    );
  }

  const updateTransform = (
    type: 'position' | 'rotation' | 'scale',
    index: number,
    value: number
  ) => {
    const newValues = [...object[type]] as [number, number, number];
    newValues[index] = value;
    onUpdate({ [type]: newValues });
  };

  const InputGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const AxisInput = ({ 
    axis, 
    value, 
    onChange, 
    step = 0.1,
    min,
    color = 'blue'
  }: { 
    axis: string; 
    value: number; 
    onChange: (val: number) => void;
    step?: number;
    min?: number;
    color?: 'blue' | 'green' | 'red';
  }) => {
    const colors = {
      blue: 'focus:border-blue-500 focus:ring-blue-500',
      green: 'focus:border-green-500 focus:ring-green-500',
      red: 'focus:border-red-500 focus:ring-red-500',
    };
    
    return (
      <div>
        <label className={`block text-xs font-medium mb-1.5 ${
          color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : 'text-blue-600'
        }`}>
          {axis}
        </label>
        <input
          type="number"
          step={step}
          min={min}
          value={value.toFixed(2)}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ${colors[color]}`}
        />
      </div>
    );
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">属性面板</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 名称 */}
        <InputGroup label="名称">
          <input
            type="text"
            value={object.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="对象名称"
          />
        </InputGroup>

        {/* 颜色 */}
        <InputGroup label="颜色">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={object.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-10 h-10 rounded-md cursor-pointer border border-gray-300"
            />
            <input
              type="text"
              value={object.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="#000000"
            />
          </div>
        </InputGroup>

        {/* 位置 */}
        <InputGroup label="位置">
          <div className="grid grid-cols-3 gap-2">
            <AxisInput
              axis="X"
              value={object.position[0]}
              onChange={(val) => updateTransform('position', 0, val)}
              color="red"
            />
            <AxisInput
              axis="Y"
              value={object.position[1]}
              onChange={(val) => updateTransform('position', 1, val)}
              color="green"
            />
            <AxisInput
              axis="Z"
              value={object.position[2]}
              onChange={(val) => updateTransform('position', 2, val)}
              color="blue"
            />
          </div>
        </InputGroup>

        {/* 旋转 */}
        <InputGroup label="旋转">
          <div className="grid grid-cols-3 gap-2">
            <AxisInput
              axis="X"
              value={object.rotation[0]}
              onChange={(val) => updateTransform('rotation', 0, val)}
              step={0.01}
              color="red"
            />
            <AxisInput
              axis="Y"
              value={object.rotation[1]}
              onChange={(val) => updateTransform('rotation', 1, val)}
              step={0.01}
              color="green"
            />
            <AxisInput
              axis="Z"
              value={object.rotation[2]}
              onChange={(val) => updateTransform('rotation', 2, val)}
              step={0.01}
              color="blue"
            />
          </div>
        </InputGroup>

        {/* 缩放 */}
        <InputGroup label="缩放">
          <div className="grid grid-cols-3 gap-2">
            <AxisInput
              axis="X"
              value={object.scale[0]}
              onChange={(val) => updateTransform('scale', 0, val)}
              min={0.1}
              color="red"
            />
            <AxisInput
              axis="Y"
              value={object.scale[1]}
              onChange={(val) => updateTransform('scale', 1, val)}
              min={0.1}
              color="green"
            />
            <AxisInput
              axis="Z"
              value={object.scale[2]}
              onChange={(val) => updateTransform('scale', 2, val)}
              min={0.1}
              color="blue"
            />
          </div>
        </InputGroup>

        {/* 可见性 */}
        <InputGroup label="可见性">
          <button
            onClick={() => onUpdate({ visible: !object.visible })}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
              object.visible 
                ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100' 
                : 'bg-gray-50 text-gray-600 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {object.visible ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                可见
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                隐藏
              </>
            )}
          </button>
        </InputGroup>

        {/* 信息 */}
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex justify-between">
              <span className="font-medium">类型:</span>
              <span className="font-mono capitalize">{object.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span className="font-mono text-gray-400 truncate max-w-[150px]" title={object.id}>
                {object.id.slice(-8)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
