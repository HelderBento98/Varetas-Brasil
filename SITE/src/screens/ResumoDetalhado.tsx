import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Coins, 
  CreditCard, 
  Percent, 
  BarChart3,
  Award
} from 'lucide-react';

export function ResumoDetalhadoScreen() {
  const { 
    ordens, 
    setScreen, 
    selectedMonth, 
    selectedYear 
  } = useStore();

  const ordensFiltradas = ordens.filter(os => {
    const [d, m, a] = os.dataOrcamento.split('/');
    return parseInt(m, 10) - 1 === selectedMonth && parseInt(a, 10) === selectedYear;
  });

  // --- CONTAS PRINCIPAIS ---
  const ordensPagas = ordensFiltradas.filter(o => o.status === 'PAGO');
  const ordensPendentes = ordensFiltradas.filter(o => o.status === 'PENDENTES');
  const ordensAgendadas = ordensFiltradas.filter(o => o.status === 'AGUARDANDO INICIO');

  const totalRecebido = ordensPagas.reduce((acc, curr) => acc + curr.preco, 0);
  const totalPendente = ordensPendentes.reduce((acc, curr) => acc + curr.preco, 0);
  const totalAgendado = ordensAgendadas.reduce((acc, curr) => acc + curr.preco, 0);
  const totalGeral = totalRecebido + totalPendente;

  // --- OPÇÃO 2: TICKET MÉDIO & INDICADORES DE CONVERSÃO ---
  const ticketMedio = ordensPagas.length > 0 ? totalRecebido / ordensPagas.length : 0;
  
  // Taxa de Conversão: Ordens pagas sobre o total de ordens finalizadas/decididas (pagas + pendentes)
  const totalDecididas = ordensPagas.length + ordensPendentes.length;
  const taxaConversao = totalDecididas > 0 ? (ordensPagas.length / totalDecididas) * 100 : 0;

  // --- GRÁFICO DE INTERVALOS DO MÊS ---
  const intervals = [
    { label: '01-05', start: 1, end: 5 },
    { label: '06-10', start: 6, end: 10 },
    { label: '11-15', start: 11, end: 15 },
    { label: '16-20', start: 16, end: 20 },
    { label: '21-25', start: 21, end: 25 },
    { label: '26-31', start: 26, end: 31 }
  ];

  const intervalData = intervals.map(interval => {
    let total = 0;
    for (let day = interval.start; day <= interval.end; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
      const dateStr = `${dayStr}/${monthStr}/${selectedYear}`;
      total += ordens
        .filter(os => os.status === 'PAGO' && os.dataOrcamento === dateStr)
        .reduce((acc, curr) => acc + curr.preco, 0);
    }
    return { label: interval.label, total };
  });

  const maxTotal = Math.max(...intervalData.map(d => d.total), 500);

  // --- OPÇÃO 4: FATURAMENTO POR FORMA DE PAGAMENTO ---
  const formasPagamento = ordensPagas.reduce((acc: { [key: string]: number }, os) => {
    const forma = os.formaPagamento || 'Outro';
    acc[forma] = (acc[forma] || 0) + os.preco;
    return acc;
  }, {});

  const formasData = Object.keys(formasPagamento).map(key => ({
    forma: key,
    total: formasPagamento[key],
    porcentagem: totalRecebido > 0 ? (formasPagamento[key] / totalRecebido) * 100 : 0
  })).sort((a, b) => b.total - a.total);

  // --- RANKING DE SERVIÇOS MAIS RENTÁVEIS ---
  const rankingServicos = ordensPagas.reduce((acc: { [key: string]: { total: number; qtd: number } }, os) => {
    const servico = os.servico || 'Não Especificado';
    // simplificar nome do serviço para agrupar melhor se necessário (ou usar literal completo)
    const servicoSimplificado = servico.length > 32 ? servico.substring(0, 32) + '...' : servico;
    if (!acc[servicoSimplificado]) {
      acc[servicoSimplificado] = { total: 0, qtd: 0 };
    }
    acc[servicoSimplificado].total += os.preco;
    acc[servicoSimplificado].qtd += 1;
    return acc;
  }, {});

  const rankingData = Object.keys(rankingServicos).map(key => ({
    servico: key,
    total: rankingServicos[key].total,
    qtd: rankingServicos[key].qtd
  })).sort((a, b) => b.total - a.total).slice(0, 4);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="flex-1 flex flex-col px-6 pb-6 animate-in slide-in-from-right-4 duration-300 gap-4 mt-2 min-h-0 overflow-y-auto no-scrollbar">
      
      {/* Header card com Botão Voltar */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setScreen('HOME')}
            className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200/50 text-gray-500 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-left font-bold">
            <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">ANÁLISE FINANCEIRA</div>
            <div className="text-gray-950 text-[17px] leading-tight font-bold">
              {meses[selectedMonth]} de {selectedYear}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais (Faturamento, Pendente, Ticket Médio, Conversão) */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div className="bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5 rounded-[20px] p-4 flex flex-col justify-between border border-[#34C759]/10 shadow-[0_4px_15px_rgba(52,199,89,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xs text-[#34C759] uppercase tracking-wider">Total Recebido</span>
            <CheckCircle2 size={16} className="text-[#34C759]" />
          </div>
          <div>
            <div className="font-bold text-[18px] tracking-tight text-gray-950 leading-none mb-1">
              {formatCurrency(totalRecebido)}
            </div>
            <span className="text-[10px] font-bold text-gray-400">
              {ordensPagas.length} {ordensPagas.length === 1 ? 'ordem paga' : 'ordens pagas'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FF9500]/10 to-[#FF9500]/5 rounded-[20px] p-4 flex flex-col justify-between border border-[#FF9500]/10 shadow-[0_4px_15px_rgba(255,149,0,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xs text-[#FF9500] uppercase tracking-wider">A Receber</span>
            <Clock size={16} className="text-[#FF9500]" />
          </div>
          <div>
            <div className="font-bold text-[18px] tracking-tight text-gray-950 leading-none mb-1">
              {formatCurrency(totalPendente)}
            </div>
            <span className="text-[10px] font-bold text-gray-400">
              {ordensPendentes.length} {ordensPendentes.length === 1 ? 'pendente' : 'pendentes'}
            </span>
          </div>
        </div>

        {/* OPÇÃO 2: Ticket Médio Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-[20px] p-4 flex flex-col justify-between border border-blue-500/10 shadow-[0_4px_15px_rgba(0,122,255,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xs text-blue-600 uppercase tracking-wider">Ticket Médio</span>
            <Coins size={16} className="text-blue-500" />
          </div>
          <div>
            <div className="font-bold text-[18px] tracking-tight text-gray-950 leading-none mb-1">
              {formatCurrency(ticketMedio)}
            </div>
            <span className="text-[10px] font-bold text-gray-400">Valor médio por OS</span>
          </div>
        </div>

        {/* OPÇÃO 2: Taxa de Conversão Card */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-[20px] p-4 flex flex-col justify-between border border-purple-500/10 shadow-[0_4px_15px_rgba(168,85,247,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xs text-purple-600 uppercase tracking-wider">Conversão</span>
            <Percent size={16} className="text-purple-500" />
          </div>
          <div>
            <div className="font-bold text-[18px] tracking-tight text-gray-950 leading-none mb-1">
              {taxaConversao.toFixed(0)}%
            </div>
            <span className="text-[10px] font-bold text-gray-400">Aprovação de serviços</span>
          </div>
        </div>
      </div>

      {/* OPÇÃO 3: Gráfico de Recebimentos por Período */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
              <TrendingUp size={14} />
            </div>
            <span className="font-bold text-gray-950 text-sm">Faturamento Diário (Mês Corrente)</span>
          </div>
        </div>

        <div className="flex items-end justify-between h-24 px-1 gap-2">
          {intervalData.map((item, idx) => {
            const pct = (item.total / maxTotal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                <div className="relative w-full flex justify-center">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all duration-150 bg-gray-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {formatCurrency(item.total)}
                  </div>
                  {/* Bar */}
                  <div 
                    style={{ height: `${Math.max(pct, 6)}%` }}
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      item.total > 0 
                        ? 'bg-gradient-to-t from-[#007AFF] to-blue-500 hover:brightness-105' 
                        : 'bg-gray-100'
                    }`}
                  />
                </div>
                <span className="text-[9px] font-bold text-gray-400 tracking-wider mt-1">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OPÇÃO 4: Distribuição por Forma de Pagamento */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CreditCard size={14} />
          </div>
          <span className="font-bold text-gray-950 text-sm">Faturamento por Forma de Pagamento</span>
        </div>

        <div className="flex flex-col gap-3">
          {formasData.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-800">{item.forma}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-400">{item.porcentagem.toFixed(0)}%</span>
                  <span className="font-bold text-gray-950">{formatCurrency(item.total)}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.porcentagem}%` }}
                />
              </div>
            </div>
          ))}
          {formasData.length === 0 && (
            <div className="text-gray-400 font-medium text-center py-4 text-xs">
              Nenhum pagamento registrado neste período.
            </div>
          )}
        </div>
      </div>

      {/* OPÇÃO 4: Ranking de Serviços mais Rentáveis */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Award size={14} />
          </div>
          <span className="font-bold text-gray-950 text-sm">Serviços mais Rentáveis</span>
        </div>

        <div className="flex flex-col gap-3">
          {rankingData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl border border-gray-100/70">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.servico}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{item.qtd} {item.qtd === 1 ? 'realização' : 'realizações'}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-950 pl-2 shrink-0">{formatCurrency(item.total)}</span>
            </div>
          ))}
          {rankingData.length === 0 && (
            <div className="text-gray-400 font-medium text-center py-4 text-xs">
              Nenhum serviço realizado neste período.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
