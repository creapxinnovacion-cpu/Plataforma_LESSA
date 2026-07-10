import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, Camera, FolderOpen, CheckSquare, History, User, LogOut, Menu, X, Bell 
} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Enlaces de navegación filtrados por rol
  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['colaborador', 'especialista', 'administrador'] },
    { label: 'Captura de Señas', path: '/capture', icon: Camera, roles: ['colaborador', 'administrador'] },
    { label: 'Catálogo', path: '/catalog', icon: FolderOpen, roles: ['colaborador', 'especialista', 'administrador'] },
    { label: 'Validación', path: '/validation', icon: CheckSquare, roles: ['especialista', 'administrador'] },
    { label: 'Mi Historial', path: '/history', icon: History, roles: ['colaborador', 'administrador'] },
    { label: 'Mi Perfil', path: '/profile', icon: User, roles: ['colaborador', 'administrador'] },
  ];

  const allowedLinks = navLinks.filter(link => !user || link.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#080b11] text-[#f3f4f6] flex flex-col md:flex-row relative">
      {/* Botón de Menú Móvil */}
      <div className="md:hidden flex justify-between items-center bg-slate-900/60 border-b border-slate-850/80 px-4 py-3 shrink-0 relative z-50">
        <span className="font-extrabold text-white tracking-wider text-sm">LESSA IA</span>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Barra Lateral (Sidebar) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-950/65 backdrop-blur-xl border-r border-slate-900/90 z-40 transform transition-transform duration-300 md:relative md:transform-none flex flex-col justify-between shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="p-6 border-b border-slate-900/80 hidden md:block">
            <span className="font-black text-white text-lg tracking-wider block">LESSA IA v2.0</span>
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest mt-1">El Salvador</span>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
            {allowedLinks.map((link, idx) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={idx}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold border transition duration-200 ${
                    isActive 
                      ? 'bg-brand-purple/10 border-brand-purple/30 text-brand-purple-light' 
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sección de Usuario e Inicio/Cierre Sesión */}
        <div className="p-4 border-t border-slate-900/80 bg-slate-950/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple-light rounded-lg flex items-center justify-center shrink-0">
              <User size={16} />
            </div>
            <div className="truncate">
              <span className="font-bold text-white text-xs block truncate">{user?.email || 'Invitado'}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">{user?.role || 'Visitante'}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-900 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/40 text-slate-450 hover:text-red-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition duration-200"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenedor de Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="hidden md:flex justify-between items-center bg-slate-950/25 border-b border-slate-900/40 px-8 py-4 h-16 shrink-0">
          <div>
            {/* Opcional: Indicador de conexión */}
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Conexión Estable con API
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white relative bg-slate-900/40 border border-slate-850 rounded-xl">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-purple rounded-full" />
            </button>
          </div>
        </header>

        {/* Zona del Canvas / Vistas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
