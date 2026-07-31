import '@testing-library/jest-dom';
import { vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Alias global de jest para compatibilidad total con tests existentes
(globalThis as any).jest = vi;
(globalThis as any).vi = vi;
