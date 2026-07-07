# Varetas Brasil — Site Institucional

Landing page institucional da **Varetas Brasil**, fabricante de soluções
profissionais para desobstrução e saneamento (varetas em aço cromo-silício,
ponteiras, acessórios e kits completos).

Site **estático** (HTML + CSS + JavaScript puro), sem etapa de build e sem
dependências pesadas — pode ser aberto direto no navegador ou publicado no
GitHub Pages / Netlify / Vercel sem configuração.

## 📁 Estrutura

```
.
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos (Flexbox/Grid, variáveis CSS, animações)
├── js/
│   └── main.js         # Interações (menu, scroll reveal, header, etc.)
├── img/                # Imagens do site (ver img/README.md)
└── SITE/               # App React separado (sistema de OS) — não faz parte da landing page
```

## ✨ O que já está pronto

- **Layout moderno** com Flexbox e CSS Grid, responsivo (desktop, tablet e mobile).
- **Variáveis CSS** para a paleta verde/dourado e tipografia (Google Fonts — Montserrat).
- **Micro-interações em JS puro** (sem bibliotecas externas):
  - Animações de *scroll reveal* com `IntersectionObserver`.
  - Header que reage ao rolar a página (encolhe e ganha sombra).
  - Destaque automático do link da seção ativa no menu.
  - Hover elaborado nos cards de produto (elevação, zoom na imagem, barra dourada).
  - Botão flutuante de **WhatsApp** e botão **voltar ao topo**.
  - Menu mobile (hambúrguer).
  - Fallback visual quando uma imagem ainda não foi adicionada.
- Acessibilidade: respeita `prefers-reduced-motion` e usa `alt` nas imagens.

## 🖼️ Imagens

As imagens ficam na pasta `img/`. Enquanto os arquivos não são adicionados, o
site mostra um *placeholder* com a identidade visual no lugar de cada imagem
faltante. Veja a lista de arquivos esperados em [`img/README.md`](img/README.md).

## 🚀 Como visualizar localmente

Basta abrir o `index.html` no navegador. Para simular um servidor (recomendado):

```bash
# Python 3
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## 🌐 Publicar no GitHub Pages

1. Vá em **Settings → Pages**.
2. Em *Source*, selecione a branch e a pasta raiz (`/root`).
3. O site ficará disponível em `https://helderbento98.github.io/Varetas-Brasil/`.

## 🎨 Paleta

| Cor            | Hex       |
|----------------|-----------|
| Verde primário | `#003c2f` |
| Verde médio    | `#295148` |
| Dourado        | `#c09e79` |
| Cinza claro    | `#f5f5f3` |

## 🔜 Próximos passos sugeridos

- Adicionar as imagens reais na pasta `img/`.
- Criar as páginas internas de produto (`Seção_*.html`) ou transformá-las em
  um catálogo único.
- Configurar um formulário de contato/orçamento real.
- Adicionar `favicon` e imagens de compartilhamento (Open Graph).
