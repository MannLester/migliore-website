import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import type { Plugin } from 'vite'

function testImageDescriptors(): Plugin {
  return {
    name: 'test-responsive-image-descriptors',
    enforce: 'pre',
    load: {
      filter: { id: /\.(?:jpe?g|png|webp)\?.*as=picture/ },
      handler(id) {
        const src = id.split('?')[0]
        return `export default ${JSON.stringify({
          sources: {
            avif: `${src}.avif 480w, ${src}.avif 900w`,
            webp: `${src}.webp 480w, ${src}.webp 900w`,
            jpeg: `${src} 480w, ${src} 900w`,
          },
          img: { src, w: 900, h: 1125 },
        })}`
      },
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'test' ? [testImageDescriptors()] : [imagetools()])],
  publicDir: false,
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    globals: true,
  },
}))
