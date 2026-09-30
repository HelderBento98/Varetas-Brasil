# -*- coding: utf-8 -*-
"""
Gera as páginas individuais de produto, o guia de ponteiras e as páginas por público
a partir de tools/produtos.py, reaproveitando o cabeçalho e o rodapé de ponteiras.html.

Uso (na raiz do repositório):  python3 tools/gerar_paginas.py
"""
import html
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(__file__))
from produtos import PRODUTOS, CATEGORIAS  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.varetasbr.com.br/"
WA = "5516991926696"
BY = {p["slug"]: p for p in PRODUTOS}

base = open(os.path.join(RAIZ, "ponteiras.html"), encoding="utf-8").read()
HEAD_COMUM = base[base.index("<!-- Google Fonts -->"):base.index("</head>")]
HEADER = base[base.index('<body class="product-page">') + len('<body class="product-page">'):base.index("<!-- BREADCRUMB -->")]
FOOTER = base[base.index("<!-- FOOTER -->"):]

e = html.escape


def wa(msg):
    return f"https://wa.me/{WA}?text={urllib.parse.quote(msg)}"


def ld(obj):
    return '<script type="application/ld+json">\n' + json.dumps(obj, ensure_ascii=False, indent=2) + "\n</script>"


def breadcrumb(itens):
    """itens: lista de (nome, url_relativa_ou_None)."""
    vis = []
    for i, (nome, url) in enumerate(itens):
        if url and i < len(itens) - 1:
            vis.append(f'<a href="{url}">{e(nome)}</a><span class="sep">/</span>')
        else:
            vis.append(e(nome))
    schema = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": nome,
             "item": SITE + (url or "").replace("index.html", "")}
            for i, (nome, url) in enumerate(itens)
        ],
    }
    return ("\n    <!-- BREADCRUMB -->\n    <div class=\"breadcrumb\">\n        <div class=\"container\">\n            "
            + "\n            ".join(vis) + "\n        </div>\n    </div>\n"), ld(schema)


def pagina(arquivo, titulo, descricao, imagem, corpo, schemas, og_type="website"):
    url = SITE + arquivo
    doc = f"""<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{e(titulo)} | Varetas Brasil</title>
    <meta name="description" content="{e(descricao)}">
    <meta name="author" content="Varetas Brasil">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{url}">
    <meta name="theme-color" content="#003c2f">
    <meta name="geo.region" content="BR-SP">
    <meta name="geo.placename" content="Sertãozinho, São Paulo">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="img/favicon.png">
    <link rel="apple-touch-icon" href="img/apple-touch-icon.png">

    <!-- Open Graph -->
    <meta property="og:type" content="{og_type}">
    <meta property="og:site_name" content="Varetas Brasil">
    <meta property="og:title" content="{e(titulo)} | Varetas Brasil">
    <meta property="og:description" content="{e(descricao)}">
    <meta property="og:image" content="{SITE}img/{imagem}">
    <meta property="og:url" content="{url}">
    <meta property="og:locale" content="pt_BR">

    <!-- Dados estruturados -->
    {chr(10).join('    ' + s.replace(chr(10), chr(10) + '    ') for s in schemas).strip()}

    {HEAD_COMUM.strip()}
</head>

<body class="product-page">
{HEADER}{corpo}
    {FOOTER}"""
    with open(os.path.join(RAIZ, arquivo), "w", encoding="utf-8") as f:
        f.write(doc)
    return arquivo


def card_relacionado(p):
    return f"""                <a href="{p['slug']}.html" class="related-card reveal">
                    <div class="img-wrap img-contain"><img src="img/{p['img']}" alt="{e(p['nome'])}" loading="lazy"></div>
                    <div class="body">
                        <h3>{e(p['nome'])}</h3>
                        <span>VER PRODUTO <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </a>"""


def cta(titulo, texto, msg):
    return f"""
    <!-- CTA -->
    <section class="product-cta">
        <div class="container">
            <h2>{e(titulo)}</h2>
            <p>{e(texto)}</p>
            <a href="{wa(msg)}" target="_blank" rel="noopener" class="btn btn-primary">
                <i class="fa-brands fa-whatsapp"></i> Pedir orçamento no WhatsApp
            </a>
        </div>
    </section>
"""


# ============================================================ PÁGINAS DE PRODUTO
def gerar_produto(p):
    cat_nome, cat_url = CATEGORIAS[p["cat"]]
    nav, bc_schema = breadcrumb([("Home", "index.html"), ("Produtos", "index.html#produtos"),
                                 (cat_nome, cat_url), (p["nome"], None)])
    codigo = f'<span class="product-code">Código {e(p["codigo"])}</span>' if p["codigo"] else ""
    seletor = ""
    if p["tamanhos"]:
        opts = "".join(f'<option value="{e(t)}">{e(t)}</option>' for t in p["tamanhos"])
        seletor = f'<label class="buy-label" for="tam-{p["slug"]}">Medida</label>\n                        <select class="cat-size" id="tam-{p["slug"]}">{opts}</select>'
    msg = f"Olá! Vim pelo site e gostaria de um orçamento de: {p['nome']}."
    medidas = ""
    if p["tamanhos"]:
        chips = "".join(f"<li>{e(t)}</li>" for t in p["tamanhos"])
        medidas = f"""
                    <h2>Medidas disponíveis</h2>
                    <ul class="size-chips">{chips}</ul>"""
    indicada = "".join(f'<li><i class="fa-solid fa-circle-check"></i> {e(x)}</li>' for x in p["indicada"])
    paragrafos = "\n".join(f"                    <p>{e(t)}</p>" for t in p["texto"])
    rel = "\n".join(card_relacionado(BY[s]) for s in p["relacionados"])

    corpo = nav + f"""
    <!-- HERO DO PRODUTO -->
    <section class="product-hero">
        <div class="container product-hero-grid">
            <div class="product-gallery product-gallery-contain reveal reveal-left">
                <img src="img/{p['img']}" alt="{e(p['h1'])} — Varetas Brasil">
            </div>
            <div class="product-info reveal reveal-right">
                <div class="section-subtitle">{e(cat_nome)}</div>
                <h1>{e(p['h1'])}</h1>
                {codigo}
                <p class="lead">{e(p['resumo'])}</p>
                <div class="cat-item buy-box">
                    <div class="cat-item-body">
                        {seletor}
                        <div class="cat-item-actions">
                            <div class="cat-qty">
                                <button type="button" data-qact="dec" aria-label="Diminuir">&minus;</button>
                                <span class="cat-qty-val">1</span>
                                <button type="button" data-qact="inc" aria-label="Aumentar">+</button>
                            </div>
                            <button type="button" class="btn btn-primary add-to-order" data-id="pg-{p['slug']}" data-name="{e(p['nome'])}">
                                <i class="fa-solid fa-plus"></i> Adicionar ao pedido
                            </button>
                        </div>
                    </div>
                </div>
                <div class="product-actions">
                    <a href="{wa(msg)}" target="_blank" rel="noopener" class="btn btn-outline">
                        <i class="fa-brands fa-whatsapp"></i> Tirar dúvida no WhatsApp
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- DETALHES -->
    <section class="product-details section-padding">
        <div class="container details-grid">
            <div class="details-text reveal">
                <h2>Sobre o produto</h2>
{paragrafos}{medidas}
            </div>
            <aside class="details-aside reveal">
                <h3>Indicada para</h3>
                <ul class="feature-list">{indicada}</ul>
                <p class="details-note">Fabricação própria em Sertãozinho/SP e envio para todo o Brasil. Atendemos desentupidoras, prefeituras, SAAEs e empresas.</p>
                <a href="guia-qual-ponteira-usar.html" class="details-link">Não sabe qual ponteira usar? Veja o guia <i class="fa-solid fa-arrow-right"></i></a>
            </aside>
        </div>
    </section>
{cta("Precisa de preço ou prazo?", "Fale direto com a fábrica. Informe a medida e a quantidade que respondemos com valores e condições.", msg)}
    <!-- RELACIONADOS -->
    <section class="related section-padding">
        <div class="container">
            <h2 class="reveal">Produtos relacionados</h2>
            <div class="related-grid">
{rel}
            </div>
        </div>
    </section>
"""
    produto_schema = {
        "@context": "https://schema.org", "@type": "Product",
        "name": p["nome"], "image": SITE + "img/" + p["img"], "description": p["resumo"],
        "brand": {"@type": "Brand", "name": "Varetas Brasil"},
        "manufacturer": {"@type": "Organization", "name": "Varetas Brasil", "url": SITE},
        "category": "Equipamentos para desobstrução de esgoto",
    }
    if p["codigo"]:
        produto_schema["sku"] = p["codigo"]
    return pagina(f"{p['slug']}.html", p["titulo"], p["resumo"], p["img"], corpo,
                  [ld(produto_schema), bc_schema], og_type="product")


# ============================================================ GUIA
GUIA = [
    ("Pano, estopa, papel", "Materiais que se enrolam e formam bolo.",
     ["ponta-sem-fim-p4", "ponta-sem-fim-secao-chata-p14"]),
    ("Folhas e pedaços de madeira", "Entupimento crítico em redes maiores.", ["ponta-sem-fim-secao-chata-p14"]),
    ("Raízes", "Raízes que entram pelas juntas da tubulação.", ["ponta-serra-copo-raizes-p1"]),
    ("Gordura", "Redes que recebem esgoto de cozinhas, restaurantes e condomínios.",
     ["ponta-4-laminas-gordura-p13", "ponta-cortadora"]),
    ("Areia e terra", "Sedimento acumulado ou compactado.", ["ponta-helicoidal-p6", "ponta-seta-p11"]),
    ("Barro", "Depois de abrir passagem com uma ponta reta.", ["ponta-espada"]),
    ("Material pastoso", "Obstrução que precisa ser arrastada, não cortada.",
     ["ponta-limpeza-tubulacao-p10", "ponta-seta-p11"]),
    ("Obstrução resistente que precisa de corte", "Bloqueios firmes dentro da rede.", ["ponta-4-laminas-dentada-p12"]),
    ("Começo do serviço / abrir passagem", "Primeira ponteira a entrar na obstrução.",
     ["ponta-espiral-reta-varetas", "ponta-espiral-reta-ramais-p9", "ponta-espiral-reta-cabos-c3"]),
    ("Vareta ou cabo preso na rede", "Recuperar o equipamento sem abrir a tubulação.",
     ["ponta-recuperadora-p5", "ponta-conica-para-cabos-c2"]),
]


def gerar_guia():
    nav, bc = breadcrumb([("Home", "index.html"), ("Guia: qual ponteira usar", None)])
    linhas = []
    faq = []
    for problema, detalhe, slugs in GUIA:
        links = ", ".join(f'<a href="{s}.html">{e(BY[s]["nome"])}</a>' for s in slugs)
        linhas.append(f"<tr><td><strong>{e(problema)}</strong><span>{e(detalhe)}</span></td><td>{links}</td></tr>")
        nomes = " ou ".join(BY[s]["nome"] for s in slugs)
        faq.append({"@type": "Question", "name": f"Qual ponteira usar para entupimento com {problema.lower()}?",
                    "acceptedAnswer": {"@type": "Answer", "text": f"{detalhe} Indicada: {nomes}."}})
    corpo = nav + f"""
    <section class="guide section-padding">
        <div class="container guide-container">
            <div class="section-subtitle">Guia técnico</div>
            <h1>Qual ponteira usar em cada tipo de entupimento de esgoto</h1>
            <p class="lead">A escolha da ponteira depende do que está obstruindo a rede. Use a tabela abaixo como ponto de partida. Em caso de dúvida, nossa equipe técnica indica a ponteira certa pelo WhatsApp.</p>

            <div class="guide-table-wrap">
                <table class="guide-table">
                    <thead><tr><th>Tipo de obstrução</th><th>Ponteira indicada</th></tr></thead>
                    <tbody>
                        {(chr(10) + '                        ').join(linhas)}
                    </tbody>
                </table>
            </div>

            <h2>Uma sequência comum de trabalho</h2>
            <ol class="guide-steps">
                <li><strong>Abrir passagem</strong> com uma ponta espiral reta, que entra primeiro na obstrução.</li>
                <li><strong>Ampliar e limpar</strong> com a ponteira específica para o material: sem fim para pano e estopa, serra copo para raízes, 4 lâminas para gordura, helicoidal ou seta para areia e terra.</li>
                <li><strong>Recuperar</strong> com a ponta recuperadora se alguma vareta ou cabo ficar na rede.</li>
            </ol>

            <h2>Diâmetro da ponteira</h2>
            <p>As ponteiras são vendidas por diâmetro (de 1" a 6", conforme o modelo). O diâmetro deve ser compatível com a tubulação que está sendo desobstruída. Informe o diâmetro da rede no pedido e confirmamos a medida certa.</p>

            <div class="guide-cta">
                <a href="kit-acessorios-varetas.html" class="btn btn-outline">Ver kit com 7 ponteiras de 3"</a>
                <a href="{wa('Olá! Vim pelo guia do site e preciso de ajuda para escolher a ponteira.')}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fa-brands fa-whatsapp"></i> Pedir indicação técnica</a>
            </div>
        </div>
    </section>
"""
    return pagina("guia-qual-ponteira-usar.html", "Qual Ponteira Usar em Cada Tipo de Entupimento de Esgoto",
                  "Guia prático: qual ponteira de vareta usar para raízes, gordura, pano, estopa, areia, terra, barro e material pastoso na rede de esgoto.",
                  "produto-ponteiras.jpg", corpo,
                  [ld({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq}), bc])


# ============================================================ PÚBLICOS
def gerar_publico(arquivo, titulo, h1, descricao, lead, blocos, msg, destaques):
    nav, bc = breadcrumb([("Home", "index.html"), (h1, None)])
    cards = "\n".join(f"""                <div class="spec-card reveal">
                    <i class="{ic}"></i>
                    <h4>{e(t)}</h4>
                    <p>{e(d)}</p>
                </div>""" for ic, t, d in blocos)
    rel = "\n".join(card_relacionado(BY[s]) for s in destaques)
    corpo = nav + f"""
    <section class="product-hero">
        <div class="container product-hero-grid">
            <div class="product-gallery reveal reveal-left">
                <img src="img/produto-kit.jpg" alt="Varetas, ponteiras e acessórios Varetas Brasil">
            </div>
            <div class="product-info reveal reveal-right">
                <div class="section-subtitle">Fornecimento direto de fábrica</div>
                <h1>{e(h1)}</h1>
                <p class="lead">{e(lead)}</p>
                <div class="product-actions">
                    <a href="{wa(msg)}" target="_blank" rel="noopener" class="btn btn-primary">
                        <i class="fa-brands fa-whatsapp"></i> Solicitar proposta
                    </a>
                    <a href="mailto:comercial1@varetasbr.com.br?subject={urllib.parse.quote(titulo)}" class="btn btn-outline">
                        <i class="fa-regular fa-envelope"></i> Enviar por e-mail
                    </a>
                </div>
            </div>
        </div>
    </section>

    <section class="product-specs section-padding">
        <div class="container">
            <h2 class="reveal">Como atendemos</h2>
            <div class="specs-grid">
{cards}
            </div>
        </div>
    </section>

    <section class="related section-padding">
        <div class="container">
            <h2 class="reveal">Produtos mais pedidos</h2>
            <div class="related-grid">
{rel}
            </div>
        </div>
    </section>
{cta("Solicite uma proposta", "Envie a lista de itens, quantidades e o prazo que você precisa.", msg)}"""
    return pagina(arquivo, titulo, descricao, "produto-kit.jpg", corpo, [bc])


def main():
    feitos = [gerar_produto(p) for p in PRODUTOS]
    feitos.append(gerar_guia())
    feitos.append(gerar_publico(
        "prefeituras-e-saae.html",
        "Varetas para Desobstrução para Prefeituras e SAAEs",
        "Varetas e ponteiras para prefeituras, SAAEs e autarquias de saneamento",
        "Fornecimento direto de fábrica de varetas em aço cromo-silício, ponteiras e acessórios para prefeituras, SAAEs, DAEs e autarquias de saneamento.",
        "Somos fabricantes em Sertãozinho/SP e vendemos direto, sem intermediários. Enviamos proposta formal com a descrição técnica de cada item para compor o seu processo de compra.",
        [("fa-solid fa-file-signature", "Proposta formal", "Descrição técnica de cada item, com material, diâmetro e comprimento."),
         ("fa-solid fa-industry", "Direto da fábrica", "Sem intermediários entre a produção e o órgão comprador."),
         ("fa-solid fa-ruler-combined", "Sob medida", "Diâmetros e comprimentos conforme a especificação do termo de referência."),
         ("fa-solid fa-truck-fast", "Todo o Brasil", "Envio para qualquer município.")],
        "Olá! Sou de um órgão público / SAAE e gostaria de uma proposta de varetas e ponteiras.",
        ["kit-completo-de-varetas", "kit-acessorios-varetas", "ponta-serra-copo-raizes-p1"]))
    feitos.append(gerar_publico(
        "desentupidoras.html",
        "Varetas e Ponteiras para Desentupidoras",
        "Varetas e ponteiras para desentupidoras",
        "Varetas em aço cromo-silício, ponteiras e acessórios direto da fábrica para desentupidoras e profissionais de desobstrução de esgoto.",
        "Equipamento de fábrica para quem vive de desentupimento: varetas em aço cromo-silício, 16 modelos de ponteiras e peças de reposição, com envio para todo o Brasil.",
        [("fa-solid fa-shield-halved", "Feito para uso diário", "Varetas em aço cromo-silício, engates em aço 1045 temperado e revenido."),
         ("fa-solid fa-screwdriver-wrench", "Reposição", "Engates, chaves e ponteiras avulsos para manter a frota rodando."),
         ("fa-solid fa-headset", "Suporte técnico", "Indicamos a ponteira certa para cada tipo de obstrução."),
         ("fa-solid fa-truck-fast", "Todo o Brasil", "Envio rápido para qualquer cidade.")],
        "Olá! Tenho uma desentupidora e gostaria de um orçamento de varetas e ponteiras.",
        ["kit-completo-de-varetas", "ponta-sem-fim-p4", "engate-tipo-t-em2"]))
    print("\n".join(feitos))
    print(f"{len(feitos)} páginas geradas.")


if __name__ == "__main__":
    main()
