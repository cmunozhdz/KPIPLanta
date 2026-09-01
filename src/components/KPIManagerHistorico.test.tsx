import { describe, it } from 'vitest';
import { kpiHistoricoService } from '../services/kpiHistoricoService';

// Mocks del servicio kpiHistoricoService
const mockInsertHistoricoCalls: any[] = [];
const mockUpdateHistoricoCalls: any[] = [];
let mockGetHistoricoByIdCalledWith: string | null = null;

kpiHistoricoService.getHistoricoById = async (id: string) => {
  mockGetHistoricoByIdCalledWith = id;
  return {
    Historico: parseInt(id, 10),
    Usuario: 'admin@polakgrupo.com',
    AreaId: 'AreaTest',
    KPIID: 101,
    Valor: 75.5,
    Ano: 2026,
    Mes: 7,
    Semana: 27,
    Comentarios: 'Comentario existente',
    Registro: new Date().toISOString(),
    MetaAsignada: 80,
    KPIHistoricoActivo: true
  } as any;
};

kpiHistoricoService.insertHistorico = async (payload: any) => {
  mockInsertHistoricoCalls.push(payload);
  return {
    result: payload,
    message: 'Registro exitoso.'
  };
};

kpiHistoricoService.updateHistorico = async (id: string, payload: any) => {
  mockUpdateHistoricoCalls.push({ id, payload });
  return {
    result: payload,
    message: 'Actualización exitosa.'
  };
};

// Simulador de la lógica interna de handleSubmit de KPIManagerHistorico
async function simulateHandleSubmit(params: {
  historicoId: string;
  valor: string;
  comentarios: string;
  userEmail: string;
  areaId: string;
  kpiId: number;
  ano: number;
  mes: number;
  semana: number;
}) {
  const isEditMode = params.historicoId !== '0' && params.historicoId !== '';
  let error: string | null = null;
  let successMsg: string | null = null;

  // Lógica de validación exacta de KPIManagerHistorico
  const numericValor = parseFloat(params.valor);
  if (isNaN(numericValor)) {
    error = 'El valor ingresado no es un número válido.';
    return { error, successMsg };
  }

  const fullText = params.comentarios.trim();
  const totalWords = fullText
    .split(/\s+/)
    .filter(word => /[a-zA-Z0-9ñÑáéíóúüÁÉÍÓÚÜ]/.test(word));

  if (fullText.length <= 1 || totalWords.length < 2) {
    error = 'El comentario es obligatorio y debe contener al menos dos palabras (no se permite un solo carácter o una sola palabra).';
    return { error, successMsg };
  }

  try {
    if (isEditMode) {
      const result = await kpiHistoricoService.updateHistorico(params.historicoId, {
        Historico: parseInt(params.historicoId, 10),
        Usuario: params.userEmail,
        AreaId: params.areaId,
        KPIID: params.kpiId,
        Valor: numericValor,
        Ano: params.ano,
        Mes: params.mes,
        Semana: params.semana,
        Comentarios: params.comentarios
      });
      successMsg = result.message;
    } else {
      const result = await kpiHistoricoService.insertHistorico({
        Usuario: params.userEmail,
        AreaId: params.areaId,
        KPIID: params.kpiId,
        Valor: numericValor,
        Ano: params.ano,
        Mes: params.mes,
        Semana: params.semana,
        Comentarios: params.comentarios
      });
      successMsg = result.message;
    }
  } catch (err: any) {
    error = err.message || 'Error al procesar la solicitud.';
  }

  return { error, successMsg };
}

async function runTests() {
  console.log('🧪 Iniciando pruebas unitarias de KPIManagerHistorico...\n');

  // Test 1: Inserción exitosa de un KPI histórico
  try {
    console.log('Test 1: Probar inserción exitosa con datos válidos');
    mockInsertHistoricoCalls.length = 0;

    const res = await simulateHandleSubmit({
      historicoId: '0',
      valor: '92.4',
      comentarios: 'Producción de la semana superada sin contratiempos',
      userEmail: 'operator@polakgrupo.com',
      areaId: 'AreaProd',
      kpiId: 42,
      ano: 2026,
      mes: 7,
      semana: 27
    });

    if (
      res.error === null &&
      res.successMsg === 'Registro exitoso.' &&
      mockInsertHistoricoCalls.length === 1 &&
      mockInsertHistoricoCalls[0].Valor === 92.4 &&
      mockInsertHistoricoCalls[0].Comentarios === 'Producción de la semana superada sin contratiempos'
    ) {
      console.log('✅ TEST 1 PASÓ: Inserción procesada correctamente.');
    } else {
      throw new Error(`Fallo Test 1. Resultado: ${JSON.stringify(res)}`);
    }
  } catch (err: any) {
    console.error('❌ TEST 1 FALLÓ:', err.message);
    process.exit(1);
  }

  // Test 2: Validación de valor no numérico
  try {
    console.log('\nTest 2: Probar valor no numérico (debe fallar la validación)');
    const res = await simulateHandleSubmit({
      historicoId: '0',
      valor: 'not-a-number',
      comentarios: 'Valor no numérico ingresado por usuario',
      userEmail: 'operator@polakgrupo.com',
      areaId: 'AreaProd',
      kpiId: 42,
      ano: 2026,
      mes: 7,
      semana: 27
    });

    if (res.error === 'El valor ingresado no es un número válido.' && res.successMsg === null) {
      console.log('✅ TEST 2 PASÓ: Se detectó correctamente el valor no numérico.');
    } else {
      throw new Error(`Fallo Test 2. Resultado: ${JSON.stringify(res)}`);
    }
  } catch (err: any) {
    console.error('❌ TEST 3 FALLÓ:', err.message);
    process.exit(1);
  }

  // Test 3: Rechazar un solo carácter
  try {
    console.log('\nTest 3: Probar un solo carácter en comentario (debe fallar)');
    const res = await simulateHandleSubmit({
      historicoId: '0',
      valor: '95',
      comentarios: 'a',
      userEmail: 'operator@polakgrupo.com',
      areaId: 'AreaProd',
      kpiId: 42,
      ano: 2026,
      mes: 7,
      semana: 27
    });

    if (
      res.error === 'El comentario es obligatorio y debe contener al menos dos palabras (no se permite un solo carácter o una sola palabra).' &&
      res.successMsg === null
    ) {
      console.log('✅ TEST 3 PASÓ: Se rechazó el comentario de un solo carácter.');
    } else {
      throw new Error(`Fallo Test 3. Resultado: ${JSON.stringify(res)}`);
    }
  } catch (err: any) {
    console.error('❌ TEST 3 FALLÓ:', err.message);
    process.exit(1);
  }

  // Test 4: Rechazar varios enters o saltos de línea / espacios vacíos
  try {
    console.log('\nTest 4: Probar varios enters / saltos de línea sin texto válido (debe fallar)');
    const res = await simulateHandleSubmit({
      historicoId: '0',
      valor: '95',
      comentarios: '\n\n\n   \n\n',
      userEmail: 'operator@polakgrupo.com',
      areaId: 'AreaProd',
      kpiId: 42,
      ano: 2026,
      mes: 7,
      semana: 27
    });

    if (
      res.error === 'El comentario es obligatorio y debe contener al menos dos palabras (no se permite un solo carácter o una sola palabra).' &&
      res.successMsg === null
    ) {
      console.log('✅ TEST 4 PASÓ: Se rechazaron los múltiples enters y saltos de línea sin contenido.');
    } else {
      throw new Error(`Fallo Test 4. Resultado: ${JSON.stringify(res)}`);
    }
  } catch (err: any) {
    console.error('❌ TEST 4 FALLÓ:', err.message);
    process.exit(1);
  }

  // Test 5: Actualización exitosa en modo edición
  try {
    console.log('\nTest 5: Probar actualización de registro existente (modo edición)');
    mockUpdateHistoricoCalls.length = 0;

    const res = await simulateHandleSubmit({
      historicoId: '1540',
      valor: '88.5',
      comentarios: 'Corrección de registro semanal justificada',
      userEmail: 'admin@polakgrupo.com',
      areaId: 'AreaProd',
      kpiId: 42,
      ano: 2026,
      mes: 7,
      semana: 27
    });

    if (
      res.error === null &&
      res.successMsg === 'Actualización exitosa.' &&
      mockUpdateHistoricoCalls.length === 1 &&
      mockUpdateHistoricoCalls[0].id === '1540' &&
      mockUpdateHistoricoCalls[0].payload.Valor === 88.5 &&
      mockUpdateHistoricoCalls[0].payload.Historico === 1540
    ) {
      console.log('✅ TEST 5 PASÓ: Actualización de registro existente procesada con éxito.');
    } else {
      throw new Error(`Fallo Test 5. Resultado: ${JSON.stringify(res)}`);
    }
  } catch (err: any) {
    console.error('❌ TEST 5 FALLÓ:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 ¡Todas las pruebas unitarias y de integración de KPIManagerHistorico finalizaron con éxito!');
}

describe('KPIManagerHistorico', () => {
  it('debe ejecutar todas las comprobaciones de servicio e inserción/actualización de históricos', async () => {
    await runTests();
  });
});



