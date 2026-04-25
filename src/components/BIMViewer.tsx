'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'web-ifc-three';

interface BIMViewerProps {
  onModelLoaded?: (modelInfo: any) => void;
}

export default function BIMViewer({ onModelLoaded }: BIMViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const ifcLoaderRef = useRef<IFCLoader | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaderReady, setIsLoaderReady] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('');

  // 初始化 Three.js 场景
  useEffect(() => {
    if (!containerRef.current) return;

    // 添加全局错误处理器，捕获未处理的 Promise rejection
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('⚠️ 捕获到未处理的 Promise rejection:', event.reason);
      // 阻止默认行为，防止 Next.js 错误覆盖层
      event.preventDefault();
    };
    
    // 添加全局错误处理器，捕获 runtime errors
    const handleGlobalError = (event: ErrorEvent) => {
      // 过滤掉 web-ifc worker 的错误
      if (event.message === '[object Event]' || event.message.includes('worker sent an error')) {
        console.warn('⚠️ 过滤 web-ifc worker 错误:', event.message);
        event.preventDefault();
        return;
      }
      console.error('全局错误:', event);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(200, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    // 添加坐标轴
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // 创建轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 异步初始化 IFC 加载器
    const initIFCLoader = async () => {
      console.log('🔧 初始化 IFCLoader...');
      
      try {
        const ifcLoader = new IFCLoader();
        
        // 配置 web-ifc
        const ifcManager = ifcLoader.ifcManager;
        
        // 设置 WASM 路径 - 使用绝对路径
        const wasmPath = '/wasm/';
        console.log('🔧 设置 WASM 路径:', wasmPath);
        
        await ifcManager.setWasmPath(wasmPath);
        console.log('✅ WASM 路径设置成功');
        
        // 禁用 Web Workers，使用单线程模式
        console.log('🔧 禁用 Web Workers，使用单线程模式...');
        ifcManager.useWebWorkers(false);
        console.log('✅ 使用单线程模式');
        
        ifcLoaderRef.current = ifcLoader;
        setIsLoaderReady(true);
        console.log('✅ IFCLoader 初始化成功');
      } catch (error) {
        console.error('❌ IFC Loader 初始化失败:', error);
        alert('IFC 加载器初始化失败: ' + (error as Error).message);
      }
    };
    
    initIFCLoader();

    // 动画循环
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      // 移除全局错误处理器
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      // 清理 IFC 管理器
      if (ifcLoaderRef.current) {
        ifcLoaderRef.current.ifcManager.dispose();
      }
      
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 加载 IFC 文件
  const loadIFCFile = useCallback(async (file: File) => {
    if (!ifcLoaderRef.current || !sceneRef.current) {
      console.error('IFC 加载器未初始化');
      alert('IFC 加载器未初始化，请刷新页面重试');
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      console.log('🔄 开始加载 IFC 文件:', file.name);
      console.log('📦 文件大小:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      // 清除之前的模型
      const objectsToRemove: THREE.Object3D[] = [];
      sceneRef.current.traverse((child) => {
        if (child.userData.isIFCModel) {
          objectsToRemove.push(child);
        }
      });
      objectsToRemove.forEach((obj) => {
        sceneRef.current?.remove(obj);
      });

      // 读取文件为 ArrayBuffer
      console.log('📖 读取文件...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ 文件读取完成，大小:', arrayBuffer.byteLength, 'bytes');
      
      // 使用 parse 方法加载 IFC 文件
      console.log('🔧 开始解析 IFC...');
      const model = await ifcLoaderRef.current.parse(arrayBuffer);
      console.log('✅ IFC 解析成功');
      
      // 标记为 IFC 模型
      model.userData.isIFCModel = true;
      
      // 添加到场景
      sceneRef.current.add(model);

      // 计算包围盒并调整相机
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 居中模型
      model.position.sub(center);

      // 调整相机位置以看到整个模型
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current!.fov * (Math.PI / 180);
      let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
      cameraDistance *= 1.5;

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(cameraDistance, cameraDistance, cameraDistance);
        cameraRef.current.lookAt(0, 0, 0);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      // 获取模型信息
      const info = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        boundingBox: {
          min: box.min.toArray(),
          max: box.max.toArray(),
          size: size.toArray(),
        },
      };

      setModelInfo(info);
      onModelLoaded?.(info);

      console.log('✅ IFC 模型加载成功:', info);
    } catch (error) {
      console.error('❌ 加载 IFC 文件失败:', error);
      
      // 安全地获取错误信息
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      const errorStack = error instanceof Error 
        ? error.stack 
        : 'No stack trace available';
      const errorName = error instanceof Error 
        ? error.name 
        : 'UnknownError';
      
      console.error('错误详情:', {
        message: errorMessage,
        stack: errorStack,
        name: errorName,
      });
      
      // 提供更详细的错误提示
      let userMessage = '加载 IFC 文件失败\n\n';
      const errorMsg = errorMessage.toLowerCase();
      
      if (errorMsg.includes('wasm') || errorMsg.includes('aborted')) {
        userMessage += 'WASM 加载失败，可能原因：\n';
        userMessage += '1. WASM 文件路径不正确\n';
        userMessage += '2. WASM 文件未正确部署\n';
        userMessage += '3. 浏览器不支持 WebAssembly\n';
        userMessage += '4. COOP/COEP headers 配置问题\n\n';
        userMessage += `当前 WASM 路径: ${typeof window !== 'undefined' ? `${window.location.origin}/wasm/` : '/wasm/'}`;
        userMessage += '\n\n请检查浏览器控制台的详细错误信息';
      } else if (errorMsg.includes('parse') || errorMsg.includes('invalid')) {
        userMessage += 'IFC 文件解析失败：\n';
        userMessage += '1. 文件可能已损坏\n';
        userMessage += '2. 文件格式不正确\n';
        userMessage += '3. 文件版本不兼容\n\n';
        userMessage += errorMessage;
      } else {
        userMessage += errorMessage;
      }
      
      alert(userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onModelLoaded]);

  // 处理文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.ifc')) {
      alert('请选择 .ifc 格式的文件');
      return;
    }

    loadIFCFile(file);
  }, [loadIFCFile]);

  // 触发文件选择
  const triggerFileSelect = () => {
    if (!isLoaderReady) {
      alert('IFC 加载器正在初始化中，请稍候...');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ifc';
    input.onchange = handleFileUpload as any;
    input.click();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="返回首页"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            BIM 查看器
          </h1>
          
          {fileName && (
            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <span className="text-sm text-blue-300">{fileName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerFileSelect}
            disabled={isLoading || !isLoaderReady}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            title={!isLoaderReady ? 'IFC 加载器初始化中...' : '导入 IFC 文件'}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                加载中...
              </>
            ) : !isLoaderReady ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                初始化中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                导入 IFC
              </>
            )}
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D 视图 */}
        <div ref={containerRef} className="flex-1 relative">
          {!fileName && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-400 text-lg">点击"导入 IFC"按钮加载 BIM 模型</p>
                <p className="text-gray-500 text-sm mt-2">支持 .ifc 格式文件</p>
              </div>
            </div>
          )}
        </div>

        {/* 侧边信息面板 */}
        {modelInfo && (
          <div className="w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              模型信息
            </h2>

            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-xs text-gray-400 uppercase tracking-wider">文件名</label>
                <p className="text-white text-sm mt-1 break-all">{modelInfo.name}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-xs text-gray-400 uppercase tracking-wider">文件大小</label>
                <p className="text-white text-sm mt-1">{modelInfo.size}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-xs text-gray-400 uppercase tracking-wider">包围盒尺寸</label>
                <div className="text-white text-sm mt-1 space-y-1">
                  <p>X: {modelInfo.boundingBox.size[0].toFixed(2)}</p>
                  <p>Y: {modelInfo.boundingBox.size[1].toFixed(2)}</p>
                  <p>Z: {modelInfo.boundingBox.size[2].toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <label className="text-xs text-blue-300 uppercase tracking-wider">操作提示</label>
                <ul className="text-blue-200 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>左键拖动旋转视角</li>
                  <li>右键拖动平移</li>
                  <li>滚轮缩放</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
