# BIM 查看器 - 快速测试指南

## ✅ 已完成的功能

### 1. 项目结构
- ✅ 创建 BIMViewer 组件 (`src/components/BIMViewer.tsx`)
- ✅ 创建 BIM 页面路由 (`src/app/bim/page.tsx`)
- ✅ 创建编辑器页面路由 (`src/app/editor/page.tsx`)
- ✅ 更新首页为导航页 (`src/app/page.tsx`)

### 2. 依赖安装
- ✅ 安装 `web-ifc-three` 包
- ✅ 安装 `web-ifc` 包
- ✅ 复制 WASM 文件到 `public/wasm/` 目录

### 3. 核心功能
- ✅ IFC 文件加载和解析
- ✅ 3D 场景渲染（Three.js）
- ✅ 轨道控制器（旋转、平移、缩放）
- ✅ 自动居中和适配模型
- ✅ 模型信息显示面板
- ✅ 响应式 UI 设计

## 🧪 测试步骤

### 1. 启动开发服务器

如果服务器未运行：
```bash
cd /Users/jiangliufan/Documents/code/project
npm run dev
```

服务器应该在 http://localhost:3000 运行

### 2. 访问应用

打开浏览器访问：
```
http://localhost:3000
```

你应该看到一个包含两个卡片的首页：
- **3D 场景编辑器**（蓝色卡片）
- **BIM 查看器**（紫色卡片）

### 3. 测试 BIM 查看器

#### 步骤 1：进入 BIM 查看器
点击 **"BIM 查看器"** 卡片，或访问：
```
http://localhost:3000/bim
```

#### 步骤 2：检查界面
确认看到以下元素：
- ✅ 顶部工具栏（返回按钮、标题、导入按钮）
- ✅ 中央空白区域（提示文字："点击'导入 IFC'按钮加载 BIM 模型"）
- ✅ 深色渐变背景

#### 步骤 3：导入 IFC 文件
1. 点击右上角的 **"导入 IFC"** 按钮
2. 选择一个 `.ifc` 格式的文件
   - 如果没有 IFC 文件，可以从网上下载示例文件
   - 推荐测试文件：https://github.com/IFCjs/test-files

3. 等待加载完成

#### 步骤 4：验证功能
加载完成后，检查：
- ✅ 模型在场景中正确显示
- ✅ 右侧信息面板显示模型信息
- ✅ 可以拖动鼠标旋转视角
- ✅ 可以右键平移视图
- ✅ 可以滚轮缩放
- ✅ 左上角显示文件名

#### 步骤 5：测试导航
- 点击左上角的返回箭头，应该回到首页
- 从首页可以再次进入 BIM 查看器或 3D 编辑器

### 4. 测试 3D 编辑器

从首页点击 **"3D 场景编辑器"** 卡片，或访问：
```
http://localhost:3000/editor
```

确认原有的 3D 编辑器功能正常工作。

## 🐛 常见问题排查

### 问题 1：WASM 文件加载失败

**症状**：控制台报错 "Failed to load web-ifc.wasm"

**解决方案**：
```bash
# 确认 WASM 文件存在
ls public/wasm/

# 应该看到：
# web-ifc.wasm
# web-ifc-node.wasm
# web-ifc-mt.wasm

# 如果文件不存在，重新复制
cp node_modules/web-ifc/*.wasm public/wasm/
```

### 问题 2：IFC 文件无法加载

**可能原因**：
1. 文件格式不正确（必须是 .ifc）
2. 文件损坏
3. 文件太大（建议 < 100MB）

**解决方案**：
- 使用有效的 IFC 文件测试
- 检查浏览器控制台的错误信息
- 尝试较小的测试文件

### 问题 3：模型显示为黑色

**可能原因**：灯光设置问题

**解决方案**：
- 刷新页面重试
- 检查浏览器控制台是否有 WebGL 错误
- 确保显卡驱动已更新

### 问题 4：性能问题

**优化建议**：
- 关闭其他占用 GPU 的程序
- 使用较小的 IFC 文件测试
- 降低浏览器窗口大小

## 📊 预期效果

### 首页
- 深色渐变背景
- 两个并排的卡片（桌面端）
- 悬停时有放大和颜色变化效果

### BIM 查看器页面
- 顶部：工具栏（返回按钮 + 标题 + 导入按钮）
- 中央：3D 画布
- 右侧（加载模型后）：信息面板

### 交互体验
- 流畅的 3D 旋转、平移、缩放
- 模型自动居中显示
- 响应式设计，适配不同屏幕尺寸

## 🎯 下一步扩展

基础功能已完成，可以考虑添加：

1. **构件选择**：点击模型中的构件查看详情
2. **属性面板**：显示 IFC 属性集
3. **剖面工具**：切割模型查看内部
4. **测量工具**：距离、角度测量
5. **图层管理**：控制不同构件的可见性
6. **搜索功能**：按名称或类型搜索构件
7. **截图导出**：保存当前视图

## 📝 技术要点

### IFC.js 集成
```typescript
import { Loader } from 'web-ifc-three';

const ifcLoader = new Loader();
ifcLoader.ifcManager.setWasmPath('/wasm/');
const model = await ifcLoader.loadAsync(file);
```

### 模型处理
- 自动计算包围盒
- 居中模型到原点
- 根据模型大小调整相机距离

### 性能优化
- 限制像素比（max 2）
- 启用阴影贴图
- 使用 OrbitControls 的阻尼效果

## ✨ 总结

BIM 查看器已成功创建并集成到项目中！

**访问地址**：
- 首页：http://localhost:3000
- BIM 查看器：http://localhost:3000/bim
- 3D 编辑器：http://localhost:3000/editor

**核心文件**：
- `src/components/BIMViewer.tsx` - BIM 查看器组件
- `src/app/bim/page.tsx` - BIM 页面路由
- `public/wasm/*.wasm` - IFC.js WASM 文件

现在你可以开始测试和使用这个专业的 BIM 查看器了！🎉
