import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 빌드 최적화 설정
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 청크 크기 경고 제한
    chunkSizeWarningLimit: 1000,
  },
  // 환경 변수 프리픽스
  envPrefix: 'VITE_',
})
