import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          codemirror: ['@uiw/react-codemirror', '@codemirror/lang-javascript', '@codemirror/theme-one-dark'],
          misc: ['@supabase/supabase-js', 'framer-motion', 'lucide-react'],
        },
      },
    },
  },
})
