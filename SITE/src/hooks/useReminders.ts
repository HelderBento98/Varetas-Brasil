import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lembrete } from '../types';

function mapReminder(row: any): Lembrete {
  return {
    id: row.id,
    descricao: row.descricao || '',
    horario: row.horario,
    data: row.data,
    celular: row.celular || undefined,
    notificado: row.notificado,
  };
}

export function useReminders(companyId: string | null) {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!companyId) {
      setLembretes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Falha ao carregar lembretes', error);
      setLembretes([]);
    } else {
      setLembretes((data || []).map(mapReminder));
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const addLembrete = useCallback(
    async (lembreteData: Omit<Lembrete, 'id'>) => {
      if (!companyId) return;
      const tempId = `temp-${Date.now()}`;
      const optimistic: Lembrete = { ...lembreteData, id: tempId, notificado: false };
      setLembretes(prev => [...prev, optimistic]);

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          company_id: companyId,
          descricao: lembreteData.descricao,
          data: lembreteData.data,
          horario: lembreteData.horario,
          celular: lembreteData.celular,
          notificado: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Falha ao salvar lembrete', error);
        setLembretes(prev => prev.filter(l => l.id !== tempId));
        alert('Não foi possível salvar o lembrete. Tente novamente.');
        return;
      }
      setLembretes(prev => prev.map(l => (l.id === tempId ? mapReminder(data) : l)));
    },
    [companyId]
  );

  const deleteLembrete = useCallback(async (id: string) => {
    const removed = lembretes.find(l => l.id === id);
    setLembretes(prev => prev.filter(l => l.id !== id));
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) {
      console.error('Falha ao excluir lembrete', error);
      if (removed) setLembretes(prev => [...prev, removed]);
    }
  }, [lembretes]);

  const markLembreteAsNotified = useCallback(async (id: string) => {
    setLembretes(prev => prev.map(l => (l.id === id ? { ...l, notificado: true } : l)));
    const { error } = await supabase.from('reminders').update({ notificado: true }).eq('id', id);
    if (error) console.error('Falha ao marcar lembrete como notificado', error);
  }, []);

  return { lembretes, loadingLembretes: loading, addLembrete, deleteLembrete, markLembreteAsNotified };
}
