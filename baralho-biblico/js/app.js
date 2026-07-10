/* =====================================================================
   BARALHO BÍBLICO — Lógica do jogo
   Modos: sozinho (solo), grupo/equipes (grupo), individual passa-e-joga (pvp)
   Pontuação: quanto menos dicas usadas, mais pontos. 1ª dica = 7 ... 7ª = 1.
   ===================================================================== */
(function () {
  "use strict";

  var CARDS = window.CARDS || [];
  var COLORS = ["#2b56a6", "#6f9be0", "#3f9d8f", "#c9a86a", "#b3719d", "#7d8ac2", "#d9756b", "#5aa9d6", "#8ec07c", "#e0a45e"];

  // ---------- Estado ----------
  var S = {
    mode: null,          // 'solo' | 'grupo' | 'pvp'
    players: [],         // [{name, color, score}]
    roundsSetting: 10,   // 0 = livre
    deck: [],            // índices embaralhados
    deckPos: 0,
    limit: null,         // total de cartas na partida (null = livre)
    played: 0,           // cartas jogadas
    turn: 0,             // jogador da vez (pvp)
    card: null,          // carta atual
    shown: 1,            // nº de dicas reveladas
    phase: "clue"        // 'clue' | 'revealed' | 'grupo-who' | 'grupo-none'
  };

  // ---------- Utilitários ----------
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function points(shown) { return Math.max(1, 8 - shown); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function show(screenId) {
    var scr = document.querySelectorAll(".screen");
    for (var i = 0; i < scr.length; i++) scr[i].classList.remove("is-active");
    $(screenId).classList.add("is-active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // =====================================================================
  //  HOME
  // =====================================================================
  document.querySelectorAll(".mode-card").forEach(function (b) {
    b.addEventListener("click", function () { openSetup(b.getAttribute("data-mode")); });
  });
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { show(b.getAttribute("data-go")); });
  });
  $("link-rules").addEventListener("click", showRules);
  $("link-about").addEventListener("click", showAbout);

  // =====================================================================
  //  SETUP
  // =====================================================================
  var MODE_META = {
    solo:  { title: "Modo Sozinho",   sub: "Treine e desafie a si mesmo",   needsPlayers: false },
    grupo: { title: "Em grupo / equipes", sub: "Um narrador, várias equipes", needsPlayers: true },
    pvp:   { title: "Individual (passa e joga)", sub: "Cada um na sua vez", needsPlayers: true }
  };

  function openSetup(mode) {
    S.mode = mode;
    S.players = [];
    S.roundsSetting = 10;
    var m = MODE_META[mode];
    $("setup-title").textContent = m.title;
    $("setup-sub").textContent = m.sub;
    $("players-panel").hidden = !m.needsPlayers;
    $("players-label").textContent = mode === "grupo" ? "Equipes ou participantes" : "Jogadores";
    $("player-input").placeholder = mode === "grupo" ? "Nome da equipe ou pessoa" : "Nome do jogador";

    // rótulo das rodadas
    var chips = $("rounds-chips");
    chips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("is-on", c.getAttribute("data-rounds") === "10"); });
    updateRoundsHint();

    renderPlayers();
    updateStartBtn();
    show("setup");
    if (m.needsPlayers) setTimeout(function () { $("player-input").focus(); }, 300);
  }

  function updateRoundsHint() {
    var hint = $("rounds-hint");
    if (S.roundsSetting === 0) { hint.textContent = "Livre: joga até acabar o baralho ou até você encerrar."; return; }
    if (S.mode === "pvp") hint.textContent = "Cada jogador joga " + S.roundsSetting + " cartas.";
    else hint.textContent = "Partida com " + S.roundsSetting + " cartas.";
  }

  $("rounds-chips").addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (!c) return;
    $("rounds-chips").querySelectorAll(".chip").forEach(function (x) { x.classList.remove("is-on"); });
    c.classList.add("is-on");
    S.roundsSetting = parseInt(c.getAttribute("data-rounds"), 10);
    updateRoundsHint();
  });

  function addPlayer() {
    var inp = $("player-input");
    var name = inp.value.trim();
    if (!name) return;
    if (S.players.length >= 10) return;
    S.players.push({ name: name, color: COLORS[S.players.length % COLORS.length], score: 0 });
    inp.value = "";
    renderPlayers();
    updateStartBtn();
    inp.focus();
  }
  $("add-player").addEventListener("click", addPlayer);
  $("player-input").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addPlayer(); } });

  function renderPlayers() {
    var list = $("player-list");
    list.innerHTML = "";
    S.players.forEach(function (p, i) {
      var row = el("div", "player-chip");
      row.innerHTML =
        '<span class="player-dot" style="background:' + p.color + '"></span>' +
        '<span class="name">' + esc(p.name) + '</span>' +
        '<button class="rm" aria-label="Remover">×</button>';
      row.querySelector(".rm").addEventListener("click", function () {
        S.players.splice(i, 1); renderPlayers(); updateStartBtn();
      });
      list.appendChild(row);
    });
    $("players-empty").style.display = S.players.length ? "none" : "block";
  }

  function updateStartBtn() {
    var ok = MODE_META[S.mode].needsPlayers ? S.players.length >= 2 : true;
    $("start-game").disabled = !ok;
  }

  $("start-game").addEventListener("click", startGame);

  // =====================================================================
  //  JOGO
  // =====================================================================
  function startGame() {
    if (S.mode === "solo") S.players = [{ name: "Você", color: COLORS[0], score: 0 }];
    S.players.forEach(function (p) { p.score = 0; p.hits = 0; });

    S.deck = shuffle(CARDS.map(function (_, i) { return i; }));
    S.deckPos = 0;
    S.played = 0;
    S.turn = 0;

    if (S.roundsSetting === 0) S.limit = null;
    else if (S.mode === "pvp") S.limit = S.roundsSetting * S.players.length;
    else S.limit = S.roundsSetting;
    if (S.limit) S.limit = Math.min(S.limit, CARDS.length);

    $("game-title").textContent = MODE_META[S.mode].title;
    $("game-sub").textContent = S.mode === "solo" ? "Boa sorte!" : S.players.length + " participantes";
    show("game");
    nextCard();
  }

  function nextCard() {
    if (S.deckPos >= S.deck.length || (S.limit && S.played >= S.limit)) { return endGame(); }
    S.card = CARDS[S.deck[S.deckPos++]];
    S.shown = 1;
    S.phase = "clue";

    // vez do jogador (pvp)
    var banner = $("turn-banner");
    if (S.mode === "pvp") {
      banner.hidden = false;
      var p = S.players[S.turn];
      $("turn-dot").style.background = p.color;
      $("turn-name").textContent = p.name;
    } else {
      banner.hidden = true;
    }
    renderCard();
  }

  function renderCard() {
    // progresso
    $("prog-count").textContent = "Carta " + (S.played + 1);
    if (S.limit) {
      $("prog-total").textContent = "de " + S.limit;
      $("prog-bar").style.width = (S.played / S.limit * 100) + "%";
      $("prog-bar").parentElement.style.visibility = "visible";
    } else {
      $("prog-total").textContent = "livre";
      $("prog-bar").parentElement.style.visibility = "hidden";
    }

    var total = S.card.c.length;
    $("card-points").textContent = "Vale " + points(S.shown);

    // dicas reveladas
    var ul = $("clues"); ul.innerHTML = "";
    for (var i = 0; i < S.shown; i++) {
      var li = el("li", "clue");
      var ref = S.card.c[i][1] && S.card.c[i][1] !== "—" ? '<span class="clue-ref">' + esc(S.card.c[i][1]) + "</span>" : "";
      li.innerHTML =
        '<span class="clue-n">' + (i + 1) + "</span>" +
        '<span class="clue-body"><p>' + esc(S.card.c[i][0]) + "</p>" + ref + "</span>";
      ul.appendChild(li);
    }

    // revelação do nome
    var slot = $("reveal-slot"); slot.innerHTML = "";
    var revealed = S.phase === "revealed" || S.phase === "grupo-who" || S.phase === "grupo-none";
    if (revealed) {
      var box = el("div", "reveal-box");
      box.innerHTML = '<div class="lbl">O personagem é</div><div class="name">' + esc(S.card.n) + "</div>";
      slot.appendChild(box);
    }

    // ações
    renderActions(total);
  }

  function renderActions(total) {
    var box = $("card-actions"); box.innerHTML = "";

    if (S.phase === "clue") {
      if (S.shown < total) {
        box.appendChild(btn("btn btn-ghost", "Próxima dica  ·  cai para " + points(S.shown + 1) + " pts", function () {
          S.shown++; renderCard();
        }));
      } else {
        box.appendChild(hintLine("Todas as dicas reveladas."));
      }
      if (S.mode === "grupo") {
        box.appendChild(btn("btn btn-primary", "✋ Alguém acertou", function () { S.phase = "grupo-who"; renderCard(); }));
        box.appendChild(btn("btn btn-quiet", "Ninguém acertou", function () { S.phase = "grupo-none"; renderCard(); }));
      } else {
        box.appendChild(btn("btn btn-primary", "Revelar resposta", function () { S.phase = "revealed"; renderCard(); }));
      }
    }

    else if (S.phase === "revealed") { // solo / pvp
      var pts = points(S.shown);
      var who = S.mode === "pvp" ? S.players[S.turn].name : "Você";
      box.appendChild(hintLine(who + " acertou?"));
      box.appendChild(btn("btn btn-success", "✓ Acertei  ·  +" + pts, function () { award(scoreTarget(), pts); }));
      box.appendChild(btn("btn btn-ghost", "✗ Não acertei", function () { award(null, 0); }));
    }

    else if (S.phase === "grupo-who") {
      var p2 = points(S.shown);
      box.appendChild(el("p", "score-title", "Quem acertou primeiro? Recebe <strong style='color:var(--steel)'>+" + p2 + "</strong>"));
      var wl = el("div", "who-list");
      S.players.forEach(function (pl, idx) {
        var b = el("button", "who-btn");
        b.innerHTML = '<span class="player-dot" style="background:' + pl.color + '"></span><span class="name">' + esc(pl.name) + '</span><span class="pts">+' + p2 + "</span>";
        b.addEventListener("click", function () { award(idx, p2); });
        wl.appendChild(b);
      });
      box.appendChild(wl);
      box.appendChild(btn("btn btn-quiet", "← Voltar", function () { S.phase = "clue"; renderCard(); }));
    }

    else if (S.phase === "grupo-none") {
      box.appendChild(hintLine("Ninguém acertou — a carta volta ao baralho."));
      box.appendChild(btn("btn btn-primary", "Próxima carta →", function () { award(null, 0); }));
    }

    // encerrar (modo livre)
    if (!S.limit) {
      box.appendChild(btn("btn btn-quiet", "Encerrar partida", function () {
        if (S.played === 0) { show("home"); } else { endGame(); }
      }));
    }
  }

  function scoreTarget() { return S.mode === "pvp" ? S.turn : 0; }

  function award(playerIdx, pts) {
    if (playerIdx != null && pts > 0) {
      S.players[playerIdx].score += pts;
      S.players[playerIdx].hits = (S.players[playerIdx].hits || 0) + 1;
    }
    S.played++;
    if (S.mode === "pvp") S.turn = (S.turn + 1) % S.players.length;
    nextCard();
  }

  function btn(cls, label, fn) { var b = el("button", cls, label); b.addEventListener("click", fn); return b; }
  function hintLine(txt) { return el("p", "score-title", esc(txt)); }

  // sair do jogo
  $("quit-game").addEventListener("click", function () {
    if (S.played > 0 || S.shown > 1) {
      confirmModal("Sair da partida?", "O placar atual será perdido.", "Sair", function () { show("home"); });
    } else { show("home"); }
  });

  // =====================================================================
  //  RESULTADO
  // =====================================================================
  function endGame() {
    var ranked = S.players.slice().sort(function (a, b) { return b.score - a.score; });
    var maxCards = S.mode === "pvp" ? (S.limit ? S.limit / S.players.length : "—") : S.played;

    if (S.mode === "solo") {
      $("result-sub").textContent = "Modo Sozinho";
      var p = S.players[0];
      var maxPossible = S.played * 7;
      $("trophy").innerHTML = '<div class="cup">🏅</div><div class="win-name">' + p.score + " pontos</div>" +
        '<div class="win-sub">' + (p.hits || 0) + " de " + S.played + " acertos</div>";
      $("final-board").innerHTML =
        '<div class="score-row lead"><span class="score-rank">✓</span><span class="name">Acertos</span><span class="pts">' + (p.hits || 0) + '/' + S.played + "</span></div>" +
        '<div class="score-row"><span class="score-rank">★</span><span class="name">Pontuação</span><span class="pts">' + p.score + " <small>/ " + maxPossible + "</small></span></div>";
    } else {
      $("result-sub").textContent = MODE_META[S.mode].title;
      var top = ranked[0];
      var tie = ranked.length > 1 && ranked[1].score === top.score;
      $("trophy").innerHTML = '<div class="cup">🏆</div>' +
        '<div class="win-name">' + (tie ? "Empate!" : esc(top.name)) + "</div>" +
        '<div class="win-sub">' + (tie ? "no topo com " + top.score + " pts" : "venceu com " + top.score + " pontos") + "</div>";
      var board = $("final-board"); board.innerHTML = "";
      ranked.forEach(function (pl, i) {
        var row = el("div", "score-row" + (pl.score === top.score && top.score > 0 ? " lead" : ""));
        row.innerHTML =
          '<span class="score-rank">' + (i + 1) + "º</span>" +
          '<span class="player-dot" style="background:' + pl.color + ';width:14px;height:14px;flex:none;border-radius:50%"></span>' +
          '<span class="name">' + esc(pl.name) + "</span>" +
          '<span class="pts">' + pl.score + ' <small>pts · ' + (pl.hits || 0) + " acertos</small></span>";
        board.appendChild(row);
      });
    }
    show("result");
  }

  $("play-again").addEventListener("click", function () { openSetup(S.mode); });

  // =====================================================================
  //  MODAIS (regras / sobre / confirmar)
  // =====================================================================
  var modalBack = $("modal-back"), modal = $("modal");
  function openModal(html) { modal.innerHTML = html; modalBack.classList.add("is-open"); }
  function closeModal() { modalBack.classList.remove("is-open"); }
  modalBack.addEventListener("click", function (e) { if (e.target === modalBack) closeModal(); });

  function showRules() {
    openModal(
      "<h3>Como jogar</h3>" +
      "<ol>" +
      "<li>Escolha um <strong>modo</strong>: sozinho, em grupo/equipes ou individual (passa e joga).</li>" +
      "<li>Cada carta é um <strong>personagem bíblico</strong> com dicas que vão da <strong>mais difícil</strong> para a <strong>mais fácil</strong>.</li>" +
      "<li>As dicas são reveladas <strong>uma a uma</strong>. Quem adivinha com <strong>menos dicas</strong> ganha mais pontos:</li>" +
      "</ol>" +
      '<div class="score-table">' +
      '<span class="pt"><b>7</b>1ª dica</span><span class="pt"><b>6</b>2ª</span><span class="pt"><b>5</b>3ª</span>' +
      '<span class="pt"><b>4</b>4ª</span><span class="pt"><b>3</b>5ª</span><span class="pt"><b>2</b>6ª</span><span class="pt"><b>1</b>7ª</span>' +
      "</div>" +
      "<ol start='4'>" +
      "<li><strong>Em grupo:</strong> o narrador lê as dicas em voz alta e toca em “Alguém acertou” para dar os pontos à equipe.</li>" +
      "<li><strong>Individual:</strong> cada jogador, na sua vez, revela as dicas e marca se acertou.</li>" +
      "<li>Vence quem tiver <strong>mais pontos</strong> ao fim da partida.</li>" +
      "</ol>" +
      '<div class="btn-row" style="margin-top:18px"><button class="btn btn-primary" id="m-close">Entendi</button></div>'
    );
    $("m-close").addEventListener("click", closeModal);
  }

  function showAbout() {
    openModal(
      "<h3>Sobre</h3>" +
      "<p style='color:var(--muted);line-height:1.6'>Adaptação digital do <strong style='color:var(--text)'>Baralho Bíblico</strong>, com 97 personagens da Bíblia — de Abraão a Zorobabel. " +
      "Cada personagem traz 7 dicas com as referências bíblicas, das mais difíceis às mais fáceis.</p>" +
      "<p style='color:var(--muted);line-height:1.6;margin-top:12px'>Ideal para reuniões, escola bíblica, família e grupos de estudo.</p>" +
      '<div class="btn-row" style="margin-top:18px"><button class="btn btn-primary" id="m-close2">Fechar</button></div>'
    );
    $("m-close2").addEventListener("click", closeModal);
  }

  function confirmModal(title, text, okLabel, onOk) {
    openModal(
      "<h3>" + esc(title) + "</h3>" +
      "<p style='color:var(--muted)'>" + esc(text) + "</p>" +
      '<div class="btn-row two" style="margin-top:18px">' +
      '<button class="btn btn-ghost" id="m-cancel">Cancelar</button>' +
      '<button class="btn btn-primary" id="m-ok">' + esc(okLabel) + "</button></div>"
    );
    $("m-cancel").addEventListener("click", closeModal);
    $("m-ok").addEventListener("click", function () { closeModal(); onOk(); });
  }

  // total de cartas na home
  var cnt = document.querySelector(".hero .eyebrow");
  if (cnt) cnt.textContent = CARDS.length + " personagens";

})();
