import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, generatePixPayload } from '../utils';
import jsPDF from 'jspdf';
import { ArrowLeft, QrCode, Copy, Check, Send, AlertCircle, X } from 'lucide-react';

export function DetalhesOSScreen() {
  const { ordens, selectedOSId, updateOSStatus, setScreen, deleteOS, userProfile } = useStore();
  const os = ordens.find(o => o.id === selectedOSId);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);

  if (!os) return <div className="p-6">OS Não encontrada.</div>;

  const handleUpdate = (newStatus: 'PAGO' | 'PENDENTES') => {
    if (!userProfile.planoAtivo) {
      alert("Acesso restrito. Assine um plano para editar serviços.");
      return;
    }
    updateOSStatus(os.id, newStatus);
    setScreen('LISTA_OS', { statusFilter: newStatus });
  };

  const handleWhatsappCobrar = () => {
    if (!userProfile.planoAtivo) {
      alert("Acesso restrito. Assine um plano para cobrar clientes.");
      return;
    }
    const companyName = userProfile.nomeEmpresa || 'Sua Empresa';
    const companyPhone = userProfile.telefone || '';
    
    const msg = `Olá, ${os.cliente}! 😊

Espero que esteja tudo bem.

Passando apenas para lembrar sobre o pagamento referente ao serviço realizado conforme combinado:

🛠️ Serviço: ${os.servico}
📅 Data de realização: ${os.dataOrcamento}
💰 Valor: R$ ${os.preco.toFixed(2).replace('.', ',')}

Até o momento, não identificamos o recebimento deste pagamento. Caso ele já tenha sido efetuado, por favor desconsidere esta mensagem.

Se ainda estiver pendente, peço a gentileza de realizar o pagamento quando possível ou me informar uma previsão, para que possamos manter nossos registros atualizados.

Agradeço pela confiança em nosso trabalho e fico à disposição para qualquer dúvida.

Atenciosamente,

${companyName}${companyPhone ? `\n📞 ${companyPhone}` : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const generateAndSendWarranty = (days: number) => {
    if (!userProfile.planoAtivo) {
      alert("Acesso restrito. Assine um plano para gerar garantias.");
      return;
    }
    setShowWarrantyModal(false);

    const doc = new jsPDF();
    const companyName = userProfile.nomeEmpresa || 'Minha Empresa';

    if (userProfile.logo) {
      const logoWidth = 30;
      const logoHeight = 30;
      const x = 105 - (logoWidth / 2);
      doc.addImage(userProfile.logo, 'PNG', x, 10, logoWidth, logoHeight);
      doc.setFontSize(22);
      doc.text(`Certificado de Garantia`, 105, 50, { align: 'center' });
      doc.setFontSize(16);
      doc.text(companyName, 105, 65, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`Cliente: ${os.cliente}`, 20, 85);
      doc.text(`Serviço Realizado: ${os.servico}`, 20, 95);
      doc.text(`Data do Serviço: ${os.dataOrcamento}`, 20, 105);
      doc.text(`Valor Original: ${formatCurrency(os.preco)}`, 20, 115);

      doc.setFont('helvetica', 'bold');
      doc.text(`Prazo de Garantia: ${days} dias`, 20, 135);
      doc.setFont('helvetica', 'normal');

      const dt = os.dataOrcamento.split('/');
      if (dt.length >= 3) {
        const d = new Date(parseInt(dt[2], 10), parseInt(dt[1], 10) - 1, parseInt(dt[0], 10));
        d.setDate(d.getDate() + days);
        const validUntil = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        doc.text(`Válido até: ${validUntil}`, 20, 145);
      }

      doc.setFontSize(10);
      doc.text(`Este documento certifica que o serviço descrito acima possui garantia técnica`, 105, 185, { align: 'center' });
      doc.text(`pelo período estipulado, oferecida por ${companyName}.`, 105, 191, { align: 'center' });
    } else {
      doc.setFontSize(22);
      doc.text(`Certificado de Garantia`, 105, 30, { align: 'center' });

      doc.setFontSize(16);
      doc.text(companyName, 105, 45, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`Cliente: ${os.cliente}`, 20, 70);
      doc.text(`Serviço Realizado: ${os.servico}`, 20, 80);
      doc.text(`Data do Serviço: ${os.dataOrcamento}`, 20, 90);
      doc.text(`Valor Original: ${formatCurrency(os.preco)}`, 20, 100);

      doc.setFont('helvetica', 'bold');
      doc.text(`Prazo de Garantia: ${days} dias`, 20, 120);
      doc.setFont('helvetica', 'normal');

      const dt = os.dataOrcamento.split('/');
      if (dt.length >= 3) {
        const d = new Date(parseInt(dt[2], 10), parseInt(dt[1], 10) - 1, parseInt(dt[0], 10));
        d.setDate(d.getDate() + days);
        const validUntil = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        doc.text(`Válido até: ${validUntil}`, 20, 130);
      }

      doc.setFontSize(10);
      doc.text(`Este documento certifica que o serviço descrito acima possui garantia técnica`, 105, 170, { align: 'center' });
      doc.text(`pelo período estipulado, oferecida por ${companyName}.`, 105, 176, { align: 'center' });
    }

    doc.save(`Garantia_${os.numero}.pdf`);

    setTimeout(() => {
      const msg = `Olá *${os.cliente}*, estou te enviando o certificado de garantia do seu serviço (${os.servico}). O prazo de garantia é de *${days} dias*! O PDF já foi gerado e salvo.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col px-5 pb-6 animate-in slide-in-from-right-4 duration-300 min-h-0">
      <div className="flex-1 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative min-h-0">
        
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <button 
              onClick={() => setScreen('HISTORICO')}
              className="text-[#007AFF] hover:opacity-80 active:opacity-60 transition-all p-1.5 rounded-full hover:bg-gray-50 shrink-0"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-semibold text-gray-900 text-[17px] tracking-tight">Detalhes do Serviço</h2>
            <div className="w-8 h-8 shrink-0" />
          </div>

          <div className="font-semibold text-sm text-gray-500 mb-4 uppercase tracking-wide shrink-0">Pedido #{os.numero}</div>

          <div className="flex flex-col gap-5 text-[15px] text-gray-900 overflow-y-auto no-scrollbar flex-1 pb-4 pr-2">
             <div className="flex flex-col border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-500 font-semibold mb-1">CLIENTE</span><span className="font-medium">{os.cliente}</span></div>
             <div className="flex flex-col border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-500 font-semibold mb-1">SERVIÇO</span><span className="font-medium">{os.servico}</span></div>
             <div className="flex flex-col border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-500 font-semibold mb-1">VALOR</span><span className="font-medium text-[#007AFF]">{formatCurrency(os.preco)}</span></div>
             <div className="flex flex-col border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-500 font-semibold mb-1">PAGAMENTO</span><span className="font-medium">{os.formaPagamento}</span></div>
             <div className="flex flex-col border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-500 font-semibold mb-1">CONTATO</span><span className="font-medium">{os.contato}</span></div>
             <div className="flex flex-col border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-500 font-semibold mb-1">DATA</span><span className="font-medium">{os.dataOrcamento}</span></div>
             {os.validadeOrcamento && (
               <div className="flex flex-col border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-500 font-semibold mb-1">VALIDADE ORÇAMENTO</span><span className="font-medium">{os.validadeOrcamento}</span></div>
             )}
          </div>
        </div>

        {/* Dynamic Buttons based on status */}
        <div className="flex flex-col gap-3 mt-6 shrink-0">
          
          {os.status === 'AGUARDANDO INICIO' && (
            <>
              <button 
                onClick={() => handleUpdate('PAGO')}
                className="w-full bg-[#34C759] hover:opacity-90 active:opacity-70 transition-all text-white font-semibold py-4 px-4 rounded-[20px] shadow-[0_8px_20px_rgba(52,199,89,0.25)] text-[17px]"
              >
                Marcar como Pago
              </button>
              <button 
                onClick={() => handleUpdate('PENDENTES')}
                className="w-full bg-[#FF9500] hover:opacity-90 active:opacity-70 transition-all text-white font-semibold py-4 px-4 rounded-[20px] shadow-[0_8px_20px_rgba(255,149,0,0.25)] text-[17px]"
              >
                Mover para Pendente
              </button>
            </>
          )}

          {os.status === 'PENDENTES' && (
            <>
              <button 
                onClick={() => handleUpdate('PAGO')}
                className="w-full bg-[#34C759] hover:opacity-90 active:opacity-70 transition-all text-white font-semibold py-4 px-4 rounded-[20px] shadow-sm text-[17px]"
              >
                Pagamento Recebido
              </button>
              <button 
                onClick={() => setShowPixModal(true)}
                className="w-full bg-[#007AFF] text-white hover:opacity-90 active:opacity-70 transition-all font-semibold py-4 px-4 rounded-[20px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] text-[17px] flex items-center justify-center gap-2"
              >
                <QrCode size={20} />
                Gerar Cobrança Pix
              </button>
              <button 
                onClick={handleWhatsappCobrar}
                className="w-full bg-[#E5E5EA] text-gray-800 hover:opacity-90 active:opacity-70 transition-all font-semibold py-4 px-4 rounded-[20px] shadow-sm text-[17px]"
              >
                Cobrar Simples via WhatsApp
              </button>
            </>
          )}

          {os.status === 'PAGO' && (
            <>
              {showWarrantyModal ? (
                <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-[20px] border border-gray-200">
                  <p className="text-gray-900 text-[15px] font-semibold text-center mb-1">Selecione o prazo de garantia:</p>
                  <div className="flex gap-2">
                    <button onClick={() => generateAndSendWarranty(30)} className="flex-1 bg-white border border-gray-200 hover:opacity-90 active:opacity-70 transition-all text-[#007AFF] font-semibold py-3 px-2 rounded-[16px] shadow-sm text-sm">30 Dias</button>
                    <button onClick={() => generateAndSendWarranty(60)} className="flex-1 bg-white border border-gray-200 hover:opacity-90 active:opacity-70 transition-all text-[#007AFF] font-semibold py-3 px-2 rounded-[16px] shadow-sm text-sm">60 Dias</button>
                    <button onClick={() => generateAndSendWarranty(90)} className="flex-1 bg-white border border-gray-200 hover:opacity-90 active:opacity-70 transition-all text-[#007AFF] font-semibold py-3 px-2 rounded-[16px] shadow-sm text-sm">90 Dias</button>
                  </div>
                  <button onClick={() => setShowWarrantyModal(false)} className="mt-1 w-full bg-transparent text-gray-500 font-semibold py-2 text-sm uppercase tracking-wide">Cancelar</button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    if (!userProfile.planoAtivo) {
                      alert("Acesso restrito. Assine um plano para gerar garantias.");
                      return;
                    }
                    setShowWarrantyModal(true);
                  }}
                  className="w-full bg-[#E5E5EA] text-gray-800 hover:opacity-90 active:opacity-70 transition-all font-semibold py-4 px-4 rounded-[20px] shadow-sm text-[17px]"
                >
                  Gerar Garantia
                </button>
              )}
            </>
          )}

          {/* Delete action always available at the bottom */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            {isConfirmingDelete ? (
              <div className="flex flex-col gap-2 p-4 bg-red-50 rounded-[20px] border border-red-100 animate-in fade-in duration-150">
                <p className="text-red-800 text-sm font-semibold text-center mb-1">Tem certeza que deseja excluir esta ordem?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsConfirmingDelete(false)}
                    className="flex-1 bg-white border border-red-200 hover:opacity-90 active:opacity-70 transition-all text-red-700 font-semibold py-3 px-4 rounded-[16px] shadow-sm text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      deleteOS(os.id);
                      setScreen('LISTA_OS', { statusFilter: os.status });
                    }}
                    className="flex-1 bg-[#FF3B30] hover:opacity-90 active:opacity-70 transition-all text-white font-semibold py-3 px-4 rounded-[16px] shadow-sm text-sm"
                  >
                    Sim, Excluir
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => {
                  if (!userProfile.planoAtivo) {
                    alert("Acesso restrito. Assine um plano para excluir serviços.");
                    return;
                  }
                  setIsConfirmingDelete(true);
                }}
                className="w-full bg-red-50 hover:bg-red-100 text-[#FF3B30] hover:text-red-700 font-semibold py-3.5 px-4 rounded-[20px] transition-all text-[15px] flex items-center justify-center gap-1.5 border border-red-100/50"
              >
                Excluir Ordem de Serviço
              </button>
            )}
          </div>

        </div>
      </div>
      {showPixModal && (
        <PixModal 
          os={os} 
          onClose={() => setShowPixModal(false)} 
          userProfile={userProfile} 
          setScreen={setScreen} 
        />
      )}
    </div>
  );
}

function PixModal({ os, onClose, userProfile, setScreen }: { os: any, onClose: () => void, userProfile: any, setScreen: any }) {
  const [copied, setCopied] = useState(false);
  const hasPixKey = !!userProfile.chavePix?.trim();

  const pixCode = hasPixKey
    ? generatePixPayload(userProfile.chavePix, os.preco, userProfile.nomeEmpresa || 'FINAX')
    : '';

  const handleCopy = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsapp = () => {
    if (!pixCode) return;
    const cleanPrice = os.preco.toFixed(2).replace('.', ',');
    const text = `Olá, ${os.cliente}! 😊

Para facilitar o pagamento do seu serviço de *${os.servico}* no valor de *R$ ${cleanPrice}*, você pode realizar o pagamento via Pix utilizando a chave ou o código Copia e Cola abaixo:

🔑 *Chave Pix:* ${userProfile.chavePix}

📋 *Pix Copia e Cola:*
${pixCode}

Depois de pagar, se puder me enviar o comprovante por aqui, agradeço bastante!

Muito obrigado!`;

    const phone = os.contato || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 11 || cleanPhone.length === 10 ? `55${cleanPhone}` : cleanPhone;

    const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 p-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Cobrança Pix</span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
            <X size={18} />
          </button>
        </div>

        {!hasPixKey ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-500 border border-amber-100 animate-pulse">
              <AlertCircle size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Chave Pix não cadastrada</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 px-2">
              Para gerar cobranças Pix automáticas e QR Codes com o valor exato, cadastre sua Chave Pix nas configurações da sua empresa.
            </p>
            <button
              onClick={() => {
                onClose();
                setScreen('AJUSTES');
              }}
              className="w-full bg-[#007AFF] hover:bg-[#0056D6] text-white font-semibold py-3.5 px-6 rounded-[18px] text-[15px] transition-all shadow-md shadow-blue-500/10"
            >
              Cadastrar Chave Pix
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* QR Code Container */}
            <div className="w-44 h-44 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-3 mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)] relative group">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode)}`}
                alt="QR Code Pix"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center mb-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Valor a Receber</span>
              <span className="text-2xl font-black text-[#34C759] tracking-tight">{formatCurrency(os.preco)}</span>
              <span className="text-xs text-gray-400 block mt-1">Chave: <span className="font-semibold text-gray-600">{userProfile.chavePix}</span></span>
            </div>

            {/* Pix Copia e Cola box */}
            <div className="w-full bg-gray-50 rounded-2xl border border-gray-100 p-3.5 mb-5 flex flex-col gap-1.5 relative">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Pix Copia e Cola</span>
              <div className="text-xs text-gray-600 font-mono break-all line-clamp-2 pr-8 select-all select-none bg-transparent outline-none">
                {pixCode}
              </div>
              <button
                onClick={handleCopy}
                className="absolute right-3.5 bottom-3.5 p-2 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all text-gray-500 hover:text-[#007AFF] shadow-sm"
                title="Copiar Pix"
              >
                {copied ? <Check size={14} className="text-[#34C759]" /> : <Copy size={14} />}
              </button>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={handleSendWhatsapp}
                className="w-full bg-[#25D366] hover:opacity-90 active:opacity-75 text-white font-bold py-3.5 px-4 rounded-[18px] text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,211,102,0.15)] transition-all"
              >
                <Send size={16} />
                Enviar por WhatsApp
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-100/80 text-gray-800 font-semibold py-3 px-4 rounded-[18px] text-[14px] transition-all"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
