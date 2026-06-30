import { Home, List, Calendar as CalendarIcon, Settings, User } from 'lucide-react';
import { useStore } from '../store';

export function Header() {
  const { userProfile } = useStore();
  const displayName = userProfile.nomeEmpresa ? userProfile.nomeEmpresa : 'Usuario';

  return (
    <header className="flex justify-between items-center pt-6 pb-4 px-6 shrink-0 bg-[#F2F2F7]/40 backdrop-blur-md">
      <div className="flex items-center gap-2 bg-white/60 border border-white/80 px-3 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <CalendarIcon size={14} className="text-[#3A86E9]" />
        <span className="text-[13px] font-medium text-gray-700 capitalize">
          {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', weekday: 'short' }).format(new Date()).replace('.', '')}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="text-right">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Olá, bem-vindo</div>
          <div className="text-gray-900 font-semibold text-[14px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px] leading-tight">
            {displayName}
          </div>
        </div>
        <div className="w-9 h-9 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] rounded-full flex items-center justify-center text-gray-400 shrink-0 border border-gray-100 overflow-hidden active:scale-95 transition-transform duration-200">
          {userProfile.logo ? (
            <img src={userProfile.logo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <User size={18} />
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { currentScreen, setScreen } = useStore();

  const navItems = [
    { id: 'HOME' as const, label: 'Início', icon: Home },
    { id: 'HISTORICO' as const, label: 'Histórico', icon: List },
    { id: 'CALENDARIO' as const, label: 'Calendário', icon: CalendarIcon },
    { id: 'AJUSTES' as const, label: 'Ajustes', icon: Settings },
  ];

  const getIsActive = (id: string) => {
    if (id === 'HOME' && currentScreen === 'NOVA_OS') return true;
    if (id === 'HISTORICO' && ['LISTA_OS', 'DETALHES_OS'].includes(currentScreen)) return true;
    return currentScreen === id;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 flex justify-around items-center pt-3 pb-6 px-4 absolute bottom-0 w-full z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      {navItems.map(item => {
        const active = getIsActive(item.id);
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`flex flex-col items-center gap-1 min-w-[64px] relative py-1 transition-all duration-300 scale-100 active:scale-90 ${
              active ? 'text-[#007AFF]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={23} strokeWidth={active ? 2.5 : 2} className="transition-transform duration-300" />
            <span className={`text-[10px] font-bold tracking-tight transition-all duration-300 ${active ? 'opacity-100' : 'opacity-85'}`}>
              {item.label}
            </span>
            {active && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#007AFF] animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
