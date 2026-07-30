import { useState } from 'react';
import {
  ClipboardList,
  Wallet,
  Package,
  FileText,
  Settings,
  LogOut,
  Building2,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { ModuleType } from '../types';
import { useStore } from '../store';
import { useCompany } from '../context/CompanyContext';
import { VendasApp } from './VendasApp';
import { EmBreveScreen } from '../screens/EmBreve';

const MODULES: { id: ModuleType; label: string; icon: typeof ClipboardList; available: boolean }[] = [
  { id: 'VENDAS', label: 'Vendas / Orçamentos', icon: ClipboardList, available: true },
  { id: 'FINANCEIRO', label: 'Financeiro', icon: Wallet, available: false },
  { id: 'ESTOQUE', label: 'Estoque', icon: Package, available: false },
  { id: 'NOTAS_FISCAIS', label: 'Notas Fiscais', icon: FileText, available: false },
];

export function DashboardLayout() {
  const [module, setModule] = useState<ModuleType>('VENDAS');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setScreen, logout } = useStore();
  const { activeCompany, memberships, switchCompany } = useCompany();
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);

  const goTo = (id: ModuleType) => {
    setModule(id);
    setMobileMenuOpen(false);
  };

  const goConfiguracoes = () => {
    setModule('VENDAS');
    setScreen('AJUSTES');
    setMobileMenuOpen(false);
  };

  const activeModuleMeta = MODULES.find(m => m.id === module);

  return (
    <div className="h-[100dvh] w-full flex bg-[#EDEDF2] overflow-hidden">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:w-64 shrink-0 h-full bg-white border-r border-gray-100 flex-col">
        <SidebarContent
          activeCompanyName={activeCompany?.nomeEmpresa}
          module={module}
          onSelect={goTo}
          onConfiguracoes={goConfiguracoes}
          onLogout={logout}
          memberships={memberships}
          activeCompanyId={activeCompany?.id}
          onSwitchCompany={switchCompany}
          companySwitcherOpen={companySwitcherOpen}
          setCompanySwitcherOpen={setCompanySwitcherOpen}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600"
        >
          <Menu size={18} />
        </button>
        <span className="font-semibold text-gray-900 text-[15px]">{activeModuleMeta?.label}</span>
        <div className="w-9 h-9" />
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 h-full bg-white flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent
              activeCompanyName={activeCompany?.nomeEmpresa}
              module={module}
              onSelect={goTo}
              onConfiguracoes={goConfiguracoes}
              onLogout={logout}
              memberships={memberships}
              activeCompanyId={activeCompany?.id}
              onSwitchCompany={switchCompany}
              companySwitcherOpen={companySwitcherOpen}
              setCompanySwitcherOpen={setCompanySwitcherOpen}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 h-full overflow-y-auto pt-[64px] md:pt-0 flex items-stretch md:items-center justify-center p-0 md:p-8">
        {module === 'VENDAS' ? (
          <VendasApp />
        ) : (
          <EmBreveScreen
            icon={activeModuleMeta!.icon}
            title={activeModuleMeta!.label}
            description="Este módulo está em desenvolvimento e será liberado em uma próxima etapa."
          />
        )}
      </main>
    </div>
  );
}

interface SidebarContentProps {
  activeCompanyName?: string;
  module: ModuleType;
  onSelect: (id: ModuleType) => void;
  onConfiguracoes: () => void;
  onLogout: () => void;
  memberships: { role: string; company: { id: string; nomeEmpresa: string } }[];
  activeCompanyId?: string;
  onSwitchCompany: (id: string) => void;
  companySwitcherOpen: boolean;
  setCompanySwitcherOpen: (open: boolean) => void;
}

function SidebarContent({
  activeCompanyName,
  module,
  onSelect,
  onConfiguracoes,
  onLogout,
  memberships,
  activeCompanyId,
  onSwitchCompany,
  companySwitcherOpen,
  setCompanySwitcherOpen,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="relative mb-6">
        <button
          onClick={() => setCompanySwitcherOpen(!companySwitcherOpen)}
          className="w-full flex items-center gap-2.5 px-3 py-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-[#007AFF]" />
          </div>
          <span className="flex-1 min-w-0 font-semibold text-gray-900 text-[13px] truncate">
            {activeCompanyName || 'Minha Empresa'}
          </span>
          {memberships.length > 1 && <ChevronDown size={14} className="text-gray-400 shrink-0" />}
        </button>

        {companySwitcherOpen && memberships.length > 1 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-10">
            {memberships.map(m => (
              <button
                key={m.company.id}
                onClick={() => {
                  onSwitchCompany(m.company.id);
                  setCompanySwitcherOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-[13px] font-medium hover:bg-gray-50 transition-colors ${
                  m.company.id === activeCompanyId ? 'text-[#007AFF] bg-blue-50/60' : 'text-gray-700'
                }`}
              >
                {m.company.nomeEmpresa}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {MODULES.map(item => {
          const Icon = item.icon;
          const active = module === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] font-semibold transition-all text-left ${
                active ? 'bg-[#007AFF] text-white shadow-[0_8px_20px_rgba(0,122,255,0.2)]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
              {!item.available && (
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  Em breve
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 pt-3 border-t border-gray-100">
        <button
          onClick={onConfiguracoes}
          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] font-semibold text-gray-500 hover:bg-gray-50 transition-all"
        >
          <Settings size={18} />
          Configurações
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}
