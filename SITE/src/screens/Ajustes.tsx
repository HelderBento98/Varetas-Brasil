import React, { useRef, useState } from 'react';
import { Check, Star, X, Crown, Headset, Image as ImageIcon, Shield, ChevronRight, Database, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { useStore } from '../store';

export function AjustesScreen() {
  const { userProfile, updateUserProfile, ordens, lembretes } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [logoMenuOpen, setLogoMenuOpen] = useState(false);
  const [privacidadeOpen, setPrivacidadeOpen] = useState(false);
  const [planoOpen, setPlanoOpen] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUserProfile({ [e.target.name]: e.target.value });
  };

  const handleExportCSV = () => {
    if (!userProfile.planoAtivo) {
      alert("Acesso restrito. Assine um plano para exportar dados.");
      return;
    }
    const header = ['ID', 'Cliente', 'Servico', 'Preco (R$)', 'Forma de Pagamento', 'Contato', 'Data', 'Status'];
    const rows = ordens.map(os => [
      os.id,
      `"${(os.cliente || '').replace(/"/g, '""')}"`,
      `"${(os.servico || '').replace(/"/g, '""')}"`,
      os.preco.toString().replace('.', ','),
      os.formaPagamento,
      os.contato,
      os.dataOrcamento,
      os.status
    ]);
    
    const csvContent = "\uFEFF" + [header.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Finax_Ordens_Servico_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBackup = () => {
    if (!userProfile.planoAtivo) {
      alert("Acesso restrito. Assine um plano para exportar backups.");
      return;
    }
    const backupData = {
      version: '1.0',
      ordens: ordens,
      lembretes: lembretes || [],
      userProfile: userProfile
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `Finax_Backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userProfile.planoAtivo) {
      alert("Acesso restrito. Assine um plano para importar backups.");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && (Array.isArray(parsed.ordens) || parsed.userProfile)) {
            const mergedOrdens = parsed.ordens || [];
            const mergedUserProfile = parsed.userProfile || {};
            const mergedLembretes = parsed.lembretes || [];
            
            localStorage.setItem('osManagerData', JSON.stringify({
              ordens: mergedOrdens,
              userProfile: mergedUserProfile,
              lembretes: mergedLembretes
            }));
            
            alert('Backup importado com sucesso! O aplicativo será recarregado para aplicar as alterações.');
            window.location.reload();
          } else {
            alert('Formato de backup inválido.');
          }
        } catch (err) {
          alert('Erro ao processar o arquivo de backup.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          updateUserProfile({ logo: reader.result as string });
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor, selecione um arquivo de imagem válido.');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 pb-6 animate-in fade-in slide-in-from-left-4 duration-300 gap-4">
      
      {/* Informações da Empresa */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col min-h-0 shrink-0">
        <div className="flex justify-center items-center mb-4 border-b border-gray-100/50 pb-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Informações</h2>
        </div>
        <div className="flex flex-col gap-5 overflow-visible">
          <SettingsInput label="NOME DA EMPRESA" name="nomeEmpresa" value={userProfile.nomeEmpresa} onChange={handleChange} />
          <SettingsInput label="TELEFONE" name="telefone" value={userProfile.telefone} onChange={handleChange} />
          <SettingsInput label="DATA CRIAÇÃO" name="dataCriacao" value={userProfile.dataCriacao} onChange={handleChange} />
          <SettingsInput label="CNPJ" name="cnpj" value={userProfile.cnpj} onChange={handleChange} />
          <SettingsInput label="E-MAIL" name="email" value={userProfile.email} onChange={handleChange} />
          <SettingsInput label="CHAVE PIX" name="chavePix" value={userProfile.chavePix || ''} onChange={handleChange} />
        </div>
      </div>

      {/* Menu de Ações (Estilo iOS List) */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col overflow-hidden shrink-0 mt-2">
        <button 
          onClick={() => setPlanoOpen(true)}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <Crown size={16} className="text-purple-600" />
          </div>
          <span className="flex-1 font-medium text-gray-900 text-[16px]">Meu Plano</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          onClick={() => setLogoMenuOpen(true)}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <ImageIcon size={16} className="text-blue-600" />
          </div>
          <span className="flex-1 font-medium text-gray-900 text-[16px]">Logotipo da Empresa</span>
          <ChevronRight size={18} className="text-gray-400" />
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            className="hidden" 
          />
        </button>

        <button 
          onClick={() => alert("Suporte Técnico em breve!")}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Headset size={16} className="text-orange-600" />
          </div>
          <span className="flex-1 font-medium text-gray-900 text-[16px]">Suporte Técnico</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          onClick={() => setPrivacidadeOpen(true)}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-green-600" />
          </div>
          <span className="flex-1 font-medium text-gray-900 text-[16px]">Segurança e Privacidade</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <FileSpreadsheet size={16} className="text-emerald-600" />
          </div>
          <span className="flex-1 font-medium text-gray-900 text-[16px]">Exportar Planilha</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          onClick={handleExportBackup}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Download size={16} className="text-indigo-600" />
          </div>
          <span className="flex-1 font-medium text-gray-900 text-[16px]">Exportar Backup</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          onClick={() => importInputRef.current?.click()}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <Upload size={16} className="text-teal-600" />
          </div>
          <span className="flex-1 font-medium text-gray-900 text-[16px]">Importar Backup</span>
          <ChevronRight size={18} className="text-gray-400" />
          <input 
            type="file" 
            accept=".json" 
            ref={importInputRef} 
            onChange={handleImportBackup} 
            className="hidden" 
          />
        </button>
      </div>

      {planoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setPlanoOpen(false); setShowConfirmCancel(false); }} />
          <div className="bg-white rounded-[24px] w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="p-6 pb-6">
              <div className="flex justify-end mb-4">
                <button onClick={() => { setPlanoOpen(false); setShowConfirmCancel(false); }} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              {!showConfirmCancel ? (
              <div className="flex flex-col gap-4">
                {/* Mensal */}
                <button 
                  onClick={() => {
                    updateUserProfile({ planoAtivo: 'mensal' });
                  }}
                  className={`relative p-5 rounded-[20px] border-2 text-left transition-all ${
                    userProfile.planoAtivo === 'mensal' 
                      ? 'border-[#007AFF] bg-blue-50/30' 
                      : 'border-gray-100 bg-white hover:border-gray-200 active:bg-gray-50'
                  }`}
                >
                  {userProfile.planoAtivo === 'mensal' && (
                    <div className="absolute top-0 right-0 bg-[#007AFF] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-[18px]">
                      Plano Ativo
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900 text-[18px]">Mensal</span>
                    <div className="w-[22px] h-[22px] rounded-full border-2 border-gray-200 flex items-center justify-center bg-white transition-colors" style={userProfile.planoAtivo === 'mensal' ? { borderColor: '#007AFF', backgroundColor: '#007AFF' } : {}}>
                      {userProfile.planoAtivo === 'mensal' && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <div className="text-gray-500 text-[14px]">Assinatura cobrada mensalmente</div>
                  <div className="mt-3 font-bold text-gray-900 text-2xl">R$ 4,90<span className="text-sm text-gray-400 font-medium">/mês</span></div>
                </button>

                {/* Anual */}
                <button 
                  onClick={() => {
                    updateUserProfile({ planoAtivo: 'anual' });
                  }}
                  className={`relative p-5 rounded-[20px] border-2 text-left transition-all ${
                    userProfile.planoAtivo === 'anual' 
                      ? 'border-[#007AFF] bg-blue-50/30' 
                      : 'border-gray-100 bg-white hover:border-gray-200 active:bg-gray-50'
                  }`}
                >
                  {userProfile.planoAtivo === 'anual' && (
                    <div className="absolute top-0 right-0 bg-[#007AFF] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-[18px]">
                      Plano Ativo
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900 text-[18px]">Anual</span>
                    <div className="w-[22px] h-[22px] rounded-full border-2 border-gray-200 flex items-center justify-center bg-white transition-colors" style={userProfile.planoAtivo === 'anual' ? { borderColor: '#007AFF', backgroundColor: '#007AFF' } : {}}>
                      {userProfile.planoAtivo === 'anual' && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <div className="text-gray-500 text-[14px]">Economize 15% pagando o ano</div>
                  <div className="mt-3 font-bold text-gray-900 text-2xl">R$ 49,90<span className="text-sm text-gray-400 font-medium">/ano</span></div>
                </button>
              </div>
              ) : (
                <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Cancelar assinatura?</h4>
                  <p className="text-gray-600 text-sm mb-6">
                    Tem certeza que deseja cancelar sua assinatura atual? Você perderá o acesso aos benefícios exclusivos.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        updateUserProfile({ planoAtivo: null });
                        setShowConfirmCancel(false);
                      }}
                      className="bg-red-500 text-white font-semibold py-3 px-4 rounded-[16px] hover:opacity-90 active:opacity-70 transition-opacity duration-200"
                    >
                      Sim, quero cancelar
                    </button>
                    <button 
                      onClick={() => setShowConfirmCancel(false)}
                      className="bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-[16px] hover:opacity-90 active:opacity-70 transition-opacity duration-200"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {(!showConfirmCancel && (userProfile.planoAtivo === 'mensal' || userProfile.planoAtivo === 'anual')) && (
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center">
                <button 
                  onClick={() => setShowConfirmCancel(true)}
                  className="text-red-500 text-[15px] font-semibold active:opacity-70 px-4 py-2"
                >
                  Cancelar assinatura atual
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {logoMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => setLogoMenuOpen(false)} />
          <div className="p-4 flex flex-col gap-2 relative animate-in slide-in-from-bottom-full duration-300 pb-8">
            <div className="bg-white/90 backdrop-blur-xl rounded-[14px] overflow-hidden flex flex-col">
              <button 
                onClick={() => {
                  setLogoMenuOpen(false);
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="text-[#007AFF] text-[17px] py-[14px] font-normal border-b border-gray-200/60 active:bg-gray-100"
              >
                Fazer upload
              </button>
              <button 
                onClick={() => {
                  setLogoMenuOpen(false);
                  updateUserProfile({ logo: undefined });
                }}
                className="text-red-500 text-[17px] py-[14px] font-normal active:bg-gray-100"
              >
                Excluir foto
              </button>
            </div>
            <button 
              onClick={() => setLogoMenuOpen(false)}
              className="bg-white rounded-[14px] text-[#007AFF] text-[17px] py-[14px] font-semibold active:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {privacidadeOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom-full duration-300">
          <div className="flex items-center justify-between px-6 pt-12 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Política de Privacidade</h2>
            <button 
              onClick={() => setPrivacidadeOpen(false)}
              className="text-[#007AFF] font-semibold text-[17px] active:opacity-70"
            >
              Fechar
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 text-gray-700 text-[15px] space-y-6 pb-20">
            <p>
              A FINAX – Gerenciador Empresarial valoriza a privacidade e a proteção dos dados de seus usuários. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos, protegemos e compartilhamos informações quando você utiliza nossos serviços.
            </p>
            <p>
              Ao criar uma conta ou utilizar o FINAX, você declara que leu, compreendeu e concorda com os termos desta Política.
            </p>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">1. SOBRE O FINAX</h3>
              <p>O FINAX é uma plataforma de gestão empresarial destinada a auxiliar empresas, profissionais autônomos e prestadores de serviços na administração de clientes, orçamentos, ordens de serviço, pagamentos, recebimentos, agenda, relatórios e demais atividades relacionadas à gestão de negócios.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">2. DADOS COLETADOS</h3>
              <p className="mb-2 font-semibold">Dados de cadastro</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Nome;</li>
                <li>E-mail;</li>
                <li>Telefone;</li>
                <li>Nome da empresa;</li>
                <li>CPF ou CNPJ;</li>
                <li>Endereço comercial;</li>
                <li>Informações de login.</li>
              </ul>
              
              <p className="mb-2 font-semibold">Dados inseridos pelo usuário</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Cadastro de clientes;</li>
                <li>Ordens de serviço;</li>
                <li>Orçamentos;</li>
                <li>Relatórios;</li>
                <li>Agenda;</li>
                <li>Histórico de atendimentos;</li>
                <li>Informações financeiras;</li>
                <li>Observações e anotações;</li>
                <li>Arquivos, imagens e documentos enviados à plataforma.</li>
              </ul>

              <p className="mb-2 font-semibold">Dados coletados automaticamente</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Endereço IP;</li>
                <li>Modelo do dispositivo;</li>
                <li>Sistema operacional;</li>
                <li>Data e horário de acesso;</li>
                <li>Versão do aplicativo;</li>
                <li>Informações técnicas necessárias para segurança e funcionamento da plataforma.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">3. FINALIDADE DO USO DOS DADOS</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Permitir o acesso e utilização do sistema;</li>
                <li>Gerenciar contas de usuários;</li>
                <li>Armazenar informações empresariais cadastradas;</li>
                <li>Gerar relatórios e indicadores;</li>
                <li>Melhorar funcionalidades e desempenho da plataforma;</li>
                <li>Garantir a segurança dos usuários;</li>
                <li>Realizar suporte técnico;</li>
                <li>Cumprir obrigações legais e regulatórias;</li>
                <li>Prevenir fraudes e atividades ilícitas.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">4. DADOS DE CLIENTES CADASTRADOS PELO USUÁRIO</h3>
              <p className="mb-2">O FINAX permite que o usuário cadastre informações de seus próprios clientes.</p>
              <p className="mb-2">O usuário declara ser o legítimo responsável pela coleta e utilização dessas informações, comprometendo-se a observar a legislação aplicável, incluindo a Lei Geral de Proteção de Dados (LGPD).</p>
              <p>O FINAX atua exclusivamente como ferramenta tecnológica para armazenamento, organização e processamento das informações cadastradas pelo usuário.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">5. COMPARTILHAMENTO DE DADOS</h3>
              <p className="mb-2">O FINAX não vende, aluga ou comercializa dados pessoais.</p>
              <p className="mb-2">As informações poderão ser compartilhadas apenas:</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Quando houver obrigação legal;</li>
                <li>Mediante determinação judicial;</li>
                <li>Com prestadores de serviços necessários para o funcionamento da plataforma, como hospedagem, armazenamento em nuvem e processamento de pagamentos;</li>
                <li>Em situações necessárias para proteção dos direitos do FINAX ou de seus usuários.</li>
              </ul>
              <p>Todos os parceiros contratados são obrigados a adotar medidas adequadas de proteção dos dados.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">6. SEGURANÇA DAS INFORMAÇÕES</h3>
              <p className="mb-2">Empregamos medidas técnicas e administrativas adequadas para proteger os dados armazenados, incluindo:</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Criptografia quando aplicável;</li>
                <li>Controle de acesso;</li>
                <li>Autenticação de usuários;</li>
                <li>Monitoramento de atividades suspeitas;</li>
                <li>Backups periódicos;</li>
                <li>Atualizações de segurança.</li>
              </ul>
              <p>Apesar dos esforços empregados, nenhum sistema é totalmente imune a falhas, ataques ou acessos não autorizados.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">7. ARMAZENAMENTO E RETENÇÃO DOS DADOS</h3>
              <p className="mb-2">Os dados permanecerão armazenados enquanto forem necessários para a prestação dos serviços ou para cumprimento de obrigações legais.</p>
              <p>Após o encerramento da conta, determinadas informações poderão ser mantidas pelo prazo exigido pela legislação aplicável ou para resguardo de direitos do FINAX.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">8. DIREITOS DOS USUÁRIOS</h3>
              <p className="mb-2">Nos termos da legislação vigente, o usuário poderá solicitar:</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Confirmação da existência de tratamento de dados;</li>
                <li>Acesso aos dados armazenados;</li>
                <li>Correção de informações incorretas;</li>
                <li>Atualização de dados desatualizados;</li>
                <li>Exclusão de dados quando legalmente possível;</li>
                <li>Revogação de consentimentos concedidos;</li>
                <li>Informações sobre compartilhamento de dados.</li>
              </ul>
              <p>As solicitações poderão ser realizadas pelos canais de atendimento disponibilizados pelo FINAX.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">9. RESPONSABILIDADES DO USUÁRIO</h3>
              <p className="mb-2">Ao utilizar o FINAX, o usuário compromete-se a:</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Fornecer informações verdadeiras e atualizadas;</li>
                <li>Manter a confidencialidade de sua senha;</li>
                <li>Não compartilhar credenciais de acesso com terceiros não autorizados;</li>
                <li>Utilizar a plataforma de forma lícita;</li>
                <li>Possuir autorização legal para inserir dados de terceiros no sistema.</li>
              </ul>
              <p>O usuário é integralmente responsável pelas informações cadastradas em sua conta.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">10. RESPONSABILIDADES DO FINAX</h3>
              <p className="mb-2">O FINAX compromete-se a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Adotar medidas razoáveis de segurança para proteção dos dados;</li>
                <li>Tratar as informações de acordo com esta Política;</li>
                <li>Empregar esforços para manter a disponibilidade dos serviços;</li>
                <li>Atuar em conformidade com a legislação aplicável.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">11. LIMITAÇÃO DE RESPONSABILIDADE</h3>
              <p className="mb-2">O FINAX não será responsável por:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Informações inseridas incorretamente pelos usuários;</li>
                <li>Perda de dados decorrente de atos do próprio usuário;</li>
                <li>Compartilhamento voluntário de senhas ou acessos;</li>
                <li>Falhas decorrentes de serviços de terceiros;</li>
                <li>Problemas causados por vírus, malwares ou invasões ocorridas em dispositivos do usuário;</li>
                <li>Interrupções temporárias necessárias para manutenção ou atualização da plataforma.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">12. BACKUP E RECUPERAÇÃO DE DADOS</h3>
              <p className="mb-2">O FINAX poderá realizar backups automáticos para fins de segurança operacional.</p>
              <p>Contudo, recomenda-se que os usuários mantenham cópias próprias de documentos e informações consideradas essenciais para suas atividades empresariais.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">13. PROPRIEDADE INTELECTUAL</h3>
              <p className="mb-2">Todos os direitos relacionados ao FINAX, incluindo marca, logotipo, identidade visual, layout, funcionalidades, banco de dados e demais elementos da plataforma, pertencem exclusivamente aos seus proprietários.</p>
              <p>É proibida qualquer reprodução, cópia, distribuição, engenharia reversa ou utilização não autorizada desses elementos.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">14. EXCLUSÃO DA CONTA</h3>
              <p className="mb-2">O usuário poderá solicitar a exclusão de sua conta a qualquer momento.</p>
              <p>Após a solicitação, os dados poderão ser removidos, observadas as obrigações legais de retenção e os prazos necessários para resguardo de direitos.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">15. ALTERAÇÕES DESTA POLÍTICA</h3>
              <p className="mb-2">Esta Política poderá ser alterada a qualquer momento para refletir mudanças legais, técnicas ou operacionais.</p>
              <p>A versão mais atual estará sempre disponível dentro do aplicativo e/ou nos canais oficiais do FINAX.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">16. CONTATO</h3>
              <p>Para dúvidas, solicitações ou questões relacionadas à privacidade e proteção de dados, entre em contato pelos canais oficiais disponibilizados pelo FINAX.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SettingsInput = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
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
