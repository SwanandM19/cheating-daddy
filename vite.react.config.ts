import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'src',
    base: './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        lib: {
            entry: path.resolve(__dirname, 'src/components/react/main.tsx'),
            name: 'CheatingDaddyReact',
            fileName: 'react-bundle',
            formats: ['iife'],
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {},
            },
        },
        cssCodeSplit: false,
    },
    server: {
        port: 3000,
    },
});
