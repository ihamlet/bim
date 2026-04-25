'use client';

import type { SceneObjectData } from '../types/editor';

interface SceneHierarchyProps {
  objects: SceneObjectData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SceneHierarchy({
  objects,
  selectedId,
  onSelect,
  onDelete,
}: SceneHierarchyProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">场景层级</h2>
        <p className="text-xs text-gray-500 mt-1">{objects.length} 个对象</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {objects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-center">暂无对象</p>
            <p className="text-xs text-center mt-1">点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-1">
            {objects.map((obj) => (
              <div
                key={obj.id}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedId === obj.id 
                    ? 'bg-blue-50 border border-blue-300 shadow-sm' 
                    : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
                onClick={() => onSelect(obj.id)}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
                    selectedId === obj.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {obj.type === 'cube' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                    {obj.type === 'sphere' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                      </svg>
                    )}
                    {obj.type === 'cylinder' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <ellipse cx="12" cy="6" rx="7" ry="2.5" strokeWidth={2} />
                        <path strokeLinecap="round" strokeWidth={2} d="M5 6v12c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V6" />
                      </svg>
                    )}
                    {obj.type === 'cone' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3L4 19h16L12 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      selectedId === obj.id ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {obj.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{obj.type}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(obj.id);
                  }}
                  className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="删除对象"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
