import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-white mb-4">3D 编辑器集合</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
          {/* 3D 编辑器卡片 */}
          <Link href="/editor" className="group">
            <div className="bg-white/10 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">3D 场景编辑器</h2>
              <p className="text-gray-400">创建和编辑 3D 几何体，支持导入导出 GLB/GLTF 模型</p>
              <div className="mt-4 text-blue-400 group-hover:text-blue-300 transition-colors">
                进入编辑器 →
              </div>
            </div>
          </Link>

          {/* BIM 查看器卡片 */}
          <Link href="/bim" className="group">
            <div className="bg-white/10 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">BIM 查看器</h2>
              <p className="text-gray-400">基于 IFC.js 的 BIM 模型查看器，支持 IFC 格式文件</p>
              <div className="mt-4 text-purple-400 group-hover:text-purple-300 transition-colors">
                查看 BIM 模型 →
              </div>
            </div>
          </Link>
        </div>

        <div className="text-gray-500 text-sm mt-8">
          选择一个工具开始使用
        </div>
      </div>
    </div>
  );
}
