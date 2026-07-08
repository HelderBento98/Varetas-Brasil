/* =====================================================================
   VARETAS BRASIL — Carrinho de pedido (sem back-end)
   • Guarda o pedido no localStorage (persiste entre páginas)
   • Injeta o botão do carrinho no header e o painel (drawer)
   • Finaliza o pedido montando uma mensagem no WhatsApp do vendedor
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const KEY = 'vb_pedido';
    const WA = '5516991926696';

    const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
    const save = () => localStorage.setItem(KEY, JSON.stringify(cart));
    let cart = load();

    /* ---------- botão do carrinho no header ---------- */
    const cta = document.querySelector('.header-cta');
    let cartBtn = null;
    if (cta) {
        cartBtn = document.createElement('button');
        cartBtn.className = 'cart-btn';
        cartBtn.type = 'button';
        cartBtn.setAttribute('aria-label', 'Meu pedido');
        cartBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i><span class="cart-count">0</span>';
        cta.insertBefore(cartBtn, cta.firstChild);
        cartBtn.addEventListener('click', openDrawer);
    }

    /* ---------- painel (drawer) ---------- */
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    const drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-label', 'Meu pedido');
    drawer.innerHTML = `
        <div class="cart-head">
            <h3>Meu pedido</h3>
            <button class="cart-close" type="button" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="cart-body"></div>
        <div class="cart-foot">
            <p class="cart-note">Revise os itens e finalize pelo WhatsApp ou e-mail — nossa equipe passa os valores e condições.</p>
            <a class="btn btn-primary cart-finalize" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Finalizar pelo WhatsApp</a>
            <a class="btn btn-outline cart-email"><i class="fa-regular fa-envelope"></i> Finalizar por E-mail</a>
            <button class="cart-clear" type="button">Limpar pedido</button>
        </div>`;
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    const body = drawer.querySelector('.cart-body');
    const foot = drawer.querySelector('.cart-foot');
    const finalizeBtn = drawer.querySelector('.cart-finalize');
    const emailBtn = drawer.querySelector('.cart-email');
    const EMAIL = 'comercial1@varetasbr.com.br';

    function openDrawer() { drawer.classList.add('open'); overlay.classList.add('open'); }
    function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('open'); }
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelector('.cart-close').addEventListener('click', closeDrawer);
    drawer.querySelector('.cart-clear').addEventListener('click', () => { cart = []; save(); render(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

    const count = () => cart.reduce((s, i) => s + i.qty, 0);

    function orderText() {
        let m = 'Olá! Gostaria de fazer um pedido/orçamento:\n\n';
        cart.forEach(i => { m += `• ${i.qty}x ${i.name}\n`; });
        m += '\nPoderiam me passar os valores e condições? Obrigado!';
        return m;
    }

    function waLink() {
        return `https://wa.me/${WA}?text=${encodeURIComponent(orderText())}`;
    }

    function mailLink() {
        const subject = 'Pedido / Orçamento — Varetas Brasil';
        return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderText())}`;
    }

    function render() {
        const c = count();
        if (cartBtn) {
            cartBtn.querySelector('.cart-count').textContent = c;
            cartBtn.classList.toggle('has-items', c > 0);
        }
        if (!cart.length) {
            body.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-basket-shopping"></i><p>Seu pedido está vazio</p><span>Adicione itens do catálogo de produtos.</span></div>';
            foot.style.display = 'none';
            return;
        }
        foot.style.display = '';
        body.innerHTML = cart.map(i => `
            <div class="cart-item" data-id="${i.id}">
                <div class="cart-item-name">${i.name}</div>
                <div class="cart-qty">
                    <button type="button" data-act="dec" aria-label="Diminuir">&minus;</button>
                    <span>${i.qty}</span>
                    <button type="button" data-act="inc" aria-label="Aumentar">+</button>
                </div>
                <button class="cart-remove" type="button" data-act="rem" aria-label="Remover"><i class="fa-solid fa-trash-can"></i></button>
            </div>`).join('');
        finalizeBtn.href = waLink();
        emailBtn.href = mailLink();
    }

    /* ---------- qty/remover dentro do drawer ---------- */
    body.addEventListener('click', e => {
        const btn = e.target.closest('[data-act]'); if (!btn) return;
        const id = btn.closest('.cart-item').dataset.id;
        const it = cart.find(x => x.id === id); if (!it) return;
        const act = btn.dataset.act;
        if (act === 'inc') it.qty++;
        else if (act === 'dec') { it.qty--; if (it.qty < 1) cart = cart.filter(x => x.id !== id); }
        else if (act === 'rem') cart = cart.filter(x => x.id !== id);
        save(); render();
    });

    /* ---------- adicionar ao pedido (catálogo) ---------- */
    document.addEventListener('click', e => {
        const add = e.target.closest('.add-to-order'); if (!add) return;
        e.preventDefault();
        const id = add.dataset.id, name = add.dataset.name;
        let q = 1;
        const card = add.closest('.cat-item');
        if (card) { const v = card.querySelector('.cat-qty-val'); if (v) q = parseInt(v.textContent, 10) || 1; }
        const it = cart.find(x => x.id === id);
        if (it) it.qty += q; else cart.push({ id, name, qty: q });
        save(); render(); openDrawer();
        const original = add.innerHTML;
        add.classList.add('added');
        add.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado';
        setTimeout(() => { add.classList.remove('added'); add.innerHTML = original; }, 1200);
    });

    /* ---------- stepper de quantidade nos cards do catálogo ---------- */
    document.addEventListener('click', e => {
        const s = e.target.closest('.cat-qty [data-qact]'); if (!s) return;
        const val = s.closest('.cat-qty').querySelector('.cat-qty-val');
        let n = (parseInt(val.textContent, 10) || 1) + (s.dataset.qact === 'inc' ? 1 : -1);
        if (n < 1) n = 1;
        val.textContent = n;
    });

    render();
});
