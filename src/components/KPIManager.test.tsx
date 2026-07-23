import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { KPIManager } from './KPIManager';
import { CatalogosKPIService } from '../services/CatalogosKPI';

// Mock CatalogosKPIService
jest.mock('../services/CatalogosKPI', () => {
  return {
    CatalogosKPIService: {
      getDireccionesLista: jest.fn(),
      getCategoriasLista: jest.fn(),
      getKPIById: jest.fn(),
      getUnidadMedidaLista: jest.fn(),
      insertKPI: jest.fn(),
      updateKPI: jest.fn(),
    },
  };
});

describe('KPIManager - Componente y Pruebas de Robustez (Fail-over)', () => {
  const mockOnClose = jest.fn();
  const mockOnSaved = jest.fn();
  const mockCategorias = [
    { CategoriaSQCDPID: 'S', CategoriaSQCDPDesc: 'Seguridad', CategoriaSQCDPActivo: true },
    { CategoriaSQCDPID: 'Q', CategoriaSQCDPDesc: 'Calidad', CategoriaSQCDPActivo: true },
  ];
  const mockDirecciones = [
    { id: 1, descripcion: 'Ascendente (Más es Mejor)' },
    { id: 2, descripcion: 'Descendente (Menos es mejor)' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (CatalogosKPIService.getDireccionesLista as jest.Mock).mockReturnValue(mockDirecciones);
    (CatalogosKPIService.getCategoriasLista as jest.Mock).mockResolvedValue(mockCategorias);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debería renderizar en modo inserción (INS) cargando catálogos e inicializando formulario vacío', async () => {
    render(
      <KPIManager
        mode="INS"
        areaId="Area-Test"
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Muestra loader de catálogos
    expect(screen.getByText(/cargando catálogos.../i)).toBeInTheDocument();

    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.queryByText(/cargando catálogos.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /nuevo kpi/i })).toBeInTheDocument();
    expect(screen.getByText(/área \/ pilar: area-test/i)).toBeInTheDocument();

    // Campos vacíos por defecto
    expect(screen.getByLabelText(/descripción del kpi/i)).toHaveValue('');
    expect(screen.getByLabelText(/categoría sqcdp/i)).toHaveValue('S');
    expect(screen.getByLabelText(/meta/i)).toHaveValue(0);
    expect(screen.getByLabelText(/unidad de medida/i)).toHaveValue('');
    expect(screen.getByLabelText(/dirección de mejora/i)).toHaveValue('1');
    expect(screen.getByLabelText(/kpi activo/i)).toBeChecked();
  });

  it('debería renderizar en modo edición (UPD), consultar el KPI por ID y llenar el formulario', async () => {
    const mockKPI = {
      KPI: 45,
      Descripcion: 'Eficiencia Global de Equipos',
      Categoria: 'Q',
      MetaActual: 85.5,
      Direccion: 1,
      Unidaddemedida: 'PCT',
      UnidadMedidaDescripcion: 'Porcentaje',
      KPIActivo: true,
    };

    (CatalogosKPIService.getKPIById as jest.Mock).mockResolvedValue(mockKPI);

    render(
      <KPIManager
        mode="UPD"
        areaId="Area-Test"
        kpiId={45}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Loader de edición
    expect(screen.getByText(/cargando datos del kpi.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/cargando datos del kpi.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /editar kpi/i })).toBeInTheDocument();
    expect(CatalogosKPIService.getKPIById).toHaveBeenCalledWith(45);

    // Validar carga de datos en formulario
    expect(screen.getByLabelText(/descripción del kpi/i)).toHaveValue('Eficiencia Global de Equipos');
    expect(screen.getByLabelText(/categoría sqcdp/i)).toHaveValue('Q');
    expect(screen.getByLabelText(/meta/i)).toHaveValue(85.5);
    expect(screen.getByLabelText(/unidad de medida/i)).toHaveValue('Porcentaje');
    expect(screen.getByLabelText(/dirección de mejora/i)).toHaveValue('1');
  });

  it('debería manejar el fail-over si la API de carga inicial falla, permitiendo reintentar', async () => {
    // Simulamos fallo 500 en catálogo
    (CatalogosKPIService.getCategoriasLista as jest.Mock).mockRejectedValue(
      new Error('Error del servidor al obtener categorías')
    );

    render(
      <KPIManager
        mode="INS"
        areaId="Area-Test"
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/no se pudo cargar la información/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/error del servidor al obtener categorías/i)).toBeInTheDocument();

    // Botones de acción del fail-over
    const btnCerrar = screen.getByRole('button', { name: /cerrar/i });
    const btnReintentar = screen.getByRole('button', { name: /reintentar/i });
    expect(btnCerrar).toBeInTheDocument();
    expect(btnReintentar).toBeInTheDocument();

    // Probamos reintento simulando éxito esta vez
    (CatalogosKPIService.getCategoriasLista as jest.Mock).mockResolvedValue(mockCategorias);
    
    await act(async () => {
      await userEvent.click(btnReintentar);
    });

    await waitFor(() => {
      expect(screen.queryByText(/no se pudo cargar la información/i)).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /nuevo kpi/i })).toBeInTheDocument();
  });

  it('debería llamar a onClose al hacer clic en el botón cerrar o en el backdrop', async () => {
    render(
      <KPIManager
        mode="INS"
        areaId="Area-Test"
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando catálogos.../i)).not.toBeInTheDocument();
    });

    // Botón X
    const closeBtn = screen.getByRole('button', { name: '' }); // El botón con X no tiene texto pero contiene lucide X
    // Podemos buscarlo por la clase transition-all o la estructura
    const buttons = screen.getAllByRole('button');
    const xButton = buttons[0]; // El de arriba a la derecha es el primer botón
    
    await act(async () => {
      await userEvent.click(xButton);
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debería mostrar mensaje de error de validación si no se selecciona una unidad de medida de la lista', async () => {
    render(
      <KPIManager
        mode="INS"
        areaId="Area-Test"
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando catálogos.../i)).not.toBeInTheDocument();
    });

    // Rellenamos descripción
    await userEvent.type(screen.getByLabelText(/descripción del kpi/i), 'KPI Sin Unidad');
    
    // Escribimos unidad pero no la seleccionamos de la lista
    await userEvent.type(screen.getByLabelText(/unidad de medida/i), 'KILOS');

    // Intentamos enviar
    await userEvent.click(screen.getByRole('button', { name: /crear kpi/i }));

    expect(screen.getByText(/debe seleccionar una unidad de medida válida de la lista/i)).toBeInTheDocument();
    expect(CatalogosKPIService.insertKPI).not.toHaveBeenCalled();
  });

  it('debería buscar unidades de medida con debounce y permitir seleccionar del autocompletado', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const mockUnidades = [
      { UnidadMedidaId: 'KG', UnidadMedidaDescripcion: 'Kilogramos' },
      { UnidadMedidaId: 'KGR', UnidadMedidaDescripcion: 'Kiloramos' },
    ];
    (CatalogosKPIService.getUnidadMedidaLista as jest.Mock).mockResolvedValue(mockUnidades);

    render(
      <KPIManager
        mode="INS"
        areaId="Area-Test"
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Esperar carga inicial
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    const unidadInput = screen.getByLabelText(/unidad de medida/i);

    // Escribimos text
    await user.type(unidadInput, 'KG');

    // Avanzar 400ms para el debounce
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(CatalogosKPIService.getUnidadMedidaLista).toHaveBeenCalledWith('KG');
    });

    // Debería aparecer la lista desplegable
    await waitFor(() => {
      expect(screen.getByText(/kilogramos/i)).toBeInTheDocument();
    });

    // Hacemos click en una opción del desplegable
    const opcion = screen.getByText(/kilogramos/i);
    await user.click(opcion);

    // El input debe haberse actualizado con la descripción completa
    expect(unidadInput).toHaveValue('Kilogramos');
    
    // Ya no debe mostrarse el mensaje de error por unidad inválida
    expect(screen.queryByText(/seleccione un elemento de la lista/i)).not.toBeInTheDocument();
  });

  it('debería crear un KPI exitosamente (Happy Path) y llamar a onSaved', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    (CatalogosKPIService.getUnidadMedidaLista as jest.Mock).mockResolvedValue([
      { UnidadMedidaId: 'KG', UnidadMedidaDescripcion: 'Kilogramos' }
    ]);
    (CatalogosKPIService.insertKPI as jest.Mock).mockResolvedValue({ success: true });

    render(
      <KPIManager
        mode="INS"
        areaId="Area-Test"
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    // Esperar carga inicial
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // Llenar campos obligatorios
    await user.type(screen.getByLabelText(/descripción del kpi/i), 'Merma de Acero');
    await user.clear(screen.getByLabelText(/meta/i));
    await user.type(screen.getByLabelText(/meta/i), '12.5');

    // Buscar y seleccionar unidad
    await user.type(screen.getByLabelText(/unidad de medida/i), 'KG');
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    
    const opcion = await screen.findByText(/kilogramos/i);
    await user.click(opcion);

    // Cambiar checkbox y combo
    await user.selectOptions(screen.getByLabelText(/categoría sqcdp/i), 'Q');
    await user.selectOptions(screen.getByLabelText(/dirección de mejora/i), '2');

    // Volver a usar timers reales para el submit o ejecutarlo con act
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /crear kpi/i }));
    });

    expect(CatalogosKPIService.insertKPI).toHaveBeenCalledWith({
      KPI: undefined,
      Descripcion: 'Merma de Acero',
      Categoria: 'Q',
      MetaActual: 12.5,
      Direccion: 2,
      Unidaddemedida: 'KG',
      Periodicidad: 'M',
      AreaId: 'Area-Test',
      KPIActivo: true
    });

    expect(mockOnSaved).toHaveBeenCalledTimes(1);
  });

  it('debería actualizar un KPI exitosamente (Happy Path) y llamar a onSaved', async () => {
    const mockKPI = {
      KPI: 99,
      Descripcion: 'KPI Preexistente',
      Categoria: 'S',
      MetaActual: 100,
      Direccion: 1,
      Unidaddemedida: 'KG',
      UnidadMedidaDescripcion: 'Kilogramos',
      KPIActivo: true,
    };

    (CatalogosKPIService.getKPIById as jest.Mock).mockResolvedValue(mockKPI);
    (CatalogosKPIService.updateKPI as jest.Mock).mockResolvedValue({ success: true });

    render(
      <KPIManager
        mode="UPD"
        areaId="Area-Test"
        kpiId={99}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando datos del kpi.../i)).not.toBeInTheDocument();
    });

    // Modificar descripción y guardar
    await userEvent.clear(screen.getByLabelText(/descripción del kpi/i));
    await userEvent.type(screen.getByLabelText(/descripción del kpi/i), 'KPI Editado');

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
    });

    expect(CatalogosKPIService.updateKPI).toHaveBeenCalledWith(99, {
      KPI: 99,
      Descripcion: 'KPI Editado',
      Categoria: 'S',
      MetaActual: 100,
      Direccion: 1,
      Unidaddemedida: 'KG',
      Periodicidad: 'M',
      AreaId: 'Area-Test',
      KPIActivo: true
    });

    expect(mockOnSaved).toHaveBeenCalledTimes(1);
  });

  it('debería activar el comportamiento fail-over al guardar si el servicio backend responde con error 500', async () => {
    const mockKPI = {
      KPI: 99,
      Descripcion: 'KPI Preexistente',
      Categoria: 'S',
      MetaActual: 100,
      Direccion: 1,
      Unidaddemedida: 'KG',
      UnidadMedidaDescripcion: 'Kilogramos',
      KPIActivo: true,
    };

    (CatalogosKPIService.getKPIById as jest.Mock).mockResolvedValue(mockKPI);
    (CatalogosKPIService.updateKPI as jest.Mock).mockRejectedValue(
      new Error('Error de conexión o fallo interno del servidor (500)')
    );

    render(
      <KPIManager
        mode="UPD"
        areaId="Area-Test"
        kpiId={99}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/cargando datos del kpi.../i)).not.toBeInTheDocument();
    });

    // Clic en Guardar Cambios
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
    });

    // Se muestra alerta de error y no se rompe la app (el formulario sigue visible)
    expect(screen.getByText(/error de conexión o fallo interno del servidor \(500\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
    expect(mockOnSaved).not.toHaveBeenCalled();
  });
});
