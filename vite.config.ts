import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
    },
  },
  define: {
    global: 'window'
  },
  // 🚨 새롭게 추가된 백엔드 연결(Proxy) 설정입니다.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9500', // 백엔드 포트(9500)로 통신을 보냅니다.
        changeOrigin: true,
      },
    },
  }
});