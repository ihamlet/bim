'use client';

interface ToolbarProps {
  onAddObject: (type: string) => void;
  onExport: () => void;
  onImport: () => void;
  onToggleLightPanel: () => void;
}

export default function Toolbar({ onAddObject, onExport, onImport, onToggleLightPanel }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">添加</span>
          <div className="h-4 w-px bg-gray-300"></div>
        </div>
        
        <button
          onClick={() => onAddObject('cube')}
          className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="添加立方体"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>立方体</span>
        </button>
        
        <button
          onClick={() => onAddObject('sphere')}
          className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="添加球体"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
          </svg>
          <span>球体</span>
        </button>
        
        <button
          onClick={() => onAddObject('cylinder')}
          className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="添加圆柱体"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <ellipse cx="12" cy="6" rx="8" ry="3" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
          </svg>
          <span>圆柱</span>
        </button>
        
        <button
          onClick={() => onAddObject('cone')}
          className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="添加圆锥体"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3L4 19h16L12 3z" />
          </svg>
          <span>圆锥</span>
        </button>
        
        <button
          onClick={() => onAddObject('plane')}
          className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="添加可编辑平面"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M3 12h18" />
          </svg>
          <span>平面</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLightPanel}
          className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200 hover:border-yellow-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="灯光设置"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          <span>灯光</span>
        </button>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        <div className="text-xs text-gray-500">
          <span className="font-medium">提示:</span> 拖动对象移动 · 拖动黄色小球调整灯光 · Shift+拖动平面顶点调整高度 · 空白处拖动旋转视角
        </div>
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        <button
          onClick={onImport}
          className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="导入 GLB/GLTF 模型"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>导入模型</span>
        </button>
        
        <button
          onClick={onExport}
          className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="导出为 GLB 格式"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>导出模型</span>
        </button>
      </div>
    </div>
  );
}
