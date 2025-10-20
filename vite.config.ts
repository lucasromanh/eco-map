import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const APP_VERSION = 'v9'; // ⚙️ Solo tocás esto cuando quieras forzar actualización

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
});
