import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'copy-music',
        closeBundle() {
          const src = path.resolve(__dirname, 'Music_Relax_Memories.mp3');
          const dest = path.resolve(__dirname, 'dist/Music_Relax_Memories.mp3');
          if (fs.existsSync(src)) {
            try {
              fs.copyFileSync(src, dest);
              console.log('Successfully copied Music_Relax_Memories.mp3 to dist/');
            } catch (err) {
              console.error('Error copying Music_Relax_Memories.mp3:', err);
            }
          } else {
            console.log('Music_Relax_Memories.mp3 not found in root, skipping copy.');
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
