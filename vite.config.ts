import { defineConfig } from 'vite';
import path from 'path';
import vitePluginString from 'vite-plugin-string';

export default defineConfig({
  plugins: [vitePluginString()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    // port: 3000,
    // proxy: {
    //   '/static-resource': {
    //     // target: 'http://192.168.50.200:8080',
    //     // target: 'http://127.0.0.1:8800',
    //     rewrite: (path) => {
    //       return path.replace(/^\/static-resource/, '/static-resource');
    //     }
    //   }
    // }
  },
});
