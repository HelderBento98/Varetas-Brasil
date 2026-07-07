# 🚀 Guia de Publicação e SEO — Varetas Brasil

Passo a passo para colocar o site no ar em **www.varetasbr.com.br** e ajudar a
aparecer no Google. Tudo gratuito.

---

## 1. Publicar o site (GitHub Pages)

O código já está no GitHub. Para transformá-lo em site no ar:

1. Acesse **Settings → Pages** no repositório:
   `https://github.com/HelderBento98/Varetas-Brasil/settings/pages`
2. Em **Source**, escolha **Deploy from a branch**.
3. Selecione a branch onde está o site e a pasta **/ (root)** → **Save**.
4. Aguarde ~1 minuto. O site fica disponível numa URL `github.io`.

> Dica: o ideal é ter o site na branch **main**. Se precisar, me peça para
> preparar isso (abrir um Pull Request para a main).

## 2. Conectar o domínio www.varetasbr.com.br

O arquivo **CNAME** já está no projeto apontando para `www.varetasbr.com.br`.
Falta configurar o DNS no painel onde você registrou o domínio:

- Crie um registro **CNAME**: `www` → `helderbento98.github.io`
- (Opcional, para o domínio sem www) registros **A** apontando para os IPs do
  GitHub Pages:
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

Depois, em **Settings → Pages → Custom domain**, confirme `www.varetasbr.com.br`
e marque **Enforce HTTPS**.

> Se você preferir hospedar em outro serviço (Hostinger, Vercel, Netlify…),
> também funciona — o site é 100% estático (HTML/CSS/JS). É só subir os arquivos.

## 3. Google Search Console (indexação)

1. Acesse `https://search.google.com/search-console`
2. Adicione a propriedade **www.varetasbr.com.br** e verifique (o Search Console
   te dá as instruções — normalmente um registro DNS).
3. Em **Sitemaps**, envie: `sitemap.xml`
   (o site já tem esse arquivo pronto)

Isso avisa o Google que o site existe e acelera a indexação.

## 4. Perfil da Empresa no Google (o mais importante para o "local")

É o que faz a Varetas Brasil aparecer no **Google Maps** e nas buscas da região.

1. Acesse `https://business.google.com`
2. Crie o perfil com:
   - **Nome:** Varetas Brasil
   - **Categoria:** Fabricante / Loja de materiais para saneamento
   - **Endereço:** Ademir Tolentino, 204 — Sertãozinho/SP
   - **Telefone:** (16) 99192-6696
   - **Site:** https://www.varetasbr.com.br
   - **Horário:** Seg a Sex, 8h às 18h
3. Faça a **verificação** (o Google confirma o endereço).
4. Adicione **fotos** reais (produtos, fábrica, equipe) — ajuda muito.

## 5. Depois (consolidar o ranqueamento)

- **Redes sociais** (Instagram, Facebook, LinkedIn) com o mesmo @ e link do site.
- **Peça avaliações** de clientes no Perfil do Google.
- **Conteúdo**: artigos/dicas ("como desentupir", "qual vareta usar") atraem
  buscas — posso criar uma seção de blog quando quiser.
- **Links**: aparecer em catálogos e parceiros do setor.

---

### O que o site já tem pronto para SEO ✅
- Títulos e textos otimizados para "varetas para desobstrução"
- Dados estruturados (empresa, produtos, FAQ) para o Google entender o negócio
- URLs limpas, `sitemap.xml`, `robots.txt` e `CNAME`
- Tags de localização (Sertãozinho/SP) + atendimento nacional
- Site rápido e responsivo (celular)

Qualquer passo que travar, me chama que eu te ajudo. 💪
