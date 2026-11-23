/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

function generateWebConfigPlugin(mode: string): Plugin {
  return {
    name: 'generate-web-config',
    apply: 'build',
    closeBundle() {
      if (process.env.VITEST) return;
      const isDjp = mode === 'djp';
      const redirectUrl = isDjp ? '/KPIDJP/index.html' : '/KPIPlanta/index.html';

      const webConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA fallback routing" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="${redirectUrl}" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
    
    </staticContent>
  </system.webServer>
</configuration>
`;

      const distPath = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
      }

      fs.writeFileSync(path.join(distPath, 'web.config'), webConfigContent, 'utf-8');
      console.log(`\n✔ [web.config] Generado exitosamente con redirección a: ${redirectUrl}\n`);
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isDjp = mode === 'djp';

  return {
    base: isDjp ? '/KPIDJP/' : '/KPIPlanta/',
    plugins: [react(), tailwindcss(), generateWebConfigPlugin(mode)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
    server: {
      host: '0.0.0.0',
      port: 3001,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || env.VITE_API_HOST || 'https://serviciosrest.polakgrupo.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});

