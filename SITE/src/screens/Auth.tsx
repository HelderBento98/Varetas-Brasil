import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Building2 } from 'lucide-react';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password);

    if (result.error) {
      setError(result.error);
    } else if (mode === 'signup') {
      setInfo('Conta criada! Se a confirmação por e-mail estiver ativa no seu projeto Supabase, verifique sua caixa de entrada antes de entrar.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F2F2F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center mb-3">
            <Building2 size={26} className="text-[#007AFF]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Gestão Empresarial</h1>
          <p className="text-gray-400 text-sm mt-1 text-center">
            {mode === 'login' ? 'Entre para acessar sua empresa' : 'Crie sua conta para começar'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
            Supabase ainda não configurado. Copie <code>.env.local.example</code> para <code>.env.local</code> e preencha suas credenciais.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col border-b border-gray-200 pb-2 focus-within:border-[#007AFF] transition-colors">
            <label className="font-semibold text-gray-500 text-[11px] mb-1 uppercase tracking-wide">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-900 text-[16px] font-medium placeholder-gray-300"
              placeholder="voce@empresa.com"
            />
          </div>
          <div className="flex flex-col border-b border-gray-200 pb-2 focus-within:border-[#007AFF] transition-colors">
            <label className="font-semibold text-gray-500 text-[11px] mb-1 uppercase tracking-wide">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-900 text-[16px] font-medium placeholder-gray-300"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          {info && <p className="text-[#34C759] text-sm font-medium">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007AFF] hover:opacity-90 active:opacity-70 disabled:opacity-50 transition-all text-white font-semibold py-3.5 rounded-[18px] text-[16px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] mt-1"
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError(null);
            setInfo(null);
          }}
          className="w-full text-center text-[#007AFF] font-semibold text-sm mt-5"
        >
          {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  );
}
