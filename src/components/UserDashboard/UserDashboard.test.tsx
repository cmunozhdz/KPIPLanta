import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserDashboard } from './UserDashboard';
import { createGenericApiMock } from '../../testing/mocks/apiMock';

const apiMock = createGenericApiMock(global.fetch);

describe('UserDashboard - Componente e Inyección Fail-over', () => {
  afterEach(() => {
    apiMock.clear();
    jest.restoreAllMocks();
  });

  it('debería mostrar los datos del usuario cuando la API responde con éxito (Happy Path)', async () => {
    // Configuración del mock genérico para éxito
    apiMock.mockSuccess({ name: 'Carlos Muñoz' });

    render(<UserDashboard />);

    expect(screen.getByText(/cargando.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bienvenido, carlos muñoz/i })).toBeInTheDocument();
    });
    expect(screen.queryByText(/cargando.../i)).not.toBeInTheDocument();
  });

  it('debería activar el comportamiento fail-over si la API devuelve un error 500', async () => {
    // Configuración del mock genérico para simular caída del backend
    apiMock.mockFailOver(500);

    render(<UserDashboard />);

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Servicio temporalmente no disponible');
    });

    // Validamos que la app no crasheó y el esqueleto de carga se removió
    expect(screen.queryByText(/cargando.../i)).not.toBeInTheDocument();
  });
});