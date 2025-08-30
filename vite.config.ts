import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    server: {
        proxy: {
            '/api': 'http://localhost:3000'
        },
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), 'src') // maps @ → ./src
        },
    },
})
