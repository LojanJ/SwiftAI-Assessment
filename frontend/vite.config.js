import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // eslint-disable-next-line no-undef
    'process.env': dotenv.config({path: path.resolve(__dirname, '.env')}).parsed,
  }
})
