import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ScreenType, StatusOS, OrdemServico, Lembrete, CompanyMember } from './types';
import { useAuth } from './context/AuthContext';
import { useCompany } from './context/CompanyContext';
import { useOrders } from './hooks/useOrders';
import { useReminders } from './hooks/useReminders';
import { Company } from './types';

interface StoreContextType {
  ordens: OrdemServico[];
  currentScreen: ScreenType;
  selectedOSId: string | null;
  selectedStatusFilter: StatusOS | null;
  userProfile: Company;
  selectedMonth: number;
  selectedYear: number;
  lembretes: Lembrete[];
  members: CompanyMember[];
  role: 'owner' | 'member' | null;
  setScreen: (screen: ScreenType, params?: { osId?: string; statusFilter?: StatusOS }) => void;
  addOS: (os: Omit<OrdemServico, 'id' | 'numero'>) => void;
  updateOSStatus: (id: string, newStatus: StatusOS) => void;
  updateUserProfile: (profileInfo: Partial<Company>) => void;
  deleteOS: (id: string) => void;
  setGlobalDate: (month: number, year: number) => void;
  addLembrete: (lembrete: Omit<Lembrete, 'id'>) => void;
  deleteLembrete: (id: string) => void;
  markLembreteAsNotified: (id: string) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const { activeCompany, role, members, updateCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const { ordens, addOS: addOrder, updateOSStatus, deleteOS } = useOrders(companyId);
  const { lembretes, addLembrete, deleteLembrete, markLembreteAsNotified } = useReminders(companyId);

  const defaultMonth = new Date().getMonth();
  const defaultYear = new Date().getFullYear();

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusOS | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [activeAlert, setActiveAlert] = useState<Lembrete | null>(null);

  const setScreen = (screen: ScreenType, params?: { osId?: string; statusFilter?: StatusOS }) => {
    setCurrentScreen(screen);
    setSelectedOSId(params?.osId || null);
    setSelectedStatusFilter(params?.statusFilter || null);
    window.scrollTo(0, 0);
  };

  const setGlobalDate = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const addOS = (osData: Omit<OrdemServico, 'id' | 'numero'>) => {
    addOrder(osData);
  };

  const updateUserProfile = (profileInfo: Partial<Company>) => {
    updateCompany(profileInfo);
  };

  const logout = () => {
    signOut();
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkLembretes = () => {
      const now = new Date();
      const formatDigit = (n: number) => n.toString().padStart(2, '0');
      const todayStr = `${formatDigit(now.getDate())}/${formatDigit(now.getMonth() + 1)}/${now.getFullYear()}`;
      const timeStr = `${formatDigit(now.getHours())}:${formatDigit(now.getMinutes())}`;

      lembretes.forEach(lembrete => {
        if (lembrete.data === todayStr && lembrete.horario === timeStr && !lembrete.notificado) {
          playNotificationChime();

          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('Compromisso Agendado', {
                body: `${lembrete.descricao} às ${lembrete.horario}`,
              });
            } catch (err) {
              console.error('Web notification failed', err);
            }
          }

          setActiveAlert(lembrete);
          markLembreteAsNotified(lembrete.id);
        }
      });
    };

    checkLembretes();
    const interval = setInterval(checkLembretes, 5000);
    return () => clearInterval(interval);
  }, [lembretes, markLembreteAsNotified]);

  if (!activeCompany) {
    return <>{children}</>;
  }

  return (
    <StoreContext.Provider
      value={{
        ordens,
        currentScreen,
        selectedOSId,
        selectedStatusFilter,
        userProfile: activeCompany,
        selectedMonth,
        selectedYear,
        lembretes,
        members,
        role,
        setScreen,
        addOS,
        updateOSStatus,
        updateUserProfile,
        deleteOS,
        setGlobalDate,
        addLembrete,
        deleteLembrete,
        markLembreteAsNotified,
        logout,
      }}
    >
      {children}
      {activeAlert && <ReminderAlertModal alert={activeAlert} onClose={() => setActiveAlert(null)} />}
    </StoreContext.Provider>
  );
}

export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      gain2.gain.setValueAtTime(0.2, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.5);
    }, 150);
  } catch (error) {
    console.error('Audio failed to play', error);
  }
}

function ReminderAlertModal({ alert, onClose }: { alert: Lembrete; onClose: () => void }) {
  const handleWhatsApp = () => {
    const text = `Olá! Passando para lembrar do nosso compromisso agendado: ${alert.descricao} hoje às ${alert.horario}.`;
    const phone = alert.celular || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 11 || cleanPhone.length === 10 ? `55${cleanPhone}` : cleanPhone;
    const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-30" />
          <svg className="w-8 h-8 text-blue-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        <h3 className="font-bold text-gray-900 text-lg tracking-tight mb-2">Compromisso Agora!</h3>
        <p className="text-gray-700 font-medium text-base mb-1">{alert.descricao}</p>
        <p className="text-gray-400 text-sm font-semibold mb-6">Agendado para hoje às {alert.horario}</p>

        <div className="flex flex-col gap-2 w-full">
          {alert.celular && (
            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:opacity-90 active:opacity-70 text-white font-semibold py-3 px-4 rounded-[18px] text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,211,102,0.2)] transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 1.97 14.101.945 11.48.945 6.046.945 1.624 5.315 1.62 10.744c-.001 1.758.463 3.473 1.341 5.01L1.93 22.164l6.513-1.706c1.514.826 3.064 1.26 4.636 1.26z" />
              </svg>
              Notificar via WhatsApp
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-[18px] text-[15px] transition-all"
          >
            Fechar Lembrete
          </button>
        </div>
      </div>
    </div>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
