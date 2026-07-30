import React from 'react';
import { useStore } from '../store';
import { formatCurrency, getStatusColorText } from '../utils';
import { CheckCircle2, Clock, PlusCircle, TrendingUp, Bell, Trash2, ChevronRight, BarChart3 } from 'lucide-react';

export function HomeScreen() {
  const { 
    ordens, 
    setScreen, 
    userProfile, 
    selectedMonth, 
    selectedYear, 
    lembretes = [], 
    deleteLembrete 
  } = useStore();

  const handleNovoOrcamento = () => {
    if (!userProfile.planoAtivo) {
      alert("Acesso restrito. Assine um plano para adicionar novos orçamentos.");
      return;
    }
    setScreen('NOVA_OS');
  };

  const ordensFiltradas = ordens.filter(os => {
    const [d, m, a] = os.dataOrcamento.split('/');
    return parseInt(m, 10) - 1 === selectedMonth && parseInt(a, 10) === selectedYear;
  });

  const totalRecebido = ordensFiltradas
    .filter(o => o.status === 'PAGO')
    .reduce((acc, curr) => acc + curr.preco, 0);

  const totalPendente = ordensFiltradas
    .filter(o => o.status === 'PENDENTES')
    .reduce((acc, curr) => acc + curr.preco, 0);

  const recentActivities = ordensFiltradas.slice(0, 3);

  // --- COMPROMISSOS DE HOJE ---
  const now = new Date();
  const formatDigit = (n: number) => n.toString().padStart(2, '0');
  const todayStr = `${formatDigit(now.getDate())}/${formatDigit(now.getMonth() + 1)}/${now.getFullYear()}`;
  const lembretesDeHoje = (lembretes || []).filter(l => l.data === todayStr);

  return (
    <div className="flex-1 flex flex-col px-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-300 gap-4 mt-2 min-h-0 overflow-y-auto no-scrollbar">
      
      {/* Resumo Mensal Reduzido (Opção 3) - Abre nova página ao clicar */}
      <div 
        onClick={() => setScreen('RESUMO_DETALHADO')}
        className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 shrink-0 cursor-pointer hover:border-blue-100 hover:shadow-[0_8px_32px_rgba(0,122,255,0.06)] active:scale-[0.99] transition-all duration-200"
      >
        <div className="flex justify-center items-center mb-4 border-b border-gray-100/50 pb-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Resumo Mensal</h2>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5 rounded-[20px] p-4 flex-1 flex flex-col justify-between border border-[#34C759]/10">
            <div className="flex justify-between items-center mb-5">
              <span className="font-semibold text-xs text-[#34C759] uppercase tracking-wider">Recebido</span>
              <CheckCircle2 size={18} className="text-[#34C759]" />
            </div>
            <div className="font-bold text-lg tracking-tight text-[#34C759]">{formatCurrency(totalRecebido)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#FF9500]/10 to-[#FF9500]/5 rounded-[20px] p-4 flex-1 flex flex-col justify-between border border-[#FF9500]/10">
            <div className="flex justify-between items-center mb-5">
              <span className="font-semibold text-xs text-[#FF9500] uppercase tracking-wider">Pendente</span>
              <Clock size={18} className="text-[#FF9500]" />
            </div>
            <div className="font-bold text-lg tracking-tight text-[#FF9500]">{formatCurrency(totalPendente)}</div>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-gray-100/50 flex justify-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-gray-700 hover:text-gray-900 uppercase tracking-wider bg-gray-50 hover:bg-gray-100 border border-gray-200/40 px-5 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <span>Análise Detalhada</span>
            <ChevronRight size={11} strokeWidth={3} className="text-gray-500" />
          </div>
        </div>
      </div>

      <button 
        onClick={handleNovoOrcamento}
        className="w-full bg-[#007AFF] hover:opacity-90 active:opacity-70 transition-all text-white rounded-[20px] py-4 flex items-center justify-center gap-2 font-semibold text-[17px] shrink-0 shadow-[0_8px_20px_rgba(0,122,255,0.25)]"
      >
        <PlusCircle size={22} strokeWidth={2.5} />
        NOVO ORÇAMENTO
      </button>

      {/* Compromissos de Hoje */}
      {lembretesDeHoje.length > 0 && (
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col shrink-0">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                <Bell size={14} className="text-[#007AFF] animate-bounce" />
              </div>
              <span className="font-semibold text-gray-900 text-[14px]">Compromissos de Hoje</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 uppercase">
              {lembretesDeHoje.length} {lembretesDeHoje.length === 1 ? 'VISITA' : 'VISITAS'}
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar">
            {lembretesDeHoje.map(lembrete => {
              const handleWhatsAppDirect = () => {
                const text = `Olá! Passando para confirmar nossa visita agendada: ${lembrete.descricao} hoje às ${lembrete.horario}.`;
                const cleanPhone = (lembrete.celular || '').replace(/\D/g, '');
                const phoneWithCountry = cleanPhone.length === 11 || cleanPhone.length === 10 ? `55${cleanPhone}` : cleanPhone;
                window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`, '_blank');
              };

              return (
                <div key={lembrete.id} className="flex items-center gap-3 bg-gray-50/55 p-3 rounded-xl border border-gray-100/70">
                  <div className="bg-purple-100/50 text-purple-700 font-bold text-[11px] rounded-lg px-2 py-1 shrink-0">
                    {lembrete.horario}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{lembrete.descricao}</p>
                    {lembrete.celular && (
                      <p className="text-[10px] text-gray-400 font-medium truncate">{lembrete.celular}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {lembrete.celular && (
                      <button
                        onClick={handleWhatsAppDirect}
                        className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 1.97 14.101.945 11.48.945 6.046.945 1.624 5.315 1.62 10.744c-.001 1.758.463 3.473 1.341 5.01L1.93 22.164l6.513-1.706c1.514.826 3.064 1.26 4.636 1.26z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => deleteLembrete(lembrete.id)}
                      className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Atividades Recentes */}
      <div className="flex-1 bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-0">
        <div className="flex justify-center items-center mb-4 border-b border-gray-100/50 pb-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Atividades Recentes</h2>
        </div>
        
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar">
          {recentActivities.map((os) => (
            <div key={os.id} className="text-sm bg-gray-50/50 p-4 rounded-[16px] border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[15px] text-gray-900 mb-1">{os.servico || `Ordem de Serviço ${os.numero}`}</div>
                <div className="text-gray-500 font-medium">{formatCurrency(os.preco)}</div>
              </div>
              <div className={`font-semibold text-xs px-3 py-1 rounded-full ${getStatusColorText(os.status).replace('text-', 'bg-').replace(']', ']/10')} ${getStatusColorText(os.status)}`}>
                {os.status === 'AGUARDANDO INICIO' ? 'AGENDADO' : os.status}
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
             <div className="text-gray-400 font-medium text-center py-4">Nenhuma atividade.</div>
          )}
        </div>
      </div>
    </div>
  );
}
