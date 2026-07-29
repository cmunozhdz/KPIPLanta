import React, { useEffect, useState } from 'react';
import { Database, Shield, Settings, Eye, CheckCircle, Leaf, Factory, Package, Users, Zap, Target, Info, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { authService } from '../services/authService';
import { Area, UserRole } from '../types';


interface NavbarProps {
  areas: Area[];
  view: string;
  setView: (view: string) => void;
  userEmail: string;
  onRolesResolved: (role: UserRole) => void;
  filters?: { year: string; month: string; week: string };
}

interface Profile {
  id: string;
  label: string;
  roleValue: UserRole;
  icon: React.ReactNode;
}

const PROFILES: Profile[] = [
  { id: 'EOAdmin', label: 'Admin', roleValue: 'admin', icon: <Shield size={14} /> },
  { id: 'EOOperativo', label: 'Op', roleValue: 'operator', icon: <Settings size={14} /> },
  { id: 'EOVisor', label: 'Visor', roleValue: 'viewer', icon: <Eye size={14} /> }
];

const IconWrapper = ({ name, size = 20, className }: { name: string, size?: number, className?: string }) => {
  const icons: Record<string, any> = {
    Shield, CheckCircle, Leaf, Factory, Settings, Package, Users, Zap, Target, Info
  };
  const Icon = icons[name] || Info;
  return <Icon size={size} className={cn("text-slate-700", className)} />;
};

export const Navbar: React.FC<NavbarProps> = ({ areas, view, setView, userEmail, onRolesResolved, filters }) => {
  const [grantedProfiles, setGrantedProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkPermissions = async () => {
      setIsLoading(true);
      const results: Profile[] = [];

      try {
        const promises = PROFILES.map(async (profile) => {
          try {
            const data = await authService.checkPermission(profile.id, userEmail);
            if (data.PermisoExiste) {
              results.push(profile);
            }
          } catch (error) {
            console.error(`Error verificando permiso ${profile.id}:`, error);
          }
        });

        await Promise.all(promises);

        if (isMounted) {
          // Ordenamos los perfiles otorgados basándonos en el orden de PROFILES
          const sortedResults = PROFILES.filter(p => results.some(r => r.id === p.id));
          setGrantedProfiles(sortedResults);

          if (sortedResults.length > 0) {
            setActiveProfileId(sortedResults[0].id);
            onRolesResolved(sortedResults[0].roleValue);
          } else {
            setActiveProfileId(null);
            onRolesResolved('viewer');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (userEmail) {
      checkPermissions();
    }

    return () => {
      isMounted = false;
    };
  }, [userEmail, onRolesResolved]);

  const isAdmin = grantedProfiles.find(p => p.id === activeProfileId)?.roleValue === 'admin';

  return (
    <div className="relative mb-8 group flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
      <nav className="flex overflow-x-auto gap-2 no-scrollbar pb-2 mask-linear max-w-full flex-1">
        <button
          onClick={() => setView('overview')}
          className={cn(
            "flex-shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
            view === 'overview'
              ? 'bg-slate-800 text-white border-slate-800 shadow-md translate-y-[-2px]'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
          )}
        >
          Panorama Global
        </button>
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() => setView(area.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
              view === area.id
                ? 'bg-slate-800 text-white border-slate-800 shadow-md translate-y-[-2px]'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            )}
          >
            <i className={cn(area.icon || "fas fa-industry", view === area.id ? "text-white" : "text-slate-500", "text-[16px]")}></i>
            {area.name}
          </button>
        ))}
        {isAdmin && (
          <button
            onClick={() => setView('master')}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
              view === 'master'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md translate-y-[-2px]'
                : 'bg-white text-blue-500 border-blue-200 hover:border-blue-300'
            )}
          >
            <Database size={16} />
            Datos Maestros
          </button>
        )}
        <button
          onClick={() => setView('calendar')}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
            view === 'calendar'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md translate-y-[-2px]'
              : 'bg-white text-emerald-600 border-emerald-200 hover:border-emerald-300'
          )}
        >
          <Calendar size={16} />
          Calendario
        </button>

      </nav>

      {/* Indicadores de Perfiles Activos */}
      <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex-shrink-0 mb-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Perfil Activo:</span>
        {isLoading ? (
          <span className="text-[10px] font-bold text-slate-400 animate-pulse">Consultando...</span>
        ) : grantedProfiles.length > 0 ? (
          <select
            className="text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
            value={activeProfileId || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              setActiveProfileId(selectedId);
              const selectedProfile = grantedProfiles.find(p => p.id === selectedId);
              if (selectedProfile) {
                onRolesResolved(selectedProfile.roleValue);
              }
            }}
          >
            {grantedProfiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sin acceso</span>
        )}
      </div>
    </div>
  );
};
