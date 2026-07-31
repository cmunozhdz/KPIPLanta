import React, { useState } from 'react';
import { LineaEmpaqueData } from './types/linea-empaque.types';

export interface PackagingLinesManagerProps {
  initialLines?: LineaEmpaqueData[];
  onAddLine?: (line: LineaEmpaqueData) => void;
  onUpdateLine?: (line: LineaEmpaqueData) => void;
  onDeleteLine?: (id: string) => void;
}

const DEFAULT_LINEAS: LineaEmpaqueData[] = [
  { id: '1', codigo: 'LE-001', nombre: 'Línea de Empaque Alta Velocidad A', estado: 'Activo' },
  { id: '2', codigo: 'LE-002', nombre: 'Línea Semiautomática de Ensacado B', estado: 'Activo' },
  { id: '3', codigo: 'LE-003', nombre: 'Línea de Paletizado Robotizado 1', estado: 'Activo' },
  { id: '4', codigo: 'LE-004', nombre: 'Línea de Empaque Secundario C', estado: 'Inactivo' },
  { id: '5', codigo: 'LE-005', nombre: 'Línea Granelera y Envasado D', estado: 'Activo' },
];

export const PackagingLinesManager: React.FC<PackagingLinesManagerProps> = ({
  initialLines = DEFAULT_LINEAS,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
}) => {
  const [lines, setLines] = useState<LineaEmpaqueData[]>(initialLines);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLine, setEditingLine] = useState<LineaEmpaqueData | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<LineaEmpaqueData, 'id'>>({
    codigo: '',
    nombre: '',
    estado: 'Activo',
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleOpenAddModal = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setEditingLine(null);
    setFormData({ codigo: '', nombre: '', estado: 'Activo' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (line: LineaEmpaqueData, e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setEditingLine(line);
    setFormData({ codigo: line.codigo, nombre: line.nombre, estado: line.estado });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (window.confirm('¿Está seguro de que desea eliminar esta línea de empaque?')) {
      const updated = lines.filter((l) => l.id !== id);
      setLines(updated);
      if (onDeleteLine) {
        onDeleteLine(id);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!formData.codigo.trim() || !formData.nombre.trim()) return;

    if (editingLine) {
      const updatedLine: LineaEmpaqueData = {
        ...editingLine,
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        estado: formData.estado as 'Activo' | 'Inactivo',
      };
      const updated = lines.map((l) => (l.id === editingLine.id ? updatedLine : l));
      setLines(updated);
      if (onUpdateLine) onUpdateLine(updatedLine);
    } else {
      const newLine: LineaEmpaqueData = {
        id: Date.now().toString(),
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        estado: formData.estado as 'Activo' | 'Inactivo',
      };
      const updated = [...lines, newLine];
      setLines(updated);
      if (onAddLine) onAddLine(newLine);
    }

    setIsModalOpen(false);
  };

  const filteredLines = lines.filter(
    (line) =>
      line.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* 2. Encabezado del Manager (Navbar Interno) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
            Líneas de Empaque
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión, administración y monitoreo de las líneas de empaque y embalaje en planta.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
        >
          <span>Agregar Línea</span>
          <i className="bi bi-plus-lg"></i>
        </button>
      </div>

      {/* 3. Barra de Filtro y Búsqueda Rápida */}
      <div className="flex items-center justify-between gap-4 mt-6">
        <div className="relative w-full max-w-md">
          <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar líneas de empaque..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] shadow-sm"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 hidden sm:block">
          Total: <span className="text-slate-900 font-bold">{filteredLines.length}</span> registros
        </div>
      </div>

      {/* 4. Tabla de Datos & Botones de Acción */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Modificar</th>
                <th className="py-3.5 px-4 text-center w-16">Eliminar</th>
                <th className="py-3.5 px-6">Código</th>
                <th className="py-3.5 px-6">Nombre de Línea</th>
                <th className="py-3.5 px-6">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLines.length > 0 ? (
                filteredLines.map((linea) => (
                  <tr key={linea.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors py-4 px-6 text-sm text-slate-700">
                    {/* Botón Modificar en primera columna */}
                    <td className="py-4 px-4 text-center">
                      <button
                        title="Modificar"
                        onClick={(e) => handleOpenEditModal(linea, e)}
                        className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <i className="bi bi-pencil-square text-base"></i>
                      </button>
                    </td>
                    {/* Botón Eliminar en segunda columna */}
                    <td className="py-4 px-4 text-center">
                      <button
                        title="Eliminar"
                        onClick={(e) => handleDelete(linea.id, e)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <i className="bi bi-trash text-base"></i>
                      </button>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {linea.codigo}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {linea.nombre}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={
                          linea.estado === 'Activo'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold uppercase inline-flex items-center gap-1.5'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold uppercase inline-flex items-center gap-1.5'
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            linea.estado === 'Activo' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        ></span>
                        {linea.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    No se encontraron líneas de empaque que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario Agregar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                {editingLine ? 'Modificar Línea de Empaque' : 'Agregar Nueva Línea de Empaque'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <i className="bi bi-x-lg text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Código de Línea
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. LE-006"
                  value={formData.codigo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, codigo: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nombre de la Línea
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Línea de Empaque Automática 3"
                  value={formData.nombre}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData({ ...formData, estado: e.target.value as 'Activo' | 'Inactivo' })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
                >
                  {editingLine ? 'Guardar Cambios' : 'Crear Línea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
