import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';
import { areaService } from './services/areaService';
import { calendarService } from './services/calendarService';
import { CatalogosKPIService } from './services/CatalogosKPI';

// Mock de servicios para evitar llamadas reales HTTP durante las pruebas
vi.mock('./services/areaService', () => ({
  areaService: {
    getAreas: vi.fn(),
  },
}));

vi.mock('./services/calendarService', () => ({
  calendarService: {
    getCalendarioSemanal: vi.fn(),
  },
}));

vi.mock('./services/CatalogosKPI', () => ({
  CatalogosKPIService: {
    getAreaKPIs: vi.fn(),
    getUnidadesMedida: vi.fn(),
  },
}));

describe('App - Prueba de Render al Ingresar por Primera Vez', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('debería mostrar la pantalla de Login cuando se ingresa por primera vez sin sesión activa', () => {
    render(<App />);

    // Verificar que al no haber sesión en localStorage se muestre la pantalla de Login
    expect(screen.getByRole('heading', { name: /inicio sesión/i })).toBeInTheDocument();
    expect(screen.getByText(/ingresa al portal inteligencia operativa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument();
    expect(screen.getByText(/bienvenido/i)).toBeInTheDocument();
  });

  it('debería renderizar la aplicación principal y el header si ya existe una sesión guardada', async () => {
    // Simular sesión de usuario guardada en localStorage
    const mockUser = { email: 'usuario.planta@polak.com', role: 'operator' };
    localStorage.setItem('kpi_user_session', JSON.stringify(mockUser));

    // Mocks de respuesta de los servicios
    (areaService.getAreas as any).mockResolvedValue({
      Areas: [
        { AreaId: 'A1', AreaDescripcion: 'Seguridad', AreaIcon: 'Shield', AreaColor: 'emerald' },
        { AreaId: 'A2', AreaDescripcion: 'Calidad', AreaIcon: 'CheckCircle', AreaColor: 'blue' }
      ]
    });
    (CatalogosKPIService.getAreaKPIs as any).mockResolvedValue([]);
    (calendarService.getCalendarioSemanal as any).mockResolvedValue([
      { Semana: 1, Inicio: '2026-01-01', Fin: '2026-01-07' }
    ]);

    render(<App />);

    // Esperar a que se cargue la estructura inicial de la planta
    await waitFor(() => {
      expect(screen.getByText('KPI Planta Polak')).toBeInTheDocument();
    });

    // Verificar que se muestre el subtítulo y el email del usuario logueado
    expect(screen.getByText('Pillar Management System')).toBeInTheDocument();
    expect(screen.getByText('usuario.planta@polak.com')).toBeInTheDocument();
    expect(screen.getByText('Operador')).toBeInTheDocument();
  });
});
