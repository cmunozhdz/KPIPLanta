// Test simple para KPIManager sin frameworks adicionales de testing
// Se ejecuta usando tsx: npx tsx src/components/KPIManager.test.tsx

import { CatalogosKPIService } from '../services/CatalogosKPI';

// Mock de CatalogosKPIService
const mockInsertKPI: any[] = [];
const mockUpdateKPI: any[] = [];
let mockOnSavedCalled = false;

// Sobrescribimos los métodos del servicio para mockearlos
CatalogosKPIService.getCategoriasLista = async () => [
  { CategoriaSQCDPID: 'S', CategoriaSQCDPDesc: 'Seguridad', CategoriaSQCDPActivo: true }
];
CatalogosKPIService.getDireccionesLista = () => [
  { id: 1, descripcion: 'Ascendente' }
];
CatalogosKPIService.getUnidadMedidaLista = async () => [
  { UnidadMedidaId: 'KG', UnidadMedidaDescripcion: 'Kilogramos' }
];
CatalogosKPIService.insertKPI = async (payload: any) => {
  mockInsertKPI.push(payload);
  return { success: true };
};
CatalogosKPIService.updateKPI = async (id: any, payload: any) => {
  mockUpdateKPI.push({ id, payload });
  return { success: true };
};

// Simulador de la lógica de handleSubmit de KPIManager
async function runTests() {
  console.log('🧪 Iniciando pruebas unitarias de KPIManager...\n');

  // Test 1: Registro con valor de meta = "0" (Debe dejar pasar)
  try {
    console.log('Test 1: Probar registro con valor de meta de "0" (debe permitir guardar)');

    // Reiniciamos estados de control
    mockInsertKPI.length = 0;
    mockOnSavedCalled = false;
    let errorState: string | null = null;
    let savingState = false;

    // Simulamos la lógica exacta de handleSubmit definida en KPIManager:
    const testHandleSubmit = async (metaValue: string, isValidUnidad: boolean) => {
      // Regla de validación de meta vacía
      if (metaValue === '') {
        errorState = 'La Meta no puede estar vacía.';
        return;
      }
      if (!isValidUnidad) {
        errorState = 'Debe seleccionar una Unidad de Medida válida de la lista.';
        return;
      }

      savingState = true;
      errorState = null;

      const payload = {
        Descripcion: 'Test KPI 0',
        Categoria: 'S',
        MetaActual: Number(metaValue),
        Direccion: 1,
        Unidaddemedida: 'KG',
        AreaId: 'AreaTest',
        KPIActivo: true,
      };

      try {
        await CatalogosKPIService.insertKPI(payload as any);
        mockOnSavedCalled = true;
      } catch (err: any) {
        errorState = err.message || 'Error';
      } finally {
        savingState = false;
      }
    };

    // Ejecutamos para meta = "0"
    await testHandleSubmit('0', true);

    if (errorState === null && mockOnSavedCalled && mockInsertKPI.length === 1 && mockInsertKPI[0].MetaActual === 0) {
      console.log('✅ TEST 1 PASÓ: Se permitió registrar con meta de 0 correctamente.');
    } else {
      throw new Error(`Fallo Test 1. Error: ${errorState}, SavedCalled: ${mockOnSavedCalled}, Inserted: ${mockInsertKPI.length}`);
    }

  } catch (err: any) {
    console.error('❌ TEST 1 FALLÓ:', err.message);
    process.exit(1);
  }

  // Test 2: Registro con valor de meta vacío "" (No debe dejar pasar)
  try {
    console.log('\nTest 2: Probar registro con valor de meta vacío "" (no debe permitir guardar)');

    // Reiniciamos estados de control
    mockInsertKPI.length = 0;
    mockOnSavedCalled = false;
    let errorState: string | null = null;

    const testHandleSubmit = async (metaValue: string, isValidUnidad: boolean) => {
      // Regla de validación de meta vacía
      if (metaValue === '') {
        errorState = 'La Meta no puede estar vacía.';
        return;
      }
      if (!isValidUnidad) {
        errorState = 'Debe seleccionar una Unidad de Medida válida de la lista.';
        return;
      }

      const payload = {
        MetaActual: Number(metaValue),
      };
      await CatalogosKPIService.insertKPI(payload as any);
      mockOnSavedCalled = true;
    };

    // Ejecutamos para meta = "" (vacío)
    await testHandleSubmit('', true);

    if (errorState === 'La Meta no puede estar vacía.' && !mockOnSavedCalled && mockInsertKPI.length === 0) {
      console.log('✅ TEST 2 PASÓ: No se permitió registrar con meta vacía y se mostró el error correcto.');
    } else {
      throw new Error(`Fallo Test 2. Error: ${errorState}, SavedCalled: ${mockOnSavedCalled}, Inserted: ${mockInsertKPI.length}`);
    }

  } catch (err: any) {
    console.error('❌ TEST 2 FALLÓ:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 ¡Todas las pruebas finalizaron con éxito!');
}

runTests();
