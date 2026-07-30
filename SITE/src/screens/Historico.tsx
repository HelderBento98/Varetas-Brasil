import { useStore } from '../store';
import { formatCurrency, getStatusColorText } from '../utils';

export function HistoricoScreen() {
  const { ordens, setScreen, selectedMonth, selectedYear } = useStore();

  const ordensFiltradas = ordens.filter(os => {
    const [d, m, a] = os.dataOrcamento.split('/');
    return parseInt(m, 10) - 1 === selectedMonth && parseInt(a, 10) === selectedYear;
  });

  const countAguardando = ordensFiltradas.filter(o => o.status === 'AGUARDANDO INICIO').length;
  const countRealizado = ordensFiltradas.filter(o => o.status === 'PAGO').length;
  const countPendente = ordensFiltradas.filter(o => o.status === 'PENDENTES').length;

  const recentActivities = ordensFiltradas.slice(0, 2); // Show a couple recent in this view

  return (
    <div className="flex-1 flex flex-col px-6 pb-6 animate-in fade-in zoom-in-95 duration-300 gap-4 mt-2 min-h-0">
      
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-0">
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

      <div className="flex-1 flex flex-col gap-4 justify-between">
        {/* AGUARDANDO INICIO */}
        <button 
          onClick={() => setScreen('LISTA_OS', { statusFilter: 'AGUARDANDO INICIO' })}
          className="flex-1 bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between hover:opacity-90 active:opacity-70 transition-all duration-200"
        >
          <div className="text-left font-bold w-2/3">
            <div className="text-[11px] text-gray-500 uppercase font-semibold tracking-wide mb-1">SERVIÇOS</div>
            <div className="text-[#007AFF] text-[17px] leading-tight font-bold">AGENDADOS</div>
          </div>
          <div className="border-l border-gray-100 pl-6 text-[#007AFF] text-5xl font-light tracking-tight">
            {countAguardando}
          </div>
        </button>

        {/* PAGOS */}
        <button 
          onClick={() => setScreen('LISTA_OS', { statusFilter: 'PAGO' })}
           className="flex-1 bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between hover:opacity-90 active:opacity-70 transition-opacity duration-200"
        >
           <div className="text-left font-bold w-2/3">
            <div className="text-[11px] text-gray-500 uppercase font-semibold tracking-wide mb-1">SERVIÇOS</div>
            <div className="text-[#34C759] text-[17px] leading-tight font-bold">PAGOS</div>
          </div>
          <div className="border-l border-gray-100 pl-6 text-[#34C759] text-5xl font-light tracking-tight">
            {countRealizado}
          </div>
        </button>

        {/* PENDENTES */}
        <button 
          onClick={() => setScreen('LISTA_OS', { statusFilter: 'PENDENTES' })}
           className="flex-1 bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between hover:opacity-90 active:opacity-70 transition-opacity duration-200"
        >
          <div className="text-left font-bold w-2/3">
            <div className="text-[11px] text-gray-500 uppercase font-semibold tracking-wide mb-1">SERVIÇOS</div>
            <div className="text-[#FF9500] text-[17px] leading-tight font-bold">PENDENTES</div>
          </div>
          <div className="border-l border-gray-100 pl-6 text-[#FF9500] text-5xl font-light tracking-tight">
            {countPendente}
          </div>
        </button>
      </div>

    </div>
  );
}
