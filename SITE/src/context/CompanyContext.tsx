import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Company, CompanyMember } from '../types';

interface CompanyRow {
  id: string;
  name: string;
  phone: string;
  cnpj: string;
  email: string;
  logo_url: string | null;
  pix_key: string | null;
  plano_ativo: 'mensal' | 'anual' | null;
  invite_code: string;
  created_at: string;
}

function mapCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    nomeEmpresa: row.name,
    telefone: row.phone || '',
    dataCriacao: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '',
    cnpj: row.cnpj || '',
    email: row.email || '',
    logo: row.logo_url || undefined,
    planoAtivo: row.plano_ativo,
    chavePix: row.pix_key || '',
    inviteCode: row.invite_code,
  };
}

interface Membership {
  role: 'owner' | 'member';
  company: Company;
}

interface CompanyContextType {
  memberships: Membership[];
  activeCompany: Company | null;
  role: 'owner' | 'member' | null;
  members: CompanyMember[];
  loading: boolean;
  createCompany: (name: string) => Promise<{ error: string | null }>;
  joinCompany: (code: string) => Promise<{ error: string | null }>;
  switchCompany: (companyId: string) => void;
  updateCompany: (fields: Partial<Company>) => Promise<void>;
  refresh: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const ACTIVE_COMPANY_KEY = 'gestao_active_company_id';

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => localStorage.getItem(ACTIVE_COMPANY_KEY));
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMemberships = useCallback(async () => {
    if (!user) {
      setMemberships([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('company_members')
      .select('role, companies(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Falha ao carregar empresas do usuário', error);
      setMemberships([]);
      setLoading(false);
      return;
    }

    const parsed: Membership[] = (data || [])
      .filter((row: any) => row.companies)
      .map((row: any) => ({ role: row.role, company: mapCompany(row.companies) }));

    setMemberships(parsed);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadMemberships();
  }, [loadMemberships]);

  useEffect(() => {
    if (memberships.length === 0) return;
    const stillValid = memberships.some(m => m.company.id === activeCompanyId);
    if (!stillValid) {
      setActiveCompanyId(memberships[0].company.id);
    }
  }, [memberships, activeCompanyId]);

  const activeMembership = memberships.find(m => m.company.id === activeCompanyId) || null;

  const loadMembers = useCallback(async (companyId: string) => {
    const { data, error } = await supabase
      .from('company_members')
      .select('id, user_id, email, role')
      .eq('company_id', companyId);

    if (error) {
      console.error('Falha ao carregar membros da empresa', error);
      setMembers([]);
      return;
    }

    setMembers((data || []).map(row => ({ id: row.id, userId: row.user_id, email: row.email, role: row.role })));
  }, []);

  useEffect(() => {
    if (activeMembership) {
      loadMembers(activeMembership.company.id);
    } else {
      setMembers([]);
    }
  }, [activeMembership, loadMembers]);

  const switchCompany = (companyId: string) => {
    setActiveCompanyId(companyId);
    localStorage.setItem(ACTIVE_COMPANY_KEY, companyId);
  };

  const createCompany = async (name: string) => {
    const { data, error } = await supabase.rpc('create_company', { company_name: name });
    if (error) return { error: error.message };
    await loadMemberships();
    if (data) switchCompany((data as CompanyRow).id);
    return { error: null };
  };

  const joinCompany = async (code: string) => {
    const { data, error } = await supabase.rpc('join_company', { code });
    if (error) return { error: 'Código de convite inválido.' };
    await loadMemberships();
    if (data) switchCompany((data as CompanyRow).id);
    return { error: null };
  };

  const updateCompany = async (fields: Partial<Company>) => {
    if (!activeCompany) return;
    const payload: Record<string, unknown> = {};
    if (fields.nomeEmpresa !== undefined) payload.name = fields.nomeEmpresa;
    if (fields.telefone !== undefined) payload.phone = fields.telefone;
    if (fields.cnpj !== undefined) payload.cnpj = fields.cnpj;
    if (fields.email !== undefined) payload.email = fields.email;
    if (fields.logo !== undefined) payload.logo_url = fields.logo;
    if (fields.chavePix !== undefined) payload.pix_key = fields.chavePix;
    if (fields.planoAtivo !== undefined) payload.plano_ativo = fields.planoAtivo;

    const { error } = await supabase.from('companies').update(payload).eq('id', activeCompany.id);
    if (error) {
      console.error('Falha ao atualizar empresa', error);
      return;
    }
    await loadMemberships();
  };

  const activeCompany = activeMembership?.company ?? null;

  return (
    <CompanyContext.Provider
      value={{
        memberships,
        activeCompany,
        role: activeMembership?.role ?? null,
        members,
        loading,
        createCompany,
        joinCompany,
        switchCompany,
        updateCompany,
        refresh: loadMemberships,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
