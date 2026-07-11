# App de Serviços (marketplace de prestadores)

Aplicativo em **Flutter** que conecta **prestadores de serviço** (pedreiro,
eletricista, marceneiro, jardineiro, pintor, refrigeração...) com **clientes**.
O cliente busca por categoria, vê o perfil e o **catálogo de trabalhos** do
profissional, confere a **reputação (estrelas de 1 a 5)** e contrata. Depois
avalia — assim as próximas pessoas escolhem com segurança. A ideia é um
"iFood/Uber de serviços".

> **Status:** protótipo inicial (MVP) usando **dados de exemplo na memória**.
> Ainda não tem cadastro, login ou servidor — isso vem nas próximas etapas.

---

## O que já funciona

- 🏠 Tela inicial com **categorias** e **profissionais bem avaliados**
- 📂 Lista de prestadores por categoria (ordenada pela nota)
- 👤 Perfil do prestador: sobre, **catálogo**, **reputação** e avaliações
- ⭐ Deixar uma **avaliação (1 a 5 estrelas + comentário)** — a média atualiza na hora

---

## Como rodar no seu computador

### 1. Instale o Flutter
Siga o guia oficial (tem passo a passo pra Windows, Mac e Linux):
👉 https://docs.flutter.dev/get-started/install

Depois, confirme que está tudo certo:
```bash
flutter doctor
```

### 2. Gere as pastas de Android/iOS
Como este projeto começou só com o código (`lib/`), rode **dentro da pasta `app/`**
o comando abaixo. Ele cria as pastas `android/` e `ios/` sem apagar o seu código:
```bash
cd app
flutter create .
```

### 3. Baixe as dependências
```bash
flutter pub get
```

### 4. Rode o app
Com um **celular Android conectado** (com depuração USB) ou um **emulador** aberto:
```bash
flutter run
```

Para gerar o APK instalável:
```bash
flutter build apk
```
O arquivo fica em `build/app/outputs/flutter-apk/app-release.apk`.

---

## Organização do código (`app/lib/`)

| Pasta        | O que tem |
|--------------|-----------|
| `models/`    | As "coisas" do app: `Categoria`, `Prestador`, `Avaliacao` |
| `data/`      | `dados_mock.dart` — dados de exemplo (viram um servidor depois) |
| `theme/`     | `tema.dart` — cores e estilo visual num lugar só |
| `widgets/`   | Peças reutilizáveis (estrelas, avatar, cartão do prestador) |
| `screens/`   | As telas: inicial, categoria, perfil do prestador, avaliar |
| `main.dart`  | Ponto de partida que junta tudo |

---

## Próximos passos sugeridos

1. **Cadastro e login** (cliente e prestador)
2. **Back-end de verdade** para salvar os dados — recomendo começar com
   **Firebase** ou **Supabase** (têm plano grátis e são rápidos de integrar)
3. **Busca e filtros** (por distância, preço, nota mínima)
4. **Chat interno** ou botão de WhatsApp para o cliente falar com o profissional
5. **Foto real** de perfil e upload de fotos no catálogo
6. **Notificações** de nova solicitação/avaliação
7. Monetização: destaque pago, assinatura do prestador ou comissão por serviço
