import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import routePreload,{inlineCss} from './scripts/routePreload.js';

export default defineConfig({
    plugins:[react(),tailwindcss(),routePreload(),inlineCss()],
    build:{
        target:'es2020',
        cssCodeSplit:true,
        sourcemap:false,
        rollupOptions:{
            output:{
                // React and the router change rarely: their own files stay cached across deploys.
                manualChunks:(id)=>{
                    if(id.includes('node_modules/react-router')){
                        return 'router';
                    }
                    if(id.includes('node_modules/react-dom')||id.includes('node_modules/react/')||id.includes('node_modules/scheduler')){
                        return 'react';
                    }
                    return undefined;
                }
            }
        }
    },
    test:{
        environment:'jsdom',
        include:['tests/**/*.test.js','tests/**/*.test.jsx']
    }
});
