/* =====================================================================
   VARETAS BRASIL — Rastreamento de contatos (conversões)
   Conta como conversão todo clique que leva a um contato real:
   WhatsApp (botões e envio do pedido), e-mail e telefone.

   COMO ATIVAR (Google Ads):
   1. Google Ads → Metas → Conversões → Nova ação de conversão → Site →
      "Adicionar a ação de conversão manualmente" → categoria "Contato".
   2. Copie o ID (AW-XXXXXXXXXX) e o rótulo (label) que o Google mostrar.
   3. Preencha GOOGLE_ADS_ID e GOOGLE_ADS_LABEL abaixo e publique.
   (Opcional) GA4_ID = G-XXXXXXXXXX para ver os contatos no Google Analytics.
   Enquanto os campos estiverem vazios, nada é carregado.
   ===================================================================== */
(function () {
    var GOOGLE_ADS_ID = '';     // ex.: 'AW-1234567890'
    var GOOGLE_ADS_LABEL = '';  // ex.: 'AbCdEfGhIjKlMn'
    var GA4_ID = '';            // ex.: 'G-XXXXXXXXXX'

    var principal = GOOGLE_ADS_ID || GA4_ID;
    if (!principal) return;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + principal;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    if (GOOGLE_ADS_ID) gtag('config', GOOGLE_ADS_ID);
    if (GA4_ID) gtag('config', GA4_ID);

    function canal(a) {
        var href = (a.getAttribute('href') || '').toLowerCase();
        if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) return 'whatsapp';
        if (href.indexOf('mailto:') === 0) return 'email';
        if (href.indexOf('tel:') === 0) return 'telefone';
        return null;
    }

    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var c = canal(a);
        if (!c) return;
        var pedido = a.classList.contains('cart-finalize') || a.classList.contains('cart-email');
        var dados = { canal: c, tipo: pedido ? 'pedido' : 'contato', pagina: location.pathname };
        if (GA4_ID) gtag('event', 'generate_lead', dados);
        if (GOOGLE_ADS_ID && GOOGLE_ADS_LABEL) {
            gtag('event', 'conversion', { send_to: GOOGLE_ADS_ID + '/' + GOOGLE_ADS_LABEL });
        }
    }, true);
})();
