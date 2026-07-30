import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, getStatusColorText } from '../utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Search, ArrowUpDown, SlidersHorizontal, ArrowLeft } from 'lucide-react';

export function ListaOSScreen() {
  const { ordens, selectedStatusFilter, setScreen, userProfile, selectedMonth, selectedYear } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'value_desc' | 'value_asc' | 'client'>('recent');

  const ordensFiltradasGlobais = ordens.filter(os => {
    const [d, m, a] = os.dataOrcamento.split('/');
    return parseInt(m, 10) - 1 === selectedMonth && parseInt(a, 10) === selectedYear;
  });

  const baseFilteredOrdens = selectedStatusFilter 
    ? ordensFiltradasGlobais.filter(o => o.status === selectedStatusFilter)
    : ordensFiltradasGlobais;

  // Filtrar por busca (nome do cliente ou descrição do serviço)
  const searchedOrdens = baseFilteredOrdens.filter(os => {
    const term = searchTerm.toLowerCase();
    return (
      (os.cliente || '').toLowerCase().includes(term) ||
      (os.servico || '').toLowerCase().includes(term) ||
      (os.numero || '').toLowerCase().includes(term)
    );
  });

  // Ordenar conforme selecionado
  const parseDate = (dStr: string) => {
    const [d, m, a] = dStr.split('/');
    return new Date(parseInt(a, 10), parseInt(m, 10) - 1, parseInt(d, 10)).getTime();
  };

  const sortedAndFilteredOrdens = [...searchedOrdens].sort((a, b) => {
    switch (sortBy) {
      case 'value_desc':
        return b.preco - a.preco;
      case 'value_asc':
        return a.preco - b.preco;
      case 'client':
        return (a.cliente || '').localeCompare(b.cliente || '');
      case 'recent':
      default:
        return parseDate(b.dataOrcamento) - parseDate(a.dataOrcamento);
    }
  });

  const count = sortedAndFilteredOrdens.length;

  let headerColor = 'text-gray-800';
  let title = 'TODOS OS SERVIÇOS';
  
  if (selectedStatusFilter === 'AGUARDANDO INICIO') {
    headerColor = 'text-[#007AFF]';
    title = 'AGENDADOS';
  } else if (selectedStatusFilter === 'PAGO') {
    headerColor = 'text-[#34C759]';
    title = 'PAGOS';
  } else if (selectedStatusFilter === 'PENDENTES') {
    headerColor = 'text-[#FF9500]';
    title = 'PENDENTES';
  }

  const handleExtrato = () => {
    if (!userProfile.planoAtivo) {
      alert("Acesso restrito. Assine um plano para gerar extratos.");
      return;
    }

    const periodo = `${(selectedMonth + 1).toString().padStart(2, '0')}/${selectedYear}`;

    // Filtra apenas do mes selecionado (já estamos usando sortedAndFilteredOrdens que já tem esse filtro)
    const ordensDoMes = [...sortedAndFilteredOrdens];

    if (ordensDoMes.length === 0) {
      alert(`Nenhum serviço pago encontrado neste mês até agora.`);
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
    const valorTotalStr = `R$ ${totalRecebido.toFixed(2).replace('.', ',')}`;

    // === Cabeçalho ===
    if (userProfile.logo) {
      const logoWidth = 25;
      const logoHeight = 25;
      doc.addImage(userProfile.logo, 'PNG', 14, 15, logoWidth, logoHeight);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
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
        3: { halign: 'right', fontStyle: 'bold', textColor: [50, 50, 50] } 
      },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // === Total Geral Destacado ===
    doc.setFillColor(34, 197, 94);
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

    doc.save(`Extrato_Atual_${periodo.replace('/', '_')}.pdf`);
  };

  return (
    <div className="flex-1 flex flex-col px-6 pb-6 animate-in slide-in-from-right-4 duration-300 gap-4 mt-2 min-h-0">
      
      {/* Resumo Info */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setScreen('HISTORICO')}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200/50 text-gray-500"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="text-left font-bold">
              <div className="text-[11px] text-gray-500 uppercase font-semibold tracking-wide">SERVIÇOS</div>
              <div className={`${headerColor} text-[17px] leading-tight font-bold`}>{title}</div>
            </div>
          </div>
          <div className={`border-l border-gray-100 pl-6 ${headerColor} text-5xl font-light tracking-tight`}>
            {count}
          </div>
      </div>

      {/* Caixa de Pesquisa e Ordenação */}
      <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 shrink-0 flex flex-col gap-3">
        {/* Barra de Pesquisa */}
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, serviço..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 text-[14px] text-gray-950 font-medium pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:border-[#007AFF] focus:bg-white transition-all placeholder-gray-400"
          />
        </div>

        {/* Controles de Ordenação */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-50 pt-3 justify-center">
          <button
            onClick={() => setSortBy('recent')}
            className={`text-xs px-4 py-1.5 rounded-full font-bold border transition-all flex-1 text-center ${
              sortBy === 'recent' 
                ? 'bg-blue-50 border-blue-200 text-[#007AFF]' 
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            Recentes
          </button>
          <button
            onClick={() => setSortBy('value_desc')}
            className={`text-xs px-4 py-1.5 rounded-full font-bold border transition-all flex-1 text-center ${
              sortBy === 'value_desc' 
                ? 'bg-blue-50 border-blue-200 text-[#007AFF]' 
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            Maior Valor
          </button>
          <button
            onClick={() => setSortBy('value_asc')}
            className={`text-xs px-4 py-1.5 rounded-full font-bold border transition-all flex-1 text-center ${
              sortBy === 'value_asc' 
                ? 'bg-blue-50 border-blue-200 text-[#007AFF]' 
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            Menor Valor
          </button>
        </div>
      </div>

      {/* Listagem */}
      <div className="flex-1 bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between min-h-0">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="font-semibold text-gray-500 text-sm tracking-wide uppercase">Serviços Listados</h2>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {count} REGISTROS
            </span>
          </div>
          
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar pr-1">
            {sortedAndFilteredOrdens.map((os) => (
              <div 
                key={os.id} 
                className="text-sm bg-gray-50/50 p-4 rounded-[16px] border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 active:scale-[0.98] transition-all duration-150"
                onClick={() => setScreen('DETALHES_OS', { osId: os.id })}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-bold text-[15px] text-gray-900 mb-0.5 truncate">{os.cliente}</div>
                  <div className="text-gray-500 font-semibold text-xs truncate mb-1">{os.servico}</div>
                  <div className="text-gray-400 text-[10px] font-bold">{os.dataOrcamento} • <span className="text-[#007AFF] font-bold">{formatCurrency(os.preco)}</span></div>
                </div>
                <div className={`font-semibold text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full shrink-0 ${getStatusColorText(os.status).replace('text-', 'bg-').replace(']', ']/10')} ${getStatusColorText(os.status)}`}>
                  {os.status === 'AGUARDANDO INICIO' ? 'AGENDADO' : os.status}
                </div>
              </div>
            ))}
            {sortedAndFilteredOrdens.length === 0 && (
              <div className="text-center text-gray-400 font-medium py-12 flex flex-col items-center justify-center gap-2">
                <SlidersHorizontal size={24} className="text-gray-300" />
                <span>Nenhum serviço encontrado para sua busca.</span>
              </div>
            )}
          </div>
        </div>

        {selectedStatusFilter === 'PAGO' && (
          <button 
            onClick={handleExtrato}
            className="w-full bg-[#E5E5EA] hover:bg-gray-300 active:opacity-75 transition-all text-gray-800 font-bold py-4 mt-6 rounded-[20px] flex items-center justify-center gap-2 shadow-sm text-[16px]"
          >
            <span className="text-xl leading-none font-normal">+</span> EXTRATO ATUAL
          </button>
        )}
      </div>

    </div>
  );
}
