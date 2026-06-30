import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import jsPDF from 'jspdf';
import { formatCurrency } from '../utils';
import { ChevronLeft } from 'lucide-react';

export function NovaOSScreen() {
  const { addOS, setScreen, userProfile } = useStore();
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('nova_os_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      cliente: '',
      servico: '',
      preco: '',
      formaPagamento: '',
      contato: '',
      dataOrcamento: new Date().toLocaleDateString('pt-BR'),
      validadeOrcamento: 'A combinar',
    };
  });

  useEffect(() => {
    localStorage.setItem('nova_os_draft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalizar = () => {
    if (!formData.cliente || !formData.servico || !formData.preco) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    
    const precoNum = parseFloat(formData.preco.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;

    addOS({
      cliente: formData.cliente,
      servico: formData.servico,
      preco: precoNum,
      formaPagamento: formData.formaPagamento,
      contato: formData.contato,
      dataOrcamento: formData.dataOrcamento,
      validadeOrcamento: formData.validadeOrcamento,
      status: 'AGUARDANDO INICIO'
    });
    
    // Clear draft
    localStorage.removeItem('nova_os_draft');
    
    setScreen('LISTA_OS', { statusFilter: 'AGUARDANDO INICIO' });
  };

  const companyName = userProfile.nomeEmpresa || 'Sua Empresa';
  const companyPhone = userProfile.telefone || '';

  const handleWhatsapp = () => {
    const msg = `📋 ORÇAMENTO DE SERVIÇO

Olá, ${formData.cliente || 'Cliente'}!

Segue o orçamento solicitado:

🔹 Descrição do Serviço:
${formData.servico || '-'}

💰 Valor do Serviço:
R$ ${formData.preco || '0,00'}

📅 Data do Orçamento:
${formData.dataOrcamento || '-'}

✅ Observações:
• Forma de pagamento: ${formData.formaPagamento || '-'}
• Validade deste orçamento: ${formData.validadeOrcamento || '-'}

Agradecemos pela oportunidade. Ficamos à disposição para esclarecer qualquer dúvida.

Atenciosamente,

${companyName}${companyPhone ? `\n📞 ${companyPhone}` : ''}`;
    const uri = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(uri, '_blank');
  };

  const generatePDF = () => {
    if (!formData.cliente || !formData.servico || !formData.preco) {
      alert('Preencha os campos obrigatórios primeiro.');
      return;
    }

    const doc = new jsPDF();
    const precoNum = parseFloat(formData.preco.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;

    let y = 20;

    if (userProfile.logo) {
      const logoWidth = 30;
      const logoHeight = 30;
      const x = 105 - (logoWidth / 2);
      doc.addImage(userProfile.logo, 'PNG', x, 10, logoWidth, logoHeight);
      y = 50;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`ORÇAMENTO DE SERVIÇO`, 105, y, { align: 'center' });
    
    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Olá, ${formData.cliente}!`, 20, y);
    
    y += 10;
    doc.text(`Segue o orçamento solicitado:`, 20, y);
    
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`Descrição do Serviço:`, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(formData.servico, 20, y, { maxWidth: 170 });
    
    // Calculate new Y based on wrapped text height if needed, but for simplicity assuming a few lines
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`Valor do Serviço:`, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(`R$ ${formData.preco}`, 20, y);

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`Data do Orçamento:`, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(formData.dataOrcamento, 20, y);

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(`Observações:`, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(`• Forma de pagamento: ${formData.formaPagamento}`, 25, y);
    y += 7;
    doc.text(`• Validade deste orçamento: ${formData.validadeOrcamento}`, 25, y);

    y += 20;
    doc.text(`Agradecemos pela oportunidade. Ficamos à disposição para esclarecer`, 20, y);
    y += 7;
    doc.text(`qualquer dúvida.`, 20, y);

    y += 15;
    doc.text(`Atenciosamente,`, 20, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 20, y);
    if (companyPhone) {
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Telefone: ${companyPhone}`, 20, y);
    }

    doc.save(`Orcamento_${formData.cliente.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex-1 flex flex-col px-5 pb-6 animate-in fade-in slide-in-from-right-4 duration-300 min-h-0">
      <div className="flex-1 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative min-h-0">
        
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex justify-between items-center mb-6 shrink-0 h-8">
            <button 
              onClick={() => setScreen('HOME')} 
              className="text-[#007AFF] font-semibold text-[15px] hover:opacity-80 active:opacity-60 flex items-center gap-0.5"
            >
              <ChevronLeft size={20} />
              Voltar
            </button>
            <button 
              onClick={() => {
                if (confirm('Deseja limpar todos os campos deste orçamento?')) {
                  setFormData({
                    cliente: '',
                    servico: '',
                    preco: '',
                    formaPagamento: '',
                    contato: '',
                    dataOrcamento: new Date().toLocaleDateString('pt-BR'),
                    validadeOrcamento: 'A combinar',
                  });
                }
              }}
              className="text-red-500 font-semibold text-[14px] hover:opacity-80 active:opacity-60"
            >
              Limpar
            </button>
          </div>

          <div className="font-semibold text-sm text-gray-500 mb-4 uppercase tracking-wide shrink-0">Dados da Ordem</div>

          <div className="flex flex-col gap-5 overflow-y-auto no-scrollbar flex-1 pb-4 pr-2">
            <InputField label="NOME CLIENTE:" name="cliente" value={formData.cliente} onChange={handleChange} />
            <InputField label="SERVIÇO:" name="servico" value={formData.servico} onChange={handleChange} />
            <InputField label="PREÇO:" name="preco" value={formData.preco} onChange={handleChange} />
            <InputField label="FORMA DE PAGAMENTO:" name="formaPagamento" value={formData.formaPagamento} onChange={handleChange} />
            <InputField label="CONTATO:" name="contato" value={formData.contato} onChange={handleChange} />
            <InputField label="DATA ORÇAMENTO:" name="dataOrcamento" value={formData.dataOrcamento} onChange={handleChange} />
            <InputField label="VALIDADE ORÇAMENTO:" name="validadeOrcamento" value={formData.validadeOrcamento} onChange={handleChange} />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6 shrink-0">
          <button 
            onClick={handleFinalizar}
            className="w-full bg-[#007AFF] hover:opacity-90 active:opacity-70 transition-all text-white font-semibold py-4 px-4 rounded-[20px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] text-[17px]"
          >
            Finalizar OS
          </button>
          <div className="flex gap-3">
            <button 
              onClick={generatePDF}
              className="flex-1 bg-[#E5E5EA] hover:opacity-90 active:opacity-70 transition-all text-gray-900 font-semibold py-4 px-2 rounded-[20px] shadow-sm text-[15px]"
            >
              Exibir em PDF
            </button>
            <button 
              onClick={handleWhatsapp}
              className="flex-1 bg-[#34C759] hover:opacity-90 active:opacity-70 transition-all text-white font-semibold py-4 px-2 rounded-[20px] shadow-sm text-[15px]"
            >
              Whatsapp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputField = ({ label, name, value, onChange }: any) => (
  <div className="flex flex-col border-b border-gray-200 pb-2 focus-within:border-[#007AFF] transition-colors">
    <label className="font-semibold text-gray-500 text-[11px] mb-1 uppercase tracking-wide">{label}</label>
    <input 
      type="text" 
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-transparent outline-none text-gray-900 text-[16px] font-medium placeholder-gray-300"
    />
  </div>
);
