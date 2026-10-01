/* =====================================================================
   VARETAS BRASIL — Interações (JS puro, sem dependências)
   • Menu mobile
   • Header com estado ao rolar
   • Scroll reveal (IntersectionObserver)
   • Destaque do link de navegação da seção ativa
   • Botão "voltar ao topo"
   • Fallback de imagem (placeholder quando a imagem não carrega)
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Menu Mobile ---------- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    const closeMenu = () => {
        navMenu.classList.remove('active');
        if (mobileToggle) mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    };

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.innerHTML = navMenu.classList.contains('active')
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    /* ---------- Header: estado ao rolar + botão voltar ao topo ---------- */
    const header = document.getElementById('header');
    const backToTop = document.getElementById('back-to-top');

    const onScroll = () => {
        const scrolled = window.scrollY > 40;
        if (header) header.classList.toggle('scrolled', scrolled);
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Scroll Reveal ---------- */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealEls.length) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        // Sem suporte: mostra tudo
        revealEls.forEach(el => el.classList.add('in-view'));
    }

    /* ---------- FAQ (acordeão) ---------- */
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('open');
            // fecha todos
            document.querySelectorAll('.faq-item.open').forEach(o => {
                o.classList.remove('open');
                o.querySelector('.faq-answer').style.maxHeight = null;
            });
            // abre o clicado (se estava fechado)
            if (!isOpen) {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    /* ---------- Destaque da navegação por seção ativa ---------- */
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.4 });

        sections.forEach(sec => navObserver.observe(sec));
    }

    /* ---------- Fallback de imagens ausentes ---------- */
    // Se uma imagem não carregar (ex.: pasta img/ ainda sem os arquivos),
    // troca por um placeholder com a identidade visual, mantendo o layout.
    const replaceWithPlaceholder = (img) => {
        if (img.dataset.placeholderDone) return;
        img.dataset.placeholderDone = '1';
        const wrap = document.createElement('div');
        wrap.className = 'img-placeholder';
        // preserva dimensões visuais aproximadas
        const rect = img.getBoundingClientRect();
        wrap.style.width = '100%';
        wrap.style.height = (img.height || rect.height || 180) + 'px';
        wrap.style.borderRadius = getComputedStyle(img).borderRadius;
        wrap.setAttribute('role', 'img');
        wrap.setAttribute('aria-label', img.alt || 'Imagem');
        if (img.parentNode) img.parentNode.replaceChild(wrap, img);
    };

    document.querySelectorAll('img').forEach(img => {
        // imagem que já falhou antes deste script rodar
        if (img.complete && img.naturalWidth === 0) {
            replaceWithPlaceholder(img);
        } else {
            img.addEventListener('error', () => replaceWithPlaceholder(img));
        }
    });
});

/* ---------- Carrossel "Os mais pedidos" (card central em destaque) ---------- */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.best-carousel').forEach(car => {
        const track = car.querySelector('.best-grid');
        const prev = car.querySelector('.best-prev');
        const next = car.querySelector('.best-next');
        if (!track || !prev || !next) return;
        const cards = Array.from(track.querySelectorAll('.best-card'));
        if (!cards.length) return;
        let active = -1;
        const centerOf = c => c.offsetLeft + c.offsetWidth / 2;
        const goTo = (i, behavior = 'smooth') => {
            i = (i + cards.length) % cards.length;
            track.scrollTo({ left: centerOf(cards[i]) - track.clientWidth / 2, behavior });
        };
        const update = () => {
            const mid = track.scrollLeft + track.clientWidth / 2;
            let best = 0, dist = Infinity;
            cards.forEach((c, i) => {
                const d = Math.abs(centerOf(c) - mid);
                if (d < dist) { dist = d; best = i; }
            });
            if (best === active) return;
            active = best;
            cards.forEach((c, i) => c.classList.toggle('is-active', i === best));
        };
        prev.addEventListener('click', () => goTo(active - 1));
        next.addEventListener('click', () => goTo(active + 1));
        cards.forEach((c, i) => c.addEventListener('click', e => {
            if (i !== active) { e.preventDefault(); goTo(i); }
        }));
        track.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
        });
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', () => goTo(Math.max(active, 0), 'instant'));
        const start = () => { goTo(cards.length > 1 ? 1 : 0, 'instant'); update(); };
        start();
        window.addEventListener('load', start, { once: true });
    });
});
