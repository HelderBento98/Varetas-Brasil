import React, { useState, useEffect } from 'react';
import { ChevronDown, FileText, Plus, Trash2, Clock, MessageSquare, Bell } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useStore } from '../store';

const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

const ANOS = Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2024 + i);

export function CalendarioScreen() {
  const { 
    ordens, 
    userProfile, 
    selectedMonth, 
    selectedYear, 
    setGlobalDate, 
    lembretes = [], 
    addLembrete, 
    deleteLembrete 
  } = useStore();
  const hoje = new Date();
  const [menuMesAberto, setMenuMesAberto] = useState(false);
  const [menuAnoAberto, setMenuAnoAberto] = useState(false);

  // States for selected day and reminder form
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date();
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear ? d.getDate() : 1;
  });
  const [showForm, setShowForm] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [horario, setHorario] = useState('12:00');
  const [celular, setCelular] = useState('');

  useEffect(() => {
    const d = new Date();
    if (d.getMonth() === selectedMonth && d.getFullYear() === selectedYear) {
      setSelectedDay(d.getDate());
    } else {
      setSelectedDay(1);
    }
  }, [selectedMonth, selectedYear]);

  const mes = MESES[selectedMonth];
  const ano = selectedYear;

  const monthIndex = selectedMonth;
  const firstDayOfMonth = new Date(ano, monthIndex, 1);
  const daysInMonth = new Date(ano, monthIndex + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...

  const isCurrentMonthYear = hoje.getMonth() === monthIndex && hoje.getFullYear() === ano;
  const dayHoje = hoje.getDate();

  const handleExtrato = () => {
    // Filtrar ordens pagas do mês e ano selecionados
    const ordensDoMes = ordens.filter(os => {
      if (os.status !== 'PAGO') return false;
      const [diaStr, mesStr, anoStr] = os.dataOrcamento.split('/');
      return parseInt(mesStr, 10) - 1 === monthIndex && parseInt(anoStr, 10) === ano;
    });

    if (ordensDoMes.length === 0) {
      alert(`Nenhum serviço pago encontrado em ${mes} de ${ano}.`);
      return;
    }

    // Agrupar por dia e ordernar cronologicamente
    ordensDoMes.sort((a, b) => {
      const diaA = parseInt(a.dataOrcamento.split('/')[0], 10);
      const diaB = parseInt(b.dataOrcamento.split('/')[0], 10);
      return diaA - diaB;
    });

    const doc = new jsPDF();
    const companyName = userProfile.nomeEmpresa || 'Sua Empresa';
    const companyPhone = userProfile.telefone || '';
    
    let totalRecebido = 0;
    ordensDoMes.forEach(os => totalRecebido += os.preco);
    
    const qtdServicos = ordensDoMes.length;
    const periodo = `${mes}/${ano}`;
    const valorTotalStr = `R$ ${totalRecebido.toFixed(2).replace('.', ',')}`;

    // === Cabeçalho ===
    if (userProfile.logo) {
      // Ajustar logo para a esquerda
      const logoWidth = 25;
      const logoHeight = 25;
      doc.addImage(userProfile.logo, 'PNG', 14, 15, logoWidth, logoHeight);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      // Alinhado à direita ou centralizado
      doc.text('EXTRATO DE SERVIÇOS', 45, 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(companyName, 45, 33);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('EXTRATO DE SERVIÇOS', 14, 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(companyName, 14, 33);
    }

    let yOffset = 55;

    // === Cartões de Resumo ===
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(250, 250, 250);
    
    // Configurações dos 3 cartões
    const cardWidth = 55;
    const cardHeight = 24;
    const cardY = yOffset;
    
    doc.roundedRect(14, cardY, cardWidth, cardHeight, 3, 3, 'FD');
    doc.roundedRect(77, cardY, cardWidth, cardHeight, 3, 3, 'FD');
    doc.roundedRect(140, cardY, cardWidth, cardHeight, 3, 3, 'FD');

    // Textos dos cartões
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text('Valor Total', 18, cardY + 8);
    doc.text('Quantidade de Serviços', 81, cardY + 8);
    doc.text('Período', 144, cardY + 8);

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(valorTotalStr, 18, cardY + 18);
    doc.text(`${qtdServicos}`, 81, cardY + 18);
    doc.text(periodo, 144, cardY + 18);

    yOffset += 40;

    // === Tabela ===
    const tableData = ordensDoMes.map(os => [
      os.dataOrcamento,
      os.cliente,
      os.servico,
      `R$ ${os.preco.toFixed(2).replace('.', ',')}`
    ]);

    autoTable(doc, {
      startY: yOffset,
      head: [['Data', 'Cliente', 'Serviço', 'Valor']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [248, 248, 248], 
        textColor: [50, 50, 50], 
        fontStyle: 'bold',
        lineColor: [230, 230, 230],
        lineWidth: 0.1
      },
      alternateRowStyles: { 
        fillColor: [248, 248, 248] 
      },
      bodyStyles: {
        textColor: [80, 80, 80],
        lineColor: [240, 240, 240],
        lineWidth: 0.1
      },
      styles: { 
        font: 'helvetica',
        fontSize: 9, 
        cellPadding: 4 
      },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold', textColor: [50, 50, 50] } // Valor alinhado a direita e em negrito
      },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // === Total Geral Destacado ===
    // Bloco Verde ou Azul Escuro
    doc.setFillColor(34, 197, 94); // Tailwind green-500 (RGB)
    doc.roundedRect(120, finalY, 76, 12, 2, 2, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GERAL:', 125, finalY + 8);
    doc.text(valorTotalStr, 190, finalY + 8, { align: 'right' });

    // === Rodapé ===
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      
      const emissao = `Emitido em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
      const rodapeText = `${companyName}${companyPhone ? ` • ${companyPhone}` : ''}`;
      
      doc.text(emissao, 14, 287);
      doc.text(rodapeText, 196, 287, { align: 'right' });
    }

    doc.save(`Extrato_${mes}_${ano}.pdf`);
  };

  const selectedDayDateStr = `${selectedDay.toString().padStart(2, '0')}/${(monthIndex + 1).toString().padStart(2, '0')}/${ano}`;
  const selectedDayLembretes = lembretes.filter(l => l.data === selectedDayDateStr);

  const handleSaveLembrete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      alert('Por favor, digite uma descrição para o compromisso.');
      return;
    }

    const formattedDay = selectedDay.toString().padStart(2, '0');
    const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
    const dateStr = `${formattedDay}/${formattedMonth}/${ano}`;

    addLembrete({
      descricao: descricao.trim(),
      horario,
      data: dateStr,
      celular: celular.trim() || undefined
    });

    setDescricao('');
    setHorario('12:00');
    setCelular('');
    setShowForm(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col px-5 pb-4 animate-in fade-in zoom-in-95 duration-300 gap-3 mt-1 overflow-y-auto no-scrollbar">
      <div className="flex gap-2 relative z-30 shrink-0">
        <div 
          className="bg-white rounded-[20px] py-3 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between flex-1 font-semibold text-[16px] text-gray-900 cursor-pointer relative hover:opacity-90 active:opacity-70 transition-all duration-200"
          onClick={() => setMenuAnoAberto(!menuAnoAberto)}
        >
          {ano}
          <ChevronDown size={20} className={`text-gray-400 transition-transform ${menuAnoAberto ? 'rotate-180' : ''}`} />
          
          {menuAnoAberto && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-gray-100 rounded-[16px] shadow-xl max-h-48 overflow-y-auto no-scrollbar z-50">
              {ANOS.map((a) => (
                <div 
                  key={a} 
                  className="px-4 py-2 hover:bg-gray-100 text-base font-medium text-gray-900 active:bg-gray-200"
                  onClick={() => setGlobalDate(selectedMonth, a)}
                >
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>
        <div 
          className="bg-white rounded-[20px] py-3 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between flex-[2] font-semibold text-[16px] text-gray-900 cursor-pointer relative hover:opacity-90 active:opacity-70 transition-opacity duration-200"
          onClick={() => setMenuMesAberto(!menuMesAberto)}
        >
          {mes}
          <ChevronDown size={20} className={`text-gray-400 transition-transform ${menuMesAberto ? 'rotate-180' : ''}`} />
          
          {menuMesAberto && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-gray-100 rounded-[16px] shadow-xl max-h-48 overflow-y-auto no-scrollbar z-50">
              {MESES.map((m) => (
                <div 
                  key={m} 
                  className="px-4 py-2 hover:bg-gray-100 text-base font-medium text-gray-900 active:bg-gray-200"
                  onClick={() => setGlobalDate(MESES.indexOf(m), selectedYear)}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-2 shadow-sm border border-gray-100 flex flex-col pt-4 relative z-10 overflow-hidden justify-center min-h-0 shrink-0">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[80px] bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-7 text-center font-bold text-[11px] text-gray-400 mb-2 uppercase tracking-wider relative z-10 w-full px-1">
          <div className="text-gray-400">D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div className="text-gray-400">S</div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center font-semibold text-[15px] text-gray-700 relative z-10 mb-2 px-1 flex-1 items-center">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="text-transparent pointer-events-none">0</div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNumber = i + 1;
            const isToday = isCurrentMonthYear && dayNumber === dayHoje;
            const isSelected = selectedDay === dayNumber;
            
            // Check if there are paid orders on this day
            const hasPayments = ordens.some(os => {
              if (os.status !== 'PAGO') return false;
              const [diaStr, mesStr, anoStr] = os.dataOrcamento.split('/');
              return parseInt(diaStr, 10) === dayNumber && 
                     parseInt(mesStr, 10) - 1 === monthIndex && 
                     parseInt(anoStr, 10) === ano;
            });

            // Check if there are active reminders on this day
            const dayDateStr = `${dayNumber.toString().padStart(2, '0')}/${(monthIndex + 1).toString().padStart(2, '0')}/${ano}`;
            const dayLembretes = lembretes.filter(l => l.data === dayDateStr);
            const hasReminders = dayLembretes.length > 0;

            const isWeekend = (startingDayOfWeek + i) % 7 === 0 || (startingDayOfWeek + i) % 7 === 6;

            let dayStyleClass = "";
            if (isToday) {
              dayStyleClass = "bg-[#007AFF] text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer";
            } else if (isSelected) {
              dayStyleClass = "bg-blue-100 text-[#007AFF] font-bold border border-[#007AFF]/30 cursor-pointer";
            } else if (isWeekend) {
              dayStyleClass = "text-gray-400 hover:bg-gray-50 active:bg-gray-100 cursor-pointer";
            } else {
              dayStyleClass = "text-gray-700 hover:bg-blue-50 active:bg-blue-100 cursor-pointer";
            }

            return (
              <div 
                key={`day-${i}`} 
                className="flex flex-col items-center justify-start gap-0.5 cursor-pointer"
                onClick={() => {
                  setSelectedDay(dayNumber);
                  setShowForm(false);
                }}
              >
                <div className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 ${dayStyleClass}`}>
                  {dayNumber}
                </div>
                {/* Indicator dots for payments & reminders */}
                <div className="flex gap-1 justify-center items-center h-1.5">
                  {hasPayments && <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-blue-200' : 'bg-green-500'}`} />}
                  {hasReminders && <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-purple-500'}`} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda/Lembretes do dia selecionado */}
      <div className="bg-white rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col gap-4 relative z-10 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
              <Bell size={16} className="text-purple-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[16px]">Compromissos</h3>
              <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                {selectedDay.toString().padStart(2, '0')} DE {mes}
              </p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] font-bold text-xs px-3 py-2 rounded-full transition-colors"
            >
              <Plus size={14} strokeWidth={3} />
              NOVO
            </button>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleSaveLembrete} className="flex flex-col gap-3.5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-3 duration-200">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Descrição / Visita</label>
              <input
                type="text"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Ex: Visita ao cliente João para orçamento"
                className="w-full bg-white border border-gray-200 rounded-[14px] px-3.5 py-2.5 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Horário</label>
                <input
                  type="time"
                  value={horario}
                  onChange={e => setHorario(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-[14px] px-3.5 py-2.5 text-sm text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Celular Cliente (Opcional)</label>
                <input
                  type="tel"
                  value={celular}
                  onChange={e => setCelular(e.target.value)}
                  placeholder="Ex: 11999999999"
                  className="w-full bg-white border border-gray-200 rounded-[14px] px-3.5 py-2.5 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setDescricao('');
                  setCelular('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-[16px] text-xs transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#007AFF] hover:opacity-90 text-white font-bold py-3 px-4 rounded-[16px] text-xs transition-opacity shadow-[0_4px_12px_rgba(0,122,255,0.2)]"
              >
                SALVAR
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
            {selectedDayLembretes.length === 0 ? (
              <div className="text-center py-6 px-4 bg-gray-50/50 rounded-2xl border border-gray-100/60">
                <p className="text-xs font-semibold text-gray-400">Sem compromissos agendados</p>
              </div>
            ) : (
              selectedDayLembretes.map((lembrete) => {
                const handleWhatsAppDirect = () => {
                  const text = `Olá! Passando para confirmar nossa visita agendada: ${lembrete.descricao} hoje às ${lembrete.horario}.`;
                  const cleanPhone = (lembrete.celular || '').replace(/\D/g, '');
                  const phoneWithCountry = cleanPhone.length === 11 || cleanPhone.length === 10 ? `55${cleanPhone}` : cleanPhone;
                  window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`, '_blank');
                };

                return (
                  <div key={lembrete.id} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60 hover:bg-gray-50 transition-colors animate-in fade-in duration-150">
                    <div className="bg-purple-100/50 text-purple-700 font-bold text-xs rounded-xl px-2.5 py-2 flex items-center gap-1 shrink-0">
                      <Clock size={12} strokeWidth={2.5} />
                      {lembrete.horario}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{lembrete.descricao}</p>
                      {lembrete.celular && (
                        <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{lembrete.celular}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {lembrete.celular && (
                        <button
                          onClick={handleWhatsAppDirect}
                          title="Enviar WhatsApp"
                          className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors"
                        >
                          <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 1.97 14.101.945 11.48.945 6.046.945 1.624 5.315 1.62 10.744c-.001 1.758.463 3.473 1.341 5.01L1.93 22.164l6.513-1.706c1.514.826 3.064 1.26 4.636 1.26z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => deleteLembrete(lembrete.id)}
                        title="Excluir Lembrete"
                        className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <button 
        onClick={handleExtrato}
        className="w-full bg-[#007AFF] hover:opacity-90 active:opacity-70 transition-all text-white font-semibold py-3.5 rounded-[18px] text-[16px] flex items-center justify-center gap-2 shrink-0 shadow-sm"
      >
        <FileText size={20} />
        GERAR EXTRATO
      </button>

    </div>
  );
}
