import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Secret Leakage Prevention (OWASP A02 & A05)', () => {
  it('el archivo .gitignore debe ignorar los archivos de variables de entorno (.env*)', () => {
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    const hasEnvIgnore =
      gitignoreContent.includes('.env*') ||
      gitignoreContent.includes('.env') ||
      gitignoreContent.includes('*.env');

    expect(hasEnvIgnore).toBe(true);
  });

  it('no deben existir credenciales ni API keys reales hardcodeadas en código fuente src/', () => {
    const srcDir = path.resolve(process.cwd(), 'src');

    // Patrones de llaves de API reales conocidas
    const secretPatterns = [
      { name: 'Google Gemini / Cloud API Key', regex: /AIzaSy[A-Za-z0-9_-]{33}/ },
      { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{20,T3BlbkFJ[a-zA-Z0-9]{20,}/ },
      { name: 'Private Key PEM', regex: /-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----/ },
      { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/ },
    ];

    function checkDirectory(dir: string) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
          // Omitir node_modules, dist o tests
          if (file.name !== 'node_modules' && file.name !== 'dist' && file.name !== '__tests__') {
            checkDirectory(fullPath);
          }
        } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          for (const pattern of secretPatterns) {
            const match = pattern.regex.exec(content);
            if (match) {
              throw new Error(
                `Alerta de seguridad: Posible secreto detectado (${pattern.name}) en el archivo: ${fullPath}`
              );
            }
          }
        }
      }
    }

    expect(() => checkDirectory(srcDir)).not.toThrow();
  });
});
