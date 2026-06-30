import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppState, OrdemServico, ScreenType, StatusOS, UserProfile, Lembrete } from './types';

interface StoreContextType extends AppState {
  setScreen: (screen: ScreenType, params?: { osId?: string; statusFilter?: StatusOS }) => void;
  addOS: (os: Omit<OrdemServico, 'id'>) => void;
  updateOSStatus: (id: string, newStatus: StatusOS) => void;
  updateUserProfile: (profileInfo: Partial<UserProfile>) => void;
  deleteOS: (id: string) => void;
  setGlobalDate: (month: number, year: number) => void;
  addLembrete: (lembrete: Omit<Lembrete, 'id'>) => void;
  deleteLembrete: (id: string) => void;
  markLembreteAsNotified: (id: string) => void;
}

const initialOrdens: OrdemServico[] = [
  {
    id: 'Nº08',
    cliente: 'Empresa X',
    servico: 'Instalação Ar Condicionado',
    preco: 450,
    formaPagamento: 'PIX',
    contato: '(11) 99999-9999',
    dataOrcamento: '14/06/2026',
    status: 'PAGO'
  },
  {
    id: 'Nº07',
    cliente: 'Residência Y',
    servico: 'Limpeza Máquina De Lavar',
    preco: 450,
    formaPagamento: 'Dinheiro',
    contato: '(11) 98888-8888',
    dataOrcamento: '14/06/2026',
    status: 'AGUARDANDO INICIO'
  },
  {
    id: 'Nº04',
    cliente: 'Açougue Z',
    servico: 'Manutenção Camera Fria',
    preco: 450,
    formaPagamento: 'Boleto',
    contato: '(11) 97777-7777',
    dataOrcamento: '14/06/2026',
    status: 'PENDENTES'
  },
  {
    id: 'Nº03',
    cliente: 'Tainá Bento',
    servico: 'Retirar Ar condicionado em um escritório e Instalar em sua residência.',
    preco: 500,
    formaPagamento: 'Cartão de Credito',
    contato: '(16) 99319-2202',
    dataOrcamento: '14/06/2026',
    status: 'AGUARDANDO INICIO'
  }
];

const initialProfile: UserProfile = {
  nomeEmpresa: '',
  telefone: '',
  dataCriacao: '',
  cnpj: '',
  email: '',
  chavePix: ''
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const defaultMonth = new Date().getMonth();
    const defaultYear = new Date().getFullYear();
    const savedState = localStorage.getItem('osManagerData');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return {
          ...parsed,
          currentScreen: 'HOME', // always start at home when app loads
          selectedOSId: null,
          selectedStatusFilter: null,
          selectedMonth: defaultMonth,
          selectedYear: defaultYear,
          lembretes: parsed.lembretes || []
        };
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return {
      ordens: initialOrdens,
      currentScreen: 'HOME',
      selectedOSId: null,
      selectedStatusFilter: null,
      userProfile: initialProfile,
      selectedMonth: defaultMonth,
      selectedYear: defaultYear,
      lembretes: []
    };
  });

  useEffect(() => {
    localStorage.setItem('osManagerData', JSON.stringify({
      ordens: state.ordens,
      userProfile: state.userProfile,
      lembretes: state.lembretes || []
    }));
  }, [state.ordens, state.userProfile, state.lembretes]);

  const setScreen = (screen: ScreenType, params?: { osId?: string; statusFilter?: StatusOS }) => {
    setState(prev => ({
      ...prev,
      currentScreen: screen,
      selectedOSId: params?.osId || null,
      selectedStatusFilter: params?.statusFilter || null,
    }));
    window.scrollTo(0, 0);
  };

  const addOS = (osData: Omit<OrdemServico, 'id'>) => {
    setState(prev => {
      const [diaStr, mesStr, anoStr] = osData.dataOrcamento.split('/');
      const month = parseInt(mesStr, 10) - 1;
      const year = parseInt(anoStr, 10);
      
      const ordensDoMes = prev.ordens.filter(os => {
        const [d, m, a] = os.dataOrcamento.split('/');
        return parseInt(m, 10) - 1 === month && parseInt(a, 10) === year;
      });

      const maxNum = ordensDoMes.reduce((max, os) => {
        const numMatch = os.id.match(/\d+/);
        const num = numMatch ? parseInt(numMatch[0], 10) : 0;
        return num > max ? num : max;
      }, 0);

      const newIdNum = maxNum + 1;
      const newId = `Nº${newIdNum.toString().padStart(2, '0')}`;
      const newOS: OrdemServico = { ...osData, id: newId };
      return {
        ...prev,
        ordens: [newOS, ...prev.ordens]
      };
    });
  };

  const updateOSStatus = (id: string, newStatus: StatusOS) => {
    setState(prev => ({
      ...prev,
      ordens: prev.ordens.map(os => os.id === id ? { ...os, status: newStatus } : os)
    }));
  };

  const updateUserProfile = (profileInfo: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...profileInfo }
    }));
  };

  const deleteOS = (id: string) => {
    setState(prev => ({
      ...prev,
      ordens: prev.ordens.filter(os => os.id !== id)
    }));
  };

  const setGlobalDate = (month: number, year: number) => {
    setState(prev => ({
      ...prev,
      selectedMonth: month,
      selectedYear: year
    }));
  };

  const addLembrete = (lembreteData: Omit<Lembrete, 'id'>) => {
    setState(prev => {
      const newLembrete: Lembrete = {
        ...lembreteData,
        id: Math.random().toString(36).substring(2, 9),
        notificado: false
      };
      return {
        ...prev,
        lembretes: [...prev.lembretes, newLembrete]
      };
    });
  };

  const deleteLembrete = (id: string) => {
    setState(prev => ({
      ...prev,
      lembretes: prev.lembretes.filter(l => l.id !== id)
    }));
  };

  const markLembreteAsNotified = (id: string) => {
    setState(prev => ({
      ...prev,
      lembretes: prev.lembretes.map(l => l.id === id ? { ...l, notificado: true } : l)
    }));
  };

  const [activeAlert, setActiveAlert] = useState<Lembrete | null>(null);

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

      state.lembretes.forEach(lembrete => {
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
  }, [state.lembretes]);

  return (
    <StoreContext.Provider value={{ 
      ...state, 
      setScreen, 
      addOS, 
      updateOSStatus, 
      updateUserProfile, 
      deleteOS, 
      setGlobalDate,
      addLembrete,
      deleteLembrete,
      markLembreteAsNotified
    }}>
      {children}
      {activeAlert && (
        <ReminderAlertModal alert={activeAlert} onClose={() => setActiveAlert(null)} />
      )}
    </StoreContext.Provider>
  );
}

export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play first note (chime)
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
    
    // Play second note slightly offset
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
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
