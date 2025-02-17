import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, './'),
  resolve: {
    alias: {
      'picture-toolkit': path.resolve(__dirname, '../../index.ts')
    }
  }
}) 