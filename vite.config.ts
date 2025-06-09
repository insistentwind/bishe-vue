import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    open: true, // 是否自动在浏览器打开
    port: 8989, // 端口号
    host: "0.0.0.0",
    //这里的ip和端口是前端项目的;下面为需要跨域访问后端项目
    proxy: {
      "/api": {
        target: "http://localhost:9999",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          // 代理日志
          proxy.on('error', (err, req, res) => {
            console.warn('代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('发送请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('收到响应:', proxyRes.statusCode, req.url);
          });
        }
      },
      // 添加新的代理配置，用于教师和学生端访问39999端口
      "/teacher-api": {
        target: "http://localhost:39999",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/teacher-api/, ""),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.warn('教师/学生端代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('教师/学生端发送请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('教师/学生端收到响应:', proxyRes.statusCode, req.url);
          });
        }
      },
    },
  },
})
