/**
 * Utilidades de Sanitización y Seguridad Defensiva
 * Mitigación contra OWASP A03 (Injection / XSS / SQLi)
 */

/**
 * Escapa caracteres HTML especiales para mitigar Cross-Site Scripting (XSS).
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida si una URL es segura para navegación o redirección.
 * Rechaza esquemas peligrosos como javascript:, data: o vbscript:.
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  
  // Esquemas peligrosos
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return false;
  }

  // Acepta URLs relativas seguras (/ruta) o HTTP/HTTPS
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Detecta patrones típicos de SQL Injection en cadenas de entrada.
 * Útil para validación de campos de búsqueda y filtros.
 */
export function detectSqlInjectionPattern(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /\b(UNION\s+ALL\s+SELECT|UNION\s+SELECT)\b/i,
    /\b(OR\s+['"\d\w]+\s*=\s*['"\d\w]+)\b/i,
    /\b(AND\s+['"\d\w]+\s*=\s*['"\d\w]+)\b/i,
    /\b(DROP\s+TABLE|ALTER\s+TABLE|DELETE\s+FROM)\b/i,
    /\b(EXEC\s*\(|EXECUTE\s*\(|SLEEP\s*\()/i,
    /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
  ];

  return sqlInjectionPatterns.some((pattern) => pattern.test(input));
}

/**
 * Oculta (enmascara) cadenas sensibles para evitar fuga en logs o interfaces.
 * Muestra solo los primeros 4 y últimos 4 caracteres.
 */
export function maskSecret(secret: string): string {
  if (!secret || typeof secret !== 'string') return '';
  if (secret.length <= 8) return '****';
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-4);
  return `${prefix}${'*'.repeat(Math.min(secret.length - 8, 12))}${suffix}`;
}
