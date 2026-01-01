import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './src/index.js',
            name: 'pipe-js',
            fileName: (format) => `pipe-js.${format}.js`
        },
        rollupOptions: {
            // При необходимости добавить внешние зависимости
            external: [],
            output: {
                globals: {},
            },
        },
    },
});