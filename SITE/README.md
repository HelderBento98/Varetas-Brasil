# Gestão Empresarial — Varetas Brasil

Sistema de gestão empresarial (estilo Conta Azul), em construção por fases.

**Fase 1 (atual):** autenticação multiusuário, estrutura multi-empresa
(multi-tenant) e o módulo de **Vendas/Orçamentos**. Os módulos
**Financeiro**, **Estoque** e **Notas Fiscais** aparecem como "Em breve" no
menu — serão implementados nas próximas fases.

Stack: React 19 + Vite + TypeScript + Tailwind, com [Supabase](https://supabase.com)
como backend (banco de dados Postgres + autenticação).

## Como rodar localmente

### 1. Criar o projeto no Supabase (gratuito)

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto.
2. No painel do projeto, vá em **SQL Editor → New query**, cole todo o
   conteúdo do arquivo [`supabase/schema.sql`](supabase/schema.sql) e rode.
   Isso cria as tabelas, políticas de segurança (RLS) e funções necessárias.
3. Vá em **Project Settings → API** e copie a **Project URL** e a
   **anon public key**.

### 2. Configurar as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e preencha com os valores copiados do Supabase:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Crie uma conta, crie sua empresa e comece a
usar. Para adicionar colegas de equipe, compartilhe o **código de convite**
disponível em *Configurações → Equipe* — eles se cadastram e entram usando
esse código.

## Estrutura

```
src/
├── context/         # Auth (sessão) e Company (empresa ativa, multi-tenant)
├── lib/supabase.ts  # Cliente Supabase
├── hooks/           # useOrders, useReminders (dados vindos do Supabase)
├── components/       
│   ├── DashboardLayout.tsx  # Sidebar com os módulos (Vendas, Financeiro...)
│   └── VendasApp.tsx        # App de Vendas/Orçamentos (Home, Histórico...)
├── screens/         # Telas de cada módulo
└── store.tsx        # Fachada usada pelas telas (useStore())
supabase/
└── schema.sql       # Schema do banco (rodar uma vez no Supabase)
```

## Notas e limitações desta fase

- O logotipo da empresa é salvo como imagem embutida (base64) diretamente no
  banco. Para empresas com times maiores, migrar para o **Supabase Storage**
  é uma melhoria recomendada antes de escalar.
- Não há envio de e-mail: o convite de equipe é feito por código, não por
  e-mail transacional.
- Todo o isolamento entre empresas é garantido por Row Level Security (RLS)
  no Postgres — cada empresa só enxerga seus próprios dados.
