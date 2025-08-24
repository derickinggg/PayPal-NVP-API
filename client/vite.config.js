import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: undefined
			}
		}
	},
	server: {
		host: true,
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://localhost:4000',
				changeOrigin: true,
			}
		}
	},
	define: {
		__API_BASE__: JSON.stringify(process.env.VITE_API_BASE || '/api')
	}
})
