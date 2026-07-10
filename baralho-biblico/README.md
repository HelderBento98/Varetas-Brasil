# Baralho Bíblico — Web App

Adaptação digital do jogo de cartas **Baralho Bíblico**: adivinhe o personagem
da Bíblia pelas dicas, que vão da **mais difícil** para a **mais fácil**.

App 100% estático (HTML + CSS + JavaScript puro), sem dependências e pronto para
publicar no GitHub Pages. Funciona no celular e no computador; pode ser
"instalado" na tela inicial (PWA).

## Como funciona

- **97 personagens** (de Abraão a Zorobabel), cada um com 7 dicas e as
  referências bíblicas.
- **Pontuação por dicas usadas:** quanto antes acertar, mais pontos —
  1ª dica = 7 pontos, 2ª = 6 … 7ª = 1 ponto.

## Modos de jogo

| Modo | Descrição |
|------|-----------|
| **Sozinho** | Treino individual, carta por carta, com pontuação e acertos. |
| **Em grupo / equipes** | Um narrador lê as dicas; as equipes disputam os pontos. |
| **Individual (passa e joga)** | Cada jogador na sua vez, no mesmo aparelho. |

Nos modos em grupo e individual há um campo para cadastrar os **nomes dos
participantes ou equipes** (com cores automáticas).

## Arquivos

- `index.html` — estrutura das telas
- `css/app.css` — tema cinza/preto com azul-marinho
- `js/cards.js` — base das 97 cartas
- `js/app.js` — lógica dos modos, pontuação e placar
- `manifest.webmanifest` / `icon.svg` — suporte a PWA

## Rodar localmente

Abra `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8080
# acesse http://localhost:8080/baralho-biblico/
```

## Publicação

Com o GitHub Pages já ativo neste repositório, o jogo fica disponível em
`/baralho-biblico/`.
