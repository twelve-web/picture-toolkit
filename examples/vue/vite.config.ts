import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';

export default defineConfig({
  plugins: [vue()],
  root: path.resolve(__dirname, './'),
  resolve: {
    alias: {
      'picture-toolkit': path.resolve(__dirname, '../../index.ts')
    }
  }
});