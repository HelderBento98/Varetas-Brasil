import React, { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { Building2, KeyRound, LogOut } from 'lucide-react';

export function CompanyOnboardingScreen() {
  const { createCompany, joinCompany } = useCompany();
  const { signOut } = useAuth();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = mode === 'create' ? await createCompany(name) : await joinCompany(code);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F2F2F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center mb-3">
            <Building2 size={26} className="text-[#007AFF]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight text-center">Vamos configurar sua empresa</h1>
        </div>

        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'create' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            Criar empresa
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'join' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            Entrar com código
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'create' ? (
            <div className="flex flex-col border-b border-gray-200 pb-2 focus-within:border-[#007AFF] transition-colors">
              <label className="font-semibold text-gray-500 text-[11px] mb-1 uppercase tracking-wide">Nome da empresa</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 text-[16px] font-medium placeholder-gray-300"
                placeholder="Ex: Varetas Brasil"
              />
            </div>
          ) : (
            <div className="flex flex-col border-b border-gray-200 pb-2 focus-within:border-[#007AFF] transition-colors">
              <label className="font-semibold text-gray-500 text-[11px] mb-1 uppercase tracking-wide flex items-center gap-1.5">
                <KeyRound size={12} /> Código de convite
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full bg-transparent outline-none text-gray-900 text-[16px] font-medium placeholder-gray-300 tracking-widest"
                placeholder="EX: A1B2C3"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007AFF] hover:opacity-90 active:opacity-70 disabled:opacity-50 transition-all text-white font-semibold py-3.5 rounded-[18px] text-[16px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] mt-1"
          >
            {loading ? 'Aguarde...' : mode === 'create' ? 'Criar empresa' : 'Entrar na empresa'}
          </button>
        </form>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-1.5 text-gray-400 hover:text-gray-600 font-medium text-sm mt-5"
        >
          <LogOut size={14} /> Sair da conta
        </button>
      </div>
    </div>
  );
}
