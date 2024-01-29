import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './public/assets'),
            '@components': path.resolve(__dirname, './src/components'),
            '@api': path.resolve(__dirname, './src/api'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@validations': path.resolve(__dirname, './src/validations'),
            '@routing': path.resolve(__dirname, './src/routing'),
        },
    },
    plugins: [react(), svgr()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./setupTests.ts'],
    },
});
