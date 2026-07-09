import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { KPIDetailsModal } from './KPIDetailsModal';
import { kpiHistoricoService } from '../services/kpiHistoricoService';
import { Kpi, Area, KpiHistoricoSemanal } from '../types';

// Mock kpiHistoricoService
jest.mock('../services/kpiHistoricoService', () => {
  return {
    kpiHistoricoService: {
      getKpiHistoricoRango: jest.fn(),
      deleteHistorico: jest.fn(),
    },
  };
});

// Mock Recharts and Framer Motion to avoid rendering issues in JSDOM
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
  };
});

jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('KPIDetailsModal - Pruebas de Eliminación de Histórico y Robustez', () => {
  const mockOnClose = jest.fn();

  const mockKpi: Kpi = {
    id: '12',
    areaId: 'mant',
    cat: 'S',
    label: 'Incidentes de Seguridad',
    target: 0,
    dir: -1,
    unit: 'EA',
    history: [],
  };

  const mockAreas: Area[] = [
    { id: 'mant', name: 'Mantenimiento', icon: 'Factory', color: 'blue' },
  ];

  const mockHistoryList: KpiHistoricoSemanal[] = [
    {
      Historico: '101',
      Registro: '2026-07-02T10:36:00Z',
      Usuario: 'admin@polakgrupo.com',
      AreaId: 'mant',
      AreaDescripcion: 'Mantenimiento',
      CategoriaID: 'S',
      KPIID: 12,
      MetaActual: '0',
      MetaAsignada: '0',
      Valor: '0.00',
      Ano: 2026,
      Mes: 7,
      Semana: 27,
      Comentarios: 'Sin incidentes',
      FechaConsulta: '',
      Descripcion: 'Incidentes de Seguridad',
      KPIActivo: true,
      Calificacion: 'Verde',
    },
    {
      Historico: '102',
      Registro: '2026-07-02T16:35:00Z',
      Usuario: 'admin@polakgrupo.com',
      AreaId: 'mant',
      AreaDescripcion: 'Mantenimiento',
      CategoriaID: 'S',
      KPIID: 12,
      MetaActual: '0',
      MetaAsignada: '0',
      Valor: '1.00',
      Ano: 2026,
      Mes: 6,
      Semana: 26,
      Comentarios: 'Un incidente menor',
      FechaConsulta: '',
      Descripcion: 'Incidentes de Seguridad',
      KPIActivo: true,
      Calificacion: 'Amarillo',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (kpiHistoricoService.getKpiHistoricoRango as jest.Mock).mockResolvedValue({
      AreaKPIHistoricoDatas: mockHistoryList,
      Count: 2,
    });
  });

  it('debería renderizar la lista de históricos correctamente y ocultar las acciones de eliminación para usuarios normales', async () => {
    render(
      <KPIDetailsModal
        kpi={mockKpi}
        ano={2026}
        areas={mockAreas}
        onClose={mockOnClose}
        isAdmin={false}
      />
    );

    // Muestra loader
    expect(screen.getByText(/cargando historial del servidor/i)).toBeInTheDocument();

    // Espera a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText(/cargando historial del servidor/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Semana 27')).toBeInTheDocument();
    expect(screen.getByText('Semana 26')).toBeInTheDocument();
    expect(screen.getByText('Sin incidentes')).toBeInTheDocument();

    // No debe mostrar columna Acciones ni botones de eliminar
    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar registro')).not.toBeInTheDocument();
  });

  it('debería mostrar el botón de bote de basura si isAdmin es verdadero', async () => {
    render(
      <KPIDetailsModal
        kpi={mockKpi}
        ano={2026}
        areas={mockAreas}
        onClose={mockOnClose}
        isAdmin={true}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando historial del servidor/i)).not.toBeInTheDocument();
    });

    // Debe mostrar la columna Acciones
    expect(screen.getByText('Acciones')).toBeInTheDocument();

    // Debe mostrar los dos botones de bote de basura
    const deleteBtns = screen.getAllByTitle('Eliminar registro');
    expect(deleteBtns).toHaveLength(2);
  });

  it('debería abrir el modal de confirmación mostrando detalles del registro al hacer clic en eliminar', async () => {
    render(
      <KPIDetailsModal
        kpi={mockKpi}
        ano={2026}
        areas={mockAreas}
        onClose={mockOnClose}
        isAdmin={true}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando historial del servidor/i)).not.toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByTitle('Eliminar registro');
    // Hacer clic en el primer botón de eliminar (que corresponde al primer registro ordenado reversamente: Semana 27)
    await act(async () => {
      await userEvent.click(deleteBtns[0]);
    });

    // Se debe mostrar el modal de confirmación
    const confirmHeading = screen.getByRole('heading', { name: /confirmar eliminación/i });
    expect(confirmHeading).toBeInTheDocument();
    
    const modalText = confirmHeading.nextElementSibling;
    expect(modalText?.textContent).toContain('Semana 27');
    expect(modalText?.textContent).toContain('0.00 EA');
  });

  it('debería cerrar el modal de confirmación sin llamar a la API si se hace clic en Cancelar', async () => {
    render(
      <KPIDetailsModal
        kpi={mockKpi}
        ano={2026}
        areas={mockAreas}
        onClose={mockOnClose}
        isAdmin={true}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando historial del servidor/i)).not.toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByTitle('Eliminar registro');
    await act(async () => {
      await userEvent.click(deleteBtns[0]);
    });

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await act(async () => {
      await userEvent.click(cancelBtn);
    });

    // El modal de confirmación debe cerrarse
    expect(screen.queryByRole('heading', { name: /confirmar eliminación/i })).not.toBeInTheDocument();
    expect(kpiHistoricoService.deleteHistorico).not.toHaveBeenCalled();
  });

  it('debería ejecutar deleteHistorico y volver a consultar el historial tras una confirmación exitosa', async () => {
    (kpiHistoricoService.deleteHistorico as jest.Mock).mockResolvedValue({
      message: 'Los datos han sido eliminados.',
    });

    render(
      <KPIDetailsModal
        kpi={mockKpi}
        ano={2026}
        areas={mockAreas}
        onClose={mockOnClose}
        isAdmin={true}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando historial del servidor/i)).not.toBeInTheDocument();
    });

    // Limpiamos los llamados del getKpiHistoricoRango de la carga inicial
    (kpiHistoricoService.getKpiHistoricoRango as jest.Mock).mockClear();

    const deleteBtns = screen.getAllByTitle('Eliminar registro');
    await act(async () => {
      await userEvent.click(deleteBtns[0]); // Semana 27 (ID: 101)
    });

    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    await act(async () => {
      await userEvent.click(confirmBtn);
    });

    // Se debió llamar al servicio delete con el ID correcto
    expect(kpiHistoricoService.deleteHistorico).toHaveBeenCalledWith('101');

    // Debe mostrar el toast de éxito
    await waitFor(() => {
      expect(screen.getByText('Los datos han sido eliminados.')).toBeInTheDocument();
    });

    // Se debió recargar el historial
    expect(kpiHistoricoService.getKpiHistoricoRango).toHaveBeenCalledWith(12, 2026);
  });

  it('debería manejar el escenario fail-over mostrando una alerta de error temporal si la API falla', async () => {
    (kpiHistoricoService.deleteHistorico as jest.Mock).mockRejectedValue(
      new Error('Error interno de servidor (500)')
    );

    render(
      <KPIDetailsModal
        kpi={mockKpi}
        ano={2026}
        areas={mockAreas}
        onClose={mockOnClose}
        isAdmin={true}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando historial del servidor/i)).not.toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByTitle('Eliminar registro');
    await act(async () => {
      await userEvent.click(deleteBtns[0]);
    });

    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    await act(async () => {
      await userEvent.click(confirmBtn);
    });

    // Se llamó a la API de borrado y falló
    expect(kpiHistoricoService.deleteHistorico).toHaveBeenCalledWith('101');

    // Se muestra el toast de error y no se rompe la aplicación
    await waitFor(() => {
      expect(screen.getByText('Error interno de servidor (500)')).toBeInTheDocument();
    });

    // El botón de confirmación ya no está cargando y el modal sigue visible o se puede cerrar
    expect(screen.getByRole('heading', { name: /confirmar eliminación/i })).toBeInTheDocument();
  });
});
