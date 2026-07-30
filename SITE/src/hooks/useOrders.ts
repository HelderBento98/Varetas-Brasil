import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { OrdemServico, StatusOS } from '../types';

function mapOrder(row: any): OrdemServico {
  return {
    id: row.id,
    numero: row.numero,
    cliente: row.cliente || '',
    servico: row.servico || '',
    preco: Number(row.preco) || 0,
    formaPagamento: row.forma_pagamento || '',
    contato: row.contato || '',
    dataOrcamento: row.data_orcamento,
    validadeOrcamento: row.validade_orcamento || undefined,
    status: row.status,
  };
}

export function useOrders(companyId: string | null) {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!companyId) {
      setOrdens([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Falha ao carregar ordens', error);
      setOrdens([]);
    } else {
      setOrdens((data || []).map(mapOrder));
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const addOS = useCallback(
    async (osData: Omit<OrdemServico, 'id' | 'numero'>) => {
      if (!companyId) return;

      const [, mesStr, anoStr] = osData.dataOrcamento.split('/');
      const month = parseInt(mesStr, 10) - 1;
      const year = parseInt(anoStr, 10);

      const ordensDoMes = ordens.filter(os => {
        const [, m, a] = os.dataOrcamento.split('/');
        return parseInt(m, 10) - 1 === month && parseInt(a, 10) === year;
      });
      const maxNum = ordensDoMes.reduce((max, os) => {
        const match = os.numero.match(/\d+/);
        const num = match ? parseInt(match[0], 10) : 0;
        return num > max ? num : max;
      }, 0);
      const numero = `Nº${(maxNum + 1).toString().padStart(2, '0')}`;

      const tempId = `temp-${Date.now()}`;
      const optimistic: OrdemServico = { ...osData, id: tempId, numero };
      setOrdens(prev => [optimistic, ...prev]);

      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('orders')
        .insert({
          company_id: companyId,
          numero,
          cliente: osData.cliente,
          servico: osData.servico,
          preco: osData.preco,
          forma_pagamento: osData.formaPagamento,
          contato: osData.contato,
          data_orcamento: osData.dataOrcamento,
          validade_orcamento: osData.validadeOrcamento,
          status: osData.status,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Falha ao salvar ordem', error);
        setOrdens(prev => prev.filter(os => os.id !== tempId));
        alert('Não foi possível salvar. Verifique sua conexão e tente novamente.');
        return;
      }
      setOrdens(prev => prev.map(os => (os.id === tempId ? mapOrder(data) : os)));
    },
    [companyId, ordens]
  );

  const updateOSStatus = useCallback(async (id: string, newStatus: StatusOS) => {
    setOrdens(prev => prev.map(os => (os.id === id ? { ...os, status: newStatus } : os)));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) {
      console.error('Falha ao atualizar status', error);
      load();
    }
  }, [load]);

  const deleteOS = useCallback(async (id: string) => {
    const removed = ordens.find(os => os.id === id);
    setOrdens(prev => prev.filter(os => os.id !== id));
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('Falha ao excluir ordem', error);
      if (removed) setOrdens(prev => [removed, ...prev]);
      alert('Não foi possível excluir. Tente novamente.');
    }
  }, [ordens]);

  return { ordens, loadingOrdens: loading, addOS, updateOSStatus, deleteOS };
}
