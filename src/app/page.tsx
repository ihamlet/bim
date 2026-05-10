import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6">
      <div className="text-center space-y-10 max-w-5xl w-full">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] tracking-tight">
            AI 空间工具集
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            极简未来科技风格的专业工具平台
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {/* 3D 编辑器卡片 */}
          <Link href="/editor" className="group">
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] p-8 transition-all duration-[var(--transition-normal)] hover:scale-[1.02] cursor-pointer glass-effect group-hover:border-[var(--color-border-medium)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-subtle)] opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-slow)]" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-6 bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20 group-hover:bg-[var(--color-accent-primary)]/20 transition-colors duration-[var(--transition-normal)]">
                  <svg className="w-8 h-8 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-3 tracking-wide">3D 场景编辑器</h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">创建和编辑 3D 几何体，支持导入导出 GLB/GLTF 模型</p>
                
                <div className="flex items-center justify-center text-[var(--color-accent-primary)] group-hover:text-[var(--color-accent-hover)] transition-colors duration-[var(--transition-fast)]">
                  <span className="text-sm font-medium">进入编辑器</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-[var(--transition-fast)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* BIM 查看器卡片 */}
          <Link href="/bim" className="group">
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] p-8 transition-all duration-[var(--transition-normal)] hover:scale-[1.02] cursor-pointer glass-effect group-hover:border-[var(--color-border-medium)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-subtle)] opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-slow)]" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-6 bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/20 group-hover:bg-[var(--color-accent-secondary)]/20 transition-colors duration-[var(--transition-normal)]">
                  <svg className="w-8 h-8 text-[var(--color-accent-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-3 tracking-wide">BIM 查看器</h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">基于 IFC.js 的 BIM 模型查看器，支持 IFC 格式文件</p>
                
                <div className="flex items-center justify-center text-[var(--color-accent-secondary)] group-hover:text-[var(--color-accent-hover)] transition-colors duration-[var(--transition-fast)]">
                  <span className="text-sm font-medium">查看 BIM 模型</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-[var(--transition-fast)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-[var(--color-text-muted)] text-sm pt-8">
          选择一个工具开始使用 · 极简未来科技风格
        </div>
      </div>
    </div>
  );
}
