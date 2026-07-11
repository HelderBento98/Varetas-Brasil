# Praja — app de serviços (Android nativo)

App **Android** feito em **Kotlin + Jetpack Compose** que conecta
**prestadores de serviço** (pedreiro, eletricista, marceneiro, jardineiro,
pintor, refrigeração...) com **clientes**. O cliente busca por categoria, vê o
perfil e o **catálogo** do profissional, confere a **reputação (estrelas de 1 a
5)** e contrata. Depois avalia — assim as próximas pessoas escolhem com
segurança. A ideia é um "iFood/Uber de serviços".

> **Status:** protótipo inicial (MVP) com **dados de exemplo na memória**.
> Ainda não tem cadastro, login ou servidor — isso vem nas próximas etapas.

---

## O que já funciona

- 🏠 Tela inicial com **categorias** e **profissionais bem avaliados**
- 📂 Lista de prestadores por categoria (ordenada pela nota)
- 👤 Perfil do prestador: sobre, catálogo, **reputação** e avaliações
- ⭐ Deixar uma **avaliação (1 a 5 estrelas + comentário)** — a média atualiza na hora

---

## Como rodar

### 1. Instale o Android Studio
👉 https://developer.android.com/studio
(ele já traz o Kotlin, o Android SDK e o emulador)

### 2. Abra o projeto
No Android Studio: **File → Open** e escolha a pasta **`android-app`**.
O Android Studio baixa o Gradle e as dependências sozinho na primeira vez
(pode levar alguns minutos).

### 3. Rode
Conecte um **celular Android** (com depuração USB ligada) ou abra um
**emulador**, e clique no botão ▶ **Run**.

> Este projeto ainda não inclui o "Gradle wrapper" (`gradlew`). O Android
> Studio gera ele automaticamente ao abrir o projeto. Se preferir a linha de
> comando, rode `gradle wrapper` uma vez dentro de `android-app/` e depois use
> `./gradlew assembleDebug`.

Para gerar o APK instalável:
**Build → Build Bundle(s) / APK(s) → Build APK(s)**.

---

## Organização do código (`android-app/app/src/main/java/com/servicos/app/`)

| Pasta / arquivo   | O que tem |
|-------------------|-----------|
| `model/`          | As "coisas" do app: `Categoria`, `Prestador`, `Avaliacao` |
| `data/`           | `DadosMock.kt` — dados de exemplo (viram um servidor depois) |
| `ui/theme/`       | Cores e tema visual num lugar só |
| `ui/components/`  | Peças reutilizáveis (estrelas, avatar, cartão do prestador) |
| `ui/screens/`     | As telas: inicial, categoria, perfil do prestador, avaliar |
| `MainActivity.kt` | Ponto de partida + navegação entre as telas |

---

## Próximos passos sugeridos

1. **Cadastro e login** (cliente e prestador)
2. **Back-end de verdade** para salvar os dados — recomendo começar com
   **Firebase** ou **Supabase** (têm plano grátis e integram rápido)
3. **Busca e filtros** (por distância, preço, nota mínima)
4. **Chat interno** ou botão de WhatsApp para falar com o profissional
5. **Foto real** de perfil e upload de fotos no catálogo
6. **Notificações** de nova solicitação/avaliação
7. Monetização: destaque pago, assinatura do prestador ou comissão por serviço
