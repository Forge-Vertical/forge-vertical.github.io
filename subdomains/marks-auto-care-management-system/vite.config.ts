import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Deployed under forgevertical.com/subdomains/marks-auto-care-management-system/,
  // not at the domain root — this tells Vite to emit asset URLs that match.
  base: '/subdomains/marks-auto-care-management-system/',
})
