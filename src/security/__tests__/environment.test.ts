import { describe, it, expect } from 'vitest';
import packageJson from '../../../package.json';

describe('Environment & Runtime Stability (Node.js & React)', () => {
  it('debe utilizar una versión estable y soportada de React', () => {
    const reactVersion = packageJson.dependencies.react;
    const reactDomVersion = packageJson.dependencies['react-dom'];

    expect(reactVersion).toBeDefined();
    expect(reactDomVersion).toBeDefined();

    // React debe ser 18.x o 19.x (versiones con parches y soporte activo)
    const isValidReact =
      reactVersion.includes('18.') || reactVersion.includes('19.');
    expect(isValidReact).toBe(true);

    // react y react-dom deben tener la misma versión mayor
    const reactMajor = reactVersion.replace(/[\^~]/, '').split('.')[0];
    const domMajor = reactDomVersion.replace(/[\^~]/, '').split('.')[0];
    expect(reactMajor).toBe(domMajor);
  });

  it('debe tener definido un rango de Node.js LTS en engines o respetar la versión mínima de seguridad', () => {
    const pkg = packageJson as Record<string, any>;
    // Si packageJson declara engines, verificar que exija Node >= 20 o >= 22
    if (pkg.engines && pkg.engines.node) {
      const nodeEngine = pkg.engines.node;
      expect(nodeEngine).toMatch(/(20|22)/);
    } else {
      // Si no está declarado en package.json, verificar que el entorno actual sea Node 20+
      const currentMajor = parseInt(process.versions.node.split('.')[0], 10);
      expect(currentMajor).toBeGreaterThanOrEqual(20);
    }
  });

  it('no debe utilizar librerías críticas con versiones deprecated conocidas', () => {
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Librerías de riesgo conocidas / abandonadas
    const deprecatedPackages = ['request', 'querystring', 'nomnom', 'urllib'];
    deprecatedPackages.forEach((pkg) => {
      expect(deps).not.toHaveProperty(pkg);
    });
  });
});
