import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  isSafeUrl,
  detectSqlInjectionPattern,
  maskSecret,
} from '../sanitizer';

describe('Security Sanitizer (OWASP A03 Injection & XSS Mitigations)', () => {
  describe('sanitizeHtml', () => {
    it('debe escapar etiquetas <script> y atributos maliciosos', () => {
      const maliciousPayload = '<script>alert("XSS")</script>';
      const sanitized = sanitizeHtml(maliciousPayload);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('debe escapar caracteres especiales utilizados en vectores XSS', () => {
      const payload = `<img src="x" onerror='alert(1)'>`;
      const sanitized = sanitizeHtml(payload);

      expect(sanitized).toContain('&lt;img');
      expect(sanitized).toContain('&quot;x&quot;');
      expect(sanitized).toContain('&#x27;alert(1)&#x27;');
    });

    it('debe retornar cadena vacía ante entradas nulas o inválidas', () => {
      expect(sanitizeHtml(null as unknown as string)).toBe('');
      expect(sanitizeHtml(undefined as unknown as string)).toBe('');
    });
  });

  describe('isSafeUrl', () => {
    it('debe rechazar esquemas javascript:, data: y vbscript:', () => {
      expect(isSafeUrl('javascript:alert(document.cookie)')).toBe(false);
      expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    });

    it('debe permitir URLs relativas y URLs seguras HTTP/HTTPS', () => {
      expect(isSafeUrl('/dashboard/kpis')).toBe(true);
      expect(isSafeUrl('https://tableroplanta.com/api')).toBe(true);
      expect(isSafeUrl('http://localhost:3001')).toBe(true);
    });
  });

  describe('detectSqlInjectionPattern', () => {
    it('debe detectar patrones comunes de SQL Injection', () => {
      expect(detectSqlInjectionPattern("admin' OR '1'='1")).toBe(true);
      expect(detectSqlInjectionPattern("1; DROP TABLE users--")).toBe(true);
      expect(detectSqlInjectionPattern("1 UNION SELECT username, password FROM users")).toBe(true);
      expect(detectSqlInjectionPattern("1' OR 1=1--")).toBe(true);
    });

    it('debe permitir cadenas alfanuméricas normales y nombres válidos', () => {
      expect(detectSqlInjectionPattern('Area de Produccion')).toBe(false);
      expect(detectSqlInjectionPattern('linea_empaque_01')).toBe(false);
      expect(detectSqlInjectionPattern('calidad')).toBe(false);
    });
  });

  describe('maskSecret', () => {
    it('debe ocultar el contenido central de una API key o token', () => {
      const apiKey = 'AIzaSyDw38392019485749302948576839201';
      const masked = maskSecret(apiKey);

      expect(masked.startsWith('AIza')).toBe(true);
      expect(masked.endsWith('9201')).toBe(true);
      expect(masked).toContain('************');
      expect(masked).not.toBe(apiKey);
    });

    it('debe manejar cadenas cortas con asteriscos estándar', () => {
      expect(maskSecret('secret')).toBe('****');
    });
  });
});
