import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), basicSsl()],
  server:{
    host: true,
    watch: {
      usePolling: true,
      interval: 100
    }
  }
})
