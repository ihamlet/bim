import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 使用 webpack 而不是 Turbopack，以更好地处理 web-ifc 的 Worker 和 WASM
  webpack: (config, { isServer }) => {
    // 处理 web-ifc 的 WASM 文件
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // 忽略 web-ifc 的 worker 文件
    if (!isServer) {
      config.module.rules.push({
        test: /web-ifc.*\.worker\.js$/,
        type: 'asset/resource',
      });
    }
    
    return config;
  },
  
  // 配置 rewrites 以确保 web-ifc 的 WASM 和 worker 文件正确加载
  async rewrites() {
    return [
      // 处理 web-ifc 尝试从路由子目录加载 WASM 的情况
      {
        source: '/:path*/wasm/:file',
        destination: '/wasm/:file',
      },
      {
        source: '/wasm/:path*',
        destination: '/wasm/:path*',
      },
    ];
  },
  
  // 配置 headers 以确保 WASM 文件正确加载
  async headers() {
    return [
      {
        // 只为 WASM 文件设置正确的 Content-Type
        source: '/wasm/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
