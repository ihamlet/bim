'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SceneHierarchy from './SceneHierarchy';
import PropertiesPanel from './PropertiesPanel';
import Toolbar from './Toolbar';
import LightPanel from './LightPanel';
import type { SceneObjectData } from '../types/editor';

// 常量配置
const CONFIG = {
  GRID_SIZE: 20,
  GRID_DIVISIONS: 20,
  CAMERA_FOV: 50,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,
  DEFAULT_CAMERA_POSITION: [5, 5, 5] as [number, number, number],
  LIGHT_POSITION: [10, 10, 5] as [number, number, number],
  SHADOW_MAP_SIZE: 2048,
  PLANE_SIZE: 2,
  VERTEX_EDIT_THRESHOLD: 0.5,
} as const;

// 几何体配置
const GEOMETRY_CONFIG = {
  cube: { geometry: () => new THREE.BoxGeometry(1, 1, 1), position: [0, 0.5, 0] as [number, number, number] },
  sphere: { geometry: () => new THREE.SphereGeometry(0.5, 32, 32), position: [0, 0.5, 0] as [number, number, number] },
  cylinder: { geometry: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32), position: [0, 0.5, 0] as [number, number, number] },
  cone: { geometry: () => new THREE.ConeGeometry(0.5, 1, 32), position: [0, 0.5, 0] as [number, number, number] },
  plane: { 
    geometry: () => new THREE.PlaneGeometry(CONFIG.PLANE_SIZE, CONFIG.PLANE_SIZE, 1, 1), 
    position: [0, 0, 0] as [number, number, number],
    rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
    isEditable: true,
  },
} as const;

type ObjectType = keyof typeof GEOMETRY_CONFIG;

export default function Editor3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const objectsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const planeRef = useRef<THREE.Plane>(new THREE.Plane());
  const intersectionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const offsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const isDraggingRef = useRef<boolean>(false);
  const selectedObjectRef = useRef<THREE.Mesh | null>(null);
  
  // 平面顶点编辑相关
  const isEditingVertexRef = useRef<boolean>(false);
  const editingPlaneRef = useRef<THREE.Mesh | null>(null);
  const editingVertexIndexRef = useRef<number>(-1);

  const [objects, setObjects] = useState<SceneObjectData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // 灯光设置状态
  const [showLightPanel, setShowLightPanel] = useState(false);
  const [lightSettings, setLightSettings] = useState({
    position: [...CONFIG.LIGHT_POSITION] as [number, number, number],
    color: '#ffffff',
    intensity: 1,
  });
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const lightHelperRef = useRef<THREE.Mesh | null>(null); // 灯光辅助对象
  
  // 材质缓存，避免重复创建相同材质的对象
  const materialCacheRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());

  // 创建或获取缓存的材质
  const getOrCreateMaterial = useCallback((color?: number) => {
    const colorKey = color ? `0x${color.toString(16).padStart(6, '0')}` : 'random';
    
    if (!materialCacheRef.current.has(colorKey)) {
      const material = new THREE.MeshStandardMaterial({
        color: color ?? Math.random() * 0xffffff,
        roughness: 0.5,
        metalness: 0.5,
      });
      materialCacheRef.current.set(colorKey, material);
    }
    
    return materialCacheRef.current.get(colorKey)!.clone();
  }, []);

  // 创建平面专用材质
  const createPlaneMaterial = useCallback((color?: number) => {
    return new THREE.MeshStandardMaterial({
      color: color ?? Math.random() * 0xffffff,
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide,
    });
  }, []);

  const addObject = useCallback((type: string) => {
    if (!sceneRef.current) return;

    const objectType = type as ObjectType;
    const config = GEOMETRY_CONFIG[objectType] || GEOMETRY_CONFIG.cube;
    const id = `object-${Date.now()}`;

    // 创建几何体和网格
    const geometry = config.geometry();
    const material = objectType === 'plane' 
      ? createPlaneMaterial()
      : getOrCreateMaterial();
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...config.position);
    
    // 应用旋转（如果有）
    if ('rotation' in config && config.rotation) {
      mesh.rotation.set(...config.rotation);
    }
    
    // 设置阴影和 userData
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      id,
      name: `${type}-${objects.length + 1}`,
      type,
    };
    
    // 为可编辑平面添加特殊标记
    if ('isEditable' in config && config.isEditable) {
      mesh.userData.vertexHeights = [0, 0, 0, 0];
      mesh.userData.isEditablePlane = true;
    }

    // 添加到场景
    sceneRef.current.add(mesh);
    objectsRef.current.set(id, mesh);

    // 创建对象数据
    const newObject: SceneObjectData = {
      id,
      name: mesh.userData.name,
      type,
      position: [mesh.position.x, mesh.position.y, mesh.position.z],
      rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
      scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
      visible: mesh.visible,
      color: `#${(mesh.material as THREE.MeshStandardMaterial).color.getHexString()}`,
    };

    // 批量更新状态
    setObjects((prev) => [...prev, newObject]);
    setSelectedId(id);
    selectedObjectRef.current = mesh;
  }, [objects.length, getOrCreateMaterial, createPlaneMaterial]);

  const updateObject = useCallback((id: string, updates: Partial<SceneObjectData>) => {
    const mesh = objectsRef.current.get(id);
    if (!mesh) return;

    // 批量应用更新
    if (updates.position) mesh.position.set(...updates.position);
    if (updates.rotation) mesh.rotation.set(...updates.rotation);
    if (updates.scale) mesh.scale.set(...updates.scale);
    if (updates.visible !== undefined) mesh.visible = updates.visible;
    if (updates.name) mesh.userData.name = updates.name;
    if (updates.color) {
      (mesh.material as THREE.MeshStandardMaterial).color.set(updates.color);
    }

    // 使用函数式更新避免不必要的重渲染
    setObjects((prev) => {
      const index = prev.findIndex((obj) => obj.id === id);
      if (index === -1) return prev;
      
      const newObjects = [...prev];
      newObjects[index] = { ...newObjects[index], ...updates };
      return newObjects;
    });
  }, []);

  const deleteObject = useCallback((id: string) => {
    const mesh = objectsRef.current.get(id);
    if (mesh && sceneRef.current) {
      // 从场景移除
      sceneRef.current.remove(mesh);
      
      // 释放资源
      mesh.geometry.dispose();
      const material = mesh.material as THREE.Material;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else {
        material.dispose();
      }
      
      // 从映射中删除
      objectsRef.current.delete(id);
    }

    // 更新状态
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      selectedObjectRef.current = null;
    }
  }, [selectedId]);

  // 切换灯光面板
  const toggleLightPanel = useCallback(() => {
    setShowLightPanel((prev) => !prev);
  }, []);

  // 更新灯光设置
  const updateLight = useCallback((updates: Partial<typeof lightSettings>) => {
    setLightSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      
      // 更新实际的灯光对象
      if (directionalLightRef.current) {
        if (updates.position) {
          directionalLightRef.current.position.set(...updates.position);
          // 同步更新灯光辅助对象位置
          if (lightHelperRef.current) {
            lightHelperRef.current.position.set(...updates.position);
          }
        }
        if (updates.color) {
          directionalLightRef.current.color.set(updates.color);
          // 更新辅助对象颜色
          if (lightHelperRef.current) {
            (lightHelperRef.current.material as THREE.MeshBasicMaterial).color.set(updates.color);
          }
        }
        if (updates.intensity !== undefined) {
          directionalLightRef.current.intensity = updates.intensity;
          // 根据强度调整辅助对象大小
          if (lightHelperRef.current) {
            const scale = 0.3 + updates.intensity * 0.2;
            lightHelperRef.current.scale.setScalar(scale);
          }
        }
      }
      
      return newSettings;
    });
  }, []);

  // 导出模型功能
  const handleExport = useCallback(() => {
    if (!sceneRef.current || objectsRef.current.size === 0) {
      alert('没有可导出的对象');
      return;
    }

    const exporter = new GLTFExporter();
    
    // 创建一个临时场景，只包含用户创建的对象
    const exportScene = new THREE.Scene();
    objectsRef.current.forEach((mesh) => {
      exportScene.add(mesh.clone());
    });

    exporter.parse(
      exportScene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          // 二进制格式 (.glb)
          const blob = new Blob([result], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `scene-${Date.now()}.glb`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // JSON 格式 (.gltf)
          const json = JSON.stringify(result, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `scene-${Date.now()}.gltf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      (error) => {
        console.error('导出失败:', error);
        alert('导出失败，请查看控制台');
      },
      {
        binary: true, // 使用二进制格式 (.glb)
        trs: false,
        onlyVisible: true,
        truncateDrawRange: true,
        maxTextureSize: Infinity,
      }
    );
  }, []);

  // 导入模型功能
  const handleImport = useCallback(() => {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf';
    input.multiple = false;
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        console.warn('未选择文件');
        return;
      }

      console.log('开始导入文件:', file.name);
      console.log('文件大小:', (file.size / 1024).toFixed(2), 'KB');

      // 检查文件类型
      if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
        alert('只支持 .glb 和 .gltf 格式的文件');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const contents = event.target?.result;
          if (!contents) {
            console.error('文件内容为空');
            alert('文件内容为空');
            return;
          }
          
          if (!sceneRef.current) {
            console.error('场景未初始化');
            alert('场景未初始化，请刷新页面重试');
            return;
          }
          
          if (!cameraRef.current) {
            console.error('相机未初始化');
            alert('相机未初始化，请刷新页面重试');
            return;
          }

          console.log('开始解析模型...');
          const loader = new GLTFLoader();
          
          loader.parse(
            contents as ArrayBuffer | string,
            '',
            (gltf) => {
              try {
                console.log('模型解析成功');
                const importedGroup = gltf.scene;
                
                // 检查是否有子对象
                if (!importedGroup.children || importedGroup.children.length === 0) {
                  console.warn('模型为空，没有可渲染的对象');
                  alert('模型为空，没有可渲染的对象');
                  return;
                }
                
                console.log('模型包含', importedGroup.children.length, '个子对象');
                
                // 计算包围盒以居中和缩放模型
                const box = new THREE.Box3().setFromObject(importedGroup);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                console.log('模型尺寸:', size);
                console.log('模型中心:', center);
                console.log('模型包围盒最小值:', box.min);
                console.log('模型包围盒最大值:', box.max);
                
                // 检查尺寸是否有效
                if (size.x === 0 && size.y === 0 && size.z === 0) {
                  console.warn('模型尺寸为0，可能无法正常显示');
                }
                
                // 计算缩放比例（在移动之前）
                const maxDim = Math.max(size.x, size.y, size.z);
                let scale = 1;
                
                // 更合理的缩放策略：将模型缩放到适合视图的大小（目标大小为2-5个单位）
                const targetSize = 3; // 目标大小
                if (maxDim > 0) {
                  scale = targetSize / maxDim;
                }
                
                console.log('应用缩放:', scale, '原始最大尺寸:', maxDim, '目标尺寸:', targetSize);
                
                // 确保所有材质都能正确渲染（在缩放之前）
                let materialCount = 0;
                importedGroup.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    materialCount++;
                    // 确保材质存在
                    if (child.material) {
                      const materials = Array.isArray(child.material) 
                        ? child.material 
                        : [child.material];
                      
                      materials.forEach((mat, idx) => {
                        console.log(`材质 ${idx}:`, mat.type, mat);
                        // 确保材质属性正确
                        mat.side = THREE.DoubleSide;
                        mat.needsUpdate = true;
                        
                        // 如果是标准材质，确保有颜色
                        if (mat instanceof THREE.MeshStandardMaterial) {
                          console.log('  - 颜色:', `#${mat.color.getHexString()}`);
                          console.log('  - 透明度:', mat.opacity);
                          console.log('  - 透明:', mat.transparent);
                          
                          if (!mat.color || mat.color.getHex() === 0x000000) {
                            console.log('  - 设置默认颜色为灰色');
                            mat.color.setHex(0x888888);
                          }
                        }
                      });
                    } else {
                      console.warn('网格没有材质，创建默认材质');
                      child.material = new THREE.MeshStandardMaterial({
                        color: 0x888888,
                        side: THREE.DoubleSide,
                      });
                    }
                    
                    // 启用阴影
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // 确保可见性
                    child.visible = true;
                  }
                });
                
                console.log('总共处理了', materialCount, '个网格');
                
                // 应用缩放到整个组
                importedGroup.scale.setScalar(scale);
                
                // 缩放后重新计算包围盒，然后居中和对齐地面
                const scaledBox = new THREE.Box3().setFromObject(importedGroup);
                const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
                const scaledSize = scaledBox.getSize(new THREE.Vector3());
                
                console.log('缩放后尺寸:', scaledSize);
                console.log('缩放后中心:', scaledCenter);
                
                // 将模型居中到原点并底部对齐到地面（y=0）
                importedGroup.position.x = -scaledCenter.x;
                importedGroup.position.y = -scaledBox.min.y;
                importedGroup.position.z = -scaledCenter.z;
                
                console.log('模型最终位置:', importedGroup.position);
                
                // 为每个子网格添加 userData，并将它们从 group 中提取出来直接添加到场景
                const meshes: THREE.Mesh[] = [];
                const childrenToRemove: THREE.Object3D[] = [];
                
                importedGroup.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    childrenToRemove.push(child);
                  }
                });
                
                // 将所有网格从 group 中移除并直接添加到场景
                childrenToRemove.forEach((child) => {
                  const mesh = child as THREE.Mesh;
                  const id = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                  
                  // 设置 userData
                  mesh.userData = {
                    id,
                    name: file.name.replace(/\.(glb|gltf)$/i, ''),
                    type: 'imported',
                  };
                  
                  // 将局部坐标转换为世界坐标
                  mesh.updateWorldMatrix(true, false);
                  const worldPosition = new THREE.Vector3();
                  const worldQuaternion = new THREE.Quaternion();
                  const worldScale = new THREE.Vector3();
                  
                  mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
                  
                  // 应用世界变换
                  mesh.position.copy(worldPosition);
                  mesh.quaternion.copy(worldQuaternion);
                  mesh.scale.copy(worldScale);
                  
                  // 从 group 中移除
                  importedGroup.remove(mesh);
                  
                  // 直接添加到场景
                  if (sceneRef.current) {
                    sceneRef.current.add(mesh);
                  }
                  
                  // 添加到引用映射
                  meshes.push(mesh);
                  objectsRef.current.set(id, mesh);
                });
                
                // 从场景中移除空的 group
                if (sceneRef.current) {
                  sceneRef.current.remove(importedGroup);
                }
                
                // 添加到场景（网格已经在上一步单独添加了）
                console.log('模型已添加到场景');
                
                // 调整相机位置以确保能看到整个模型
                if (cameraRef.current) {
                  const scaledBox = new THREE.Box3().setFromObject(importedGroup);
                  const scaledSize = scaledBox.getSize(new THREE.Vector3());
                  const maxDimension = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
                  
                  // 根据模型大小计算合适的相机距离
                  const fov = cameraRef.current.fov * (Math.PI / 180);
                  let cameraDistance = maxDimension / (2 * Math.tan(fov / 2));
                  
                  // 添加额外的边距（1.5倍）以确保完整显示
                  cameraDistance *= 1.5;
                  
                  // 设置最小和最大距离限制
                  cameraDistance = Math.max(cameraDistance, 5);
                  cameraDistance = Math.min(cameraDistance, 50);
                  
                  // 设置相机位置（从斜上方观察）
                  cameraRef.current.position.set(
                    cameraDistance * 0.7,
                    cameraDistance * 0.7,
                    cameraDistance * 0.7
                  );
                  
                  // 让相机看向场景中心（模型已经在原点）
                  cameraRef.current.lookAt(0, 0, 0);
                  
                  console.log('相机位置已调整:', cameraRef.current.position);
                  console.log('相机距离:', cameraDistance, '模型尺寸:', scaledSize);
                } else {
                  console.error('相机引用为空');
                }
                
                if (orbitControlsRef.current) {
                  orbitControlsRef.current.target.set(0, 0, 0);
                  orbitControlsRef.current.update();
                }
                
                // 更新 React 状态
                const newObjects: SceneObjectData[] = meshes.map((mesh) => ({
                  id: mesh.userData.id,
                  name: mesh.userData.name,
                  type: 'imported',
                  position: [mesh.position.x, mesh.position.y, mesh.position.z],
                  rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                  scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
                  visible: mesh.visible,
                  color: '#888888',
                }));
                
                setObjects((prev) => [...prev, ...newObjects]);
                
                // 选中第一个导入的对象
                if (meshes.length > 0) {
                  setSelectedId(meshes[0].userData.id);
                  selectedObjectRef.current = meshes[0];
                }
                
                console.log(`✅ 成功导入 ${meshes.length} 个对象`);
                console.log('提示: 如果看不到模型，请尝试在场景中拖动或按 Ctrl+滚轮缩放');
              } catch (innerError) {
                console.error('处理模型时出错:', innerError);
                alert('处理模型时出错: ' + (innerError as Error).message);
              }
            },
            (error) => {
              console.error('GLTF 解析失败:', error);
              console.error('错误详情:', error.message);
              alert('模型解析失败: ' + (error.message || '未知错误') + '\n\n请检查:\n1. 文件格式是否正确\n2. 文件是否损坏\n3. 是否是有效的 GLB/GLTF 文件');
            }
          );
        } catch (error) {
          console.error('加载过程出错:', error);
          alert('加载过程出错: ' + (error as Error).message);
        }
      };
      
      reader.onerror = () => {
        console.error('文件读取失败');
        console.error('错误代码:', reader.error);
        alert('文件读取失败，请检查文件是否被占用或损坏');
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentLoaded = Math.round((e.loaded / e.total) * 100);
          console.log('加载进度:', percentLoaded + '%');
        }
      };
      
      reader.readAsArrayBuffer(file);
    };
    
    input.click();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // 初始化相机
    const container = containerRef.current;
    const camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA_FOV,
      container.clientWidth / container.clientHeight,
      CONFIG.CAMERA_NEAR,
      CONFIG.CAMERA_FAR
    );
    camera.position.set(...CONFIG.DEFAULT_CAMERA_POSITION);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比以提升性能
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(...CONFIG.LIGHT_POSITION);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = CONFIG.SHADOW_MAP_SIZE;
    directionalLight.shadow.mapSize.height = CONFIG.SHADOW_MAP_SIZE;
    // 优化阴影质量
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(CONFIG.GRID_SIZE, CONFIG.GRID_DIVISIONS, 0x444444, 0x222222);
    scene.add(gridHelper);

    // 初始化轨道控制器
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControlsRef.current = orbitControls;

    // 创建灯光辅助对象（可拖动的小球）
    const lightHelperGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const lightHelperMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.9,
      depthTest: false, // 始终可见
    });
    const lightHelper = new THREE.Mesh(lightHelperGeometry, lightHelperMaterial);
    lightHelper.position.set(...CONFIG.LIGHT_POSITION);
    lightHelper.renderOrder = 999; // 确保在最上层渲染
    lightHelper.userData = {
      id: 'light-helper',
      name: '灯光控制点',
      type: 'lightHelper',
      isLightHelper: true,
    };
    scene.add(lightHelper);
    lightHelperRef.current = lightHelper;
    
    // 添加发光效果（外圈）
    const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.3,
      depthTest: false,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.renderOrder = 998;
    lightHelper.add(glowMesh);

    // 辅助函数：更新鼠标位置
    const updateMousePosition = (event: MouseEvent, rect: DOMRect) => {
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // 辅助函数：找到最近的顶点
    const findClosestVertex = (mesh: THREE.Mesh, point: THREE.Vector3) => {
      const positions = (mesh.geometry as THREE.BufferGeometry).attributes.position;
      let closestIndex = -1;
      let minDistance = Infinity;
      
      for (let i = 0; i < positions.count; i++) {
        const vertexWorldPos = new THREE.Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        );
        vertexWorldPos.applyMatrix4(mesh.matrixWorld);
        
        const distance = vertexWorldPos.distanceTo(point);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      
      return { index: closestIndex, distance: minDistance };
    };

    // 辅助函数：处理平面顶点编辑
    const handleVertexEdit = () => {
      if (!editingPlaneRef.current || editingVertexIndexRef.current === -1) return;
      
      const plane = editingPlaneRef.current;
      const geometry = plane.geometry as THREE.BufferGeometry;
      const positions = geometry.attributes.position;
      
      // 获取顶点世界坐标
      const vertexWorldPos = new THREE.Vector3(
        positions.getX(editingVertexIndexRef.current),
        positions.getY(editingVertexIndexRef.current),
        positions.getZ(editingVertexIndexRef.current)
      );
      vertexWorldPos.applyMatrix4(plane.matrixWorld);
      
      // 创建垂直拖动平面
      const verticalPlane = new THREE.Plane();
      verticalPlane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 1, 0),
        vertexWorldPos
      );
      
      if (raycasterRef.current.ray.intersectPlane(verticalPlane, intersectionRef.current)) {
        const newHeight = intersectionRef.current.y;
        positions.setY(editingVertexIndexRef.current, newHeight);
        positions.needsUpdate = true;
        
        // 重新计算法线
        geometry.computeVertexNormals();
        
        // 更新高度数据
        if (!plane.userData.vertexHeights) {
          plane.userData.vertexHeights = [0, 0, 0, 0];
        }
        plane.userData.vertexHeights[editingVertexIndexRef.current] = newHeight;
      }
    };

    // 辅助函数：处理对象拖动
    const handleObjectDrag = () => {
      if (!selectedObjectRef.current) return;
      
      // 检查是否是灯光辅助对象
      if (selectedObjectRef.current.userData.isLightHelper) {
        if (raycasterRef.current.ray.intersectPlane(planeRef.current, intersectionRef.current)) {
          const newPosition = intersectionRef.current.clone().sub(offsetRef.current);
          selectedObjectRef.current.position.copy(newPosition);
          
          // 同步更新灯光位置
          if (directionalLightRef.current) {
            directionalLightRef.current.position.copy(newPosition);
            
            // 直接更新状态，确保面板数值同步
            setLightSettings(prev => {
              const updated = {
                ...prev,
                position: [newPosition.x, newPosition.y, newPosition.z] as [number, number, number],
              };
              console.log('灯光位置更新:', updated.position);
              return updated;
            });
          }
        }
        return;
      }
      
      // 普通对象拖动
      if (raycasterRef.current.ray.intersectPlane(planeRef.current, intersectionRef.current)) {
        const newPosition = intersectionRef.current.clone().sub(offsetRef.current);
        selectedObjectRef.current.position.copy(newPosition);

        const id = selectedObjectRef.current.userData.id;
        setObjects((prev) => {
          const index = prev.findIndex((obj) => obj.id === id);
          if (index === -1) return prev;
          
          const newObjects = [...prev];
          newObjects[index] = {
            ...newObjects[index],
            position: [
              selectedObjectRef.current!.position.x,
              selectedObjectRef.current!.position.y,
              selectedObjectRef.current!.position.z,
            ],
          };
          return newObjects;
        });
      }
    };

    // 鼠标按下事件 - 开始拖动
    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;

      const rect = renderer.domElement.getBoundingClientRect();
      updateMousePosition(event, rect);

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // 首先检测是否点击了灯光辅助对象
      if (lightHelperRef.current) {
        const lightIntersects = raycasterRef.current.intersectObject(lightHelperRef.current);
        if (lightIntersects.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          
          isDraggingRef.current = true;
          selectedObjectRef.current = lightHelperRef.current;
          setSelectedId(null); // 不选中任何场景对象
          
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = false;
          }
          
          planeRef.current.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(planeRef.current.normal),
            lightHelperRef.current.position
          );
          
          if (raycasterRef.current.ray.intersectPlane(planeRef.current, intersectionRef.current)) {
            offsetRef.current.copy(intersectionRef.current).sub(lightHelperRef.current.position);
          }
          
          console.log('开始拖动灯光');
          return;
        }
      }
      
      // 检测场景中的其他对象
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(objectsRef.current.values()),
        true
      );

      if (intersects.length === 0) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const clickedObject = intersects[0].object as THREE.Mesh;
      
      // 检查是否是可编辑平面且按住 Shift 键
      if (clickedObject.userData.isEditablePlane && event.shiftKey) {
        const { index, distance } = findClosestVertex(clickedObject, intersects[0].point);
        
        if (index !== -1 && distance < CONFIG.VERTEX_EDIT_THRESHOLD) {
          isEditingVertexRef.current = true;
          editingPlaneRef.current = clickedObject;
          editingVertexIndexRef.current = index;
          setSelectedId(clickedObject.userData.id);
          
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = false;
          }
        }
      } else {
        // 普通拖动模式
        isDraggingRef.current = true;
        selectedObjectRef.current = clickedObject;
        setSelectedId(clickedObject.userData.id);

        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = false;
        }

        planeRef.current.setFromNormalAndCoplanarPoint(
          camera.getWorldDirection(planeRef.current.normal),
          selectedObjectRef.current.position
        );
        
        if (raycasterRef.current.ray.intersectPlane(planeRef.current, intersectionRef.current)) {
          offsetRef.current.copy(intersectionRef.current).sub(selectedObjectRef.current.position);
        }
      }
    };

    // 鼠标移动事件 - 拖动对象或编辑顶点
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      updateMousePosition(event, rect);
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // 处理平面顶点编辑
      if (isEditingVertexRef.current) {
        handleVertexEdit();
        return;
      }
      
      // 处理普通对象拖动
      if (isDraggingRef.current) {
        handleObjectDrag();
      }
    };

    // 鼠标释放事件 - 结束拖动
    const onMouseUp = () => {
      isDraggingRef.current = false;
      isEditingVertexRef.current = false;
      editingPlaneRef.current = null;
      editingVertexIndexRef.current = -1;
      
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // 动画循环
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整处理
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      // 取消动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // 移除事件监听
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      
      // 释放灯光辅助对象
      if (lightHelperRef.current) {
        // 清理发光子对象
        lightHelperRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
        lightHelperRef.current.geometry.dispose();
        (lightHelperRef.current.material as THREE.Material).dispose();
        scene.remove(lightHelperRef.current);
        lightHelperRef.current = null;
      }
      
      // 释放所有对象资源
      objectsRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        const material = mesh.material as THREE.Material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material.dispose();
        }
      });
      objectsRef.current.clear();
      
      // 释放材质缓存
      materialCacheRef.current.forEach((material) => material.dispose());
      materialCacheRef.current.clear();
      
      // 释放渲染器
      renderer.dispose();
      
      // 从 DOM 中移除 canvas
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toolbar onAddObject={addObject} onExport={handleExport} onImport={handleImport} onToggleLightPanel={toggleLightPanel} />

      <div className="flex flex-1 overflow-hidden relative">
        <SceneHierarchy
          objects={objects}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={deleteObject}
        />

        <div ref={containerRef} className="flex-1 relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

        <PropertiesPanel
          object={objects.find((obj) => obj.id === selectedId)}
          onUpdate={(updates) => selectedId && updateObject(selectedId, updates)}
        />
        
        {/* 灯光设置面板 */}
        {showLightPanel && (
          <LightPanel
            lightSettings={lightSettings}
            onUpdateLight={updateLight}
            onClose={() => setShowLightPanel(false)}
          />
        )}
      </div>
    </div>
  );
}
