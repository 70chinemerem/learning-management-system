import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Get all HTML files in the root directory
const htmlFiles = readdirSync(__dirname)
    .filter(file => file.endsWith('.html'))
    .reduce((acc, file) => {
        const name = file.replace('.html', '');
        acc[name] = resolve(__dirname, file);
        return acc;
    }, {});

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: htmlFiles,
        },
        // Optimize for production (using esbuild - faster and no extra dependencies)
        minify: 'esbuild',
        // Remove console and debugger in production
        esbuild: {
            drop: ['console', 'debugger'],
        },
        // Enable source maps for debugging (optional)
        sourcemap: false,
        // Chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Copy public assets
        copyPublicDir: true,
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['lucide'],
    },
});
