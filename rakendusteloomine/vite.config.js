import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/veebiarendus/FilmiRiiul/', // TÄHTIS: Täpne kaustatee kooli serveris!
})
