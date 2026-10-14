import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins:[react(),tailwindcss()],
    build:{
        target:'es2020',
        cssCodeSplit:true,
        sourcemap:false
    },
    test:{
        environment:'jsdom',
        include:['tests/**/*.test.js','tests/**/*.test.jsx']
    }
});
