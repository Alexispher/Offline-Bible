// ==========================================
// PEGASUS OFFLINE READER - APP.JS
// Livro navegável com marcadores laterais
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. ELEMENTOS
    // ==========================================
    const canvas = document.getElementById("starsCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    const coverLayer = document.getElementById("book-cover");
    const insideLayer = document.getElementById("book-inside");

    const btnOpen = document.getElementById("btn-open-book");
    const btnClose = document.getElementById("btn-close-book");
    const btnContinue = document.getElementById("btn-continue");

    const btnPrevPage = document.getElementById("btn-prev-page");
    const btnNextPage = document.getElementById("btn-next-page");
    const btnGoPage = document.getElementById("btn-go-page");

    const searchInput = document.getElementById("omni-search");
    const ribbon = document.getElementById("bookmark-ribbon");
    const displayText = document.getElementById("display-text");
    const bookTabs = document.getElementById("book-tabs");
    const pageStatus = document.getElementById("page-status");

    let stars = [];
    let animationFrameId = null;

    let currentBookIndex = 0;
    let currentChapterIndex = 0;
    let currentVerse = null;
    let currentReadingPosition = "";

    // ==========================================
    // 2. BANCO BÍBLICO
    // ==========================================
    const bibleData = window.BIBLIA_TANAKH || null;

    const BOOK_NAMES = {
        gn: "Gênesis",
        ex: "Êxodo",
        lv: "Levítico",
        nm: "Números",
        dt: "Deuteronômio",
        js: "Josué",
        jz: "Juízes",
        rt: "Rute",
        "1sm": "1 Samuel",
        "2sm": "2 Samuel",
        "1rs": "1 Reis",
        "2rs": "2 Reis",
        "1cr": "1 Crônicas",
        "2cr": "2 Crônicas",
        ed: "Esdras",
        ne: "Neemias",
        et: "Ester",
        job: "Jó",
        sl: "Salmos",
        pv: "Provérbios",
        ec: "Eclesiastes",
        ct: "Cânticos",
        is: "Isaías",
        jr: "Jeremias",
        lm: "Lamentações",
        ez: "Ezequiel",
        dn: "Daniel",
        os: "Oseias",
        jl: "Joel",
        am: "Amós",
        ob: "Obadias",
        jn: "Jonas",
        mq: "Miqueias",
        na: "Naum",
        hc: "Habacuque",
        sf: "Sofonias",
        ag: "Ageu",
        zc: "Zacarias",
        ml: "Malaquias",

        mt: "Mateus",
        mc: "Marcos",
        lc: "Lucas",
        jo: "João",
        at: "Atos",
        rm: "Romanos",
        "1co": "1 Coríntios",
        "2co": "2 Coríntios",
        gl: "Gálatas",
        ef: "Efésios",
        fp: "Filipenses",
        cl: "Colossenses",
        "1ts": "1 Tessalonicenses",
        "2ts": "2 Tessalonicenses",
        "1tm": "1 Timóteo",
        "2tm": "2 Timóteo",
        tt: "Tito",
        fm: "Filemom",
        hb: "Hebreus",
        tg: "Tiago",
        "1pe": "1 Pedro",
        "2pe": "2 Pedro",
        "1jo": "1 João",
        "2jo": "2 João",
        "3jo": "3 João",
        jd: "Judas",
        ap: "Apocalipse"
    };

    function bancoDisponivel() {
        return Array.isArray(bibleData) && bibleData.length > 0;
    }

    function normalizarTexto(texto) {
        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function escaparHTML(texto) {
        return String(texto || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getBookAbbrev(livro) {
        return String(livro?.abbrev || "").toLowerCase();
    }

    function getBookName(livro) {
        const abbrev = getBookAbbrev(livro);
        return livro?.name || livro?.nome || BOOK_NAMES[abbrev] || abbrev.toUpperCase() || "Livro";
    }

    function atualizarStatus() {
        if (!pageStatus || !bancoDisponivel()) return;

        const livro = bibleData[currentBookIndex];
        const nome = getBookName(livro);
        const capitulo = currentChapterIndex + 1;
        const total = livro.chapters?.length || 0;

        pageStatus.textContent = `${nome} ${capitulo} de ${total}`;
    }

    function atualizarTabsAtivas() {
        if (!bookTabs) return;

        const tabs = bookTabs.querySelectorAll(".book-tab");

        tabs.forEach((tab) => {
            const index = Number(tab.dataset.index);
            tab.classList.toggle("active", index === currentBookIndex);
        });
    }

    // ==========================================
    // 3. CANVAS DE ESTRELAS LEVE
    // ==========================================
    function resizeCanvas() {
        if (!canvas || !ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        initStars();
    }

    function initStars() {
        if (!canvas) return;

        stars = [];

        const quantidade = window.innerWidth < 720 ? 42 : 75;

        for (let i = 0; i < quantidade; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() < 0.1 ? Math.random() * 1.8 + 1 : Math.random() * 1 + 0.35,
                alpha: Math.random() * 0.65 + 0.2,
                speed: 0.0025 + Math.random() * 0.007,
                drift: Math.random() * 0.08 + 0.02
            });
        }
    }

    function drawSoftNebula() {
        if (!canvas || !ctx) return;

        const gradient = ctx.createRadialGradient(
            canvas.width * 0.72,
            canvas.height * 0.22,
            0,
            canvas.width * 0.72,
            canvas.height * 0.22,
            canvas.width * 0.7
        );

        gradient.addColorStop(0, "rgba(166, 124, 30, 0.08)");
        gradient.addColorStop(0.45, "rgba(255, 121, 198, 0.035)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function animateStars() {
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSoftNebula();

        stars.forEach((star) => {
            star.alpha += star.speed;

            if (star.alpha >= 0.95 || star.alpha <= 0.16) {
                star.speed *= -1;
            }

            star.y += star.drift * 0.05;

            if (star.y > canvas.height + 4) {
                star.y = -4;
                star.x = Math.random() * canvas.width;
            }

            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        animationFrameId = requestAnimationFrame(animateStars);
    }

    function iniciarCanvas() {
        if (!canvas || !ctx) return;

        resizeCanvas();

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        animateStars();
    }

    // ==========================================
    // 4. ABRIR / FECHAR LIVRO
    // ==========================================
    function openBook() {
        if (!coverLayer || !insideLayer) return;

        coverLayer.classList.remove("active");
        coverLayer.classList.add("hidden");

        insideLayer.classList.remove("hidden");
        insideLayer.classList.add("active");

        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 250);
    }

    function closeBook() {
        if (!coverLayer || !insideLayer) return;

        insideLayer.classList.remove("active");
        insideLayer.classList.add("hidden");

        coverLayer.classList.remove("hidden");
        coverLayer.classList.add("active");
    }

    window.openBook = openBook;
    window.closeBook = closeBook;

    // ==========================================
    // 5. MARCADORES LATERAIS
    // ==========================================
    function renderBookTabs() {
        if (!bookTabs || !bancoDisponivel()) return;

        bookTabs.innerHTML = "";

        bibleData.forEach((livro, index) => {
            const nome = getBookName(livro);
            const abbrev = getBookAbbrev(livro);

            const button = document.createElement("button");
            button.className = "book-tab";
            button.type = "button";
            button.dataset.index = index;
            button.title = nome;
            button.textContent = nome;

            button.addEventListener("click", () => {
                carregarPorIndice(index, 0, null);
            });

            bookTabs.appendChild(button);
        });

        atualizarTabsAtivas();
    }

    // ==========================================
    // 6. BUSCA E CARREGAMENTO
    // ==========================================
    function encontrarLivroPorTermo(termo) {
        if (!bancoDisponivel()) return -1;

        const termoNormalizado = normalizarTexto(termo);

        return bibleData.findIndex((livro) => {
            const abbrev = normalizarTexto(getBookAbbrev(livro));
            const nome = normalizarTexto(getBookName(livro));

            return abbrev === termoNormalizado || nome === termoNormalizado;
        });
    }

    function montarReferencia(livroIndex, capituloIndex, versiculo = null) {
        const livro = bibleData[livroIndex];
        const abbrev = getBookAbbrev(livro);
        const capitulo = capituloIndex + 1;

        return versiculo ? `${abbrev} ${capitulo} ${versiculo}` : `${abbrev} ${capitulo}`;
    }

    function carregarPorIndice(livroIndex, capituloIndex, versiculo = null) {
        if (!displayText || !searchInput || !ribbon) return;

        if (!bancoDisponivel()) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Banco bíblico não encontrado.</p>
                    <p>Confira se o arquivo <strong>biblia.js</strong> foi carregado antes do <strong>app.js</strong>.</p>
                </div>
            `;
            return;
        }

        const livro = bibleData[livroIndex];

        if (!livro || !Array.isArray(livro.chapters)) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Livro inválido.</p>
                </div>
            `;
            return;
        }

        if (capituloIndex < 0) capituloIndex = 0;
        if (capituloIndex >= livro.chapters.length) capituloIndex = livro.chapters.length - 1;

        const capitulo = livro.chapters[capituloIndex];

        if (!Array.isArray(capitulo)) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Capítulo não encontrado.</p>
                </div>
            `;
            return;
        }

        currentBookIndex = livroIndex;
        currentChapterIndex = capituloIndex;
        currentVerse = versiculo || null;

        currentReadingPosition = montarReferencia(currentBookIndex, currentChapterIndex, currentVerse);
        searchInput.value = currentReadingPosition;
        ribbon.classList.remove("saved");

        const nomeLivro = escaparHTML(getBookName(livro));
        const capituloNumero = capituloIndex + 1;

        let html = `
            <h2 style="color:var(--gold-dark); text-align:center; margin-bottom:25px; font-size:2rem; font-weight:normal;">
                ${nomeLivro} ${capituloNumero}
            </h2>
        `;

        let idParaRolar = null;

        capitulo.forEach((texto, index) => {
            const numero = index + 1;
            const textoSeguro = escaparHTML(texto);

            const numeroFormatado = `
                <sup style="color:#6272a4; font-size:0.7em; margin-right:6px;">
                    ${numero}
                </sup>
            `;

            if (versiculo && numero === versiculo) {
                html += `
                    <p id="v${numero}" style="line-height:1.8; font-size:1.15rem; margin-bottom:15px;">
                        <span class="highlight-marker">${numeroFormatado}${textoSeguro}</span>
                    </p>
                `;

                idParaRolar = `v${numero}`;
            } else {
                html += `
                    <p id="v${numero}" style="line-height:1.8; font-size:1.15rem; margin-bottom:15px; opacity:0.9;">
                        ${numeroFormatado}${textoSeguro}
                    </p>
                `;
            }
        });

        displayText.innerHTML = html;

        if (idParaRolar) {
            setTimeout(() => {
                const el = document.getElementById(idParaRolar);

                if (el) {
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }, 100);
        } else {
            displayText.scrollTop = 0;
        }

        atualizarStatus();
        atualizarTabsAtivas();
    }

    function carregarPorBusca(query) {
        if (!displayText) return;

        const busca = String(query || "").trim();

        if (!busca) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Digite uma referência.</p>
                    <p>Exemplo: <strong>gn 1</strong> ou <strong>gn 1 1</strong></p>
                </div>
            `;
            return;
        }

        const partes = busca.toLowerCase().split(/\s+/);

        if (partes.length < 2) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Referência incompleta.</p>
                    <p>Use: <strong>livro capítulo</strong>.</p>
                </div>
            `;
            return;
        }

        const livroDigitado = partes[0];
        const capituloDigitado = parseInt(partes[1], 10);
        const versiculoDigitado = partes[2] ? parseInt(partes[2], 10) : null;

        if (Number.isNaN(capituloDigitado) || capituloDigitado <= 0) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Capítulo inválido.</p>
                </div>
            `;
            return;
        }

        const livroIndex = encontrarLivroPorTermo(livroDigitado);

        if (livroIndex === -1) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Livro não encontrado.</p>
                    <p>Tente usar a abreviação. Exemplo: <strong>gn 1</strong>.</p>
                </div>
            `;
            return;
        }

        carregarPorIndice(livroIndex, capituloDigitado - 1, versiculoDigitado);
    }

    // ==========================================
    // 7. VOLTAR / AVANÇAR PÁGINA
    // ==========================================
    function proximoCapitulo() {
        if (!bancoDisponivel()) return;

        const livro = bibleData[currentBookIndex];

        if (currentChapterIndex + 1 < livro.chapters.length) {
            carregarPorIndice(currentBookIndex, currentChapterIndex + 1, null);
            return;
        }

        if (currentBookIndex + 1 < bibleData.length) {
            carregarPorIndice(currentBookIndex + 1, 0, null);
        }
    }

    function capituloAnterior() {
        if (!bancoDisponivel()) return;

        if (currentChapterIndex > 0) {
            carregarPorIndice(currentBookIndex, currentChapterIndex - 1, null);
            return;
        }

        if (currentBookIndex > 0) {
            const livroAnterior = bibleData[currentBookIndex - 1];
            const ultimoCapitulo = livroAnterior.chapters.length - 1;

            carregarPorIndice(currentBookIndex - 1, ultimoCapitulo, null);
        }
    }

    // ==========================================
    // 8. MARCADOR DE LEITURA
    // ==========================================
    function salvarMarcador() {
        if (!currentReadingPosition || !ribbon) return;

        localStorage.setItem("pegasus_bible_bookmark", currentReadingPosition);
        ribbon.classList.add("saved");
    }

    function continuarLeitura() {
        const saved = localStorage.getItem("pegasus_bible_bookmark");

        if (!saved) return;

        openBook();
        carregarPorBusca(saved);

        if (ribbon) {
            ribbon.classList.add("saved");
        }
    }

    // ==========================================
    // 9. EVENTOS
    // ==========================================
    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            openBook();

            if (!currentReadingPosition) {
                carregarPorIndice(0, 0, 1);
            }
        });
    }

    if (btnClose) {
        btnClose.addEventListener("click", closeBook);
    }

    if (btnContinue) {
        btnContinue.addEventListener("click", continuarLeitura);
    }

    if (btnGoPage) {
        btnGoPage.addEventListener("click", () => {
            carregarPorBusca(searchInput.value);
        });
    }

    if (btnPrevPage) {
        btnPrevPage.addEventListener("click", capituloAnterior);
    }

    if (btnNextPage) {
        btnNextPage.addEventListener("click", proximoCapitulo);
    }

    if (ribbon) {
        ribbon.addEventListener("click", salvarMarcador);
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                carregarPorBusca(searchInput.value);
            }
        });
    }

    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        if (!document.hidden && !animationFrameId) {
            animateStars();
        }
    });

    // ==========================================
    // 10. INICIALIZAÇÃO
    // ==========================================
    iniciarCanvas();

    if (bancoDisponivel()) {
        renderBookTabs();
        atualizarStatus();

        const saved = localStorage.getItem("pegasus_bible_bookmark");

        if (saved && btnContinue) {
            btnContinue.classList.remove("hidden");
        }
    } else if (displayText) {
        displayText.innerHTML = `
            <div class="instruction-text">
                <p>Banco bíblico não encontrado.</p>
                <p>Confira se o arquivo <strong>biblia.js</strong> existe e se foi carregado antes do <strong>app.js</strong>.</p>
            </div>
        `;
    }
});
