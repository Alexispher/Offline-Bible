// ==========================================
// PEGASUS OFFLINE READER - APP.JS
// Versão completa e corrigida
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. ELEMENTOS PRINCIPAIS
    // ==========================================
    const canvas = document.getElementById("starsCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    const coverLayer = document.getElementById("book-cover");
    const insideLayer = document.getElementById("book-inside");

    const btnOpen = document.getElementById("btn-open-book");
    const btnClose = document.getElementById("btn-close-book");
    const btnContinue = document.getElementById("btn-continue");

    const searchInput = document.getElementById("omni-search");
    const ribbon = document.getElementById("bookmark-ribbon");
    const displayText = document.getElementById("display-text");

    let currentReadingPosition = "";
    let stars = [];
    let animationFrameId = null;

    // ==========================================
    // 2. VALIDAÇÃO DO BANCO BÍBLICO
    // ==========================================
    const bibleData = window.BIBLIA_TANAKH || window.bibliaTanakh || window.biblia || null;

    function bancoBiblicoDisponivel() {
        return Array.isArray(bibleData) && bibleData.length > 0;
    }

    function mostrarErroBancoBiblico() {
        if (!displayText) return;

        displayText.innerHTML = `
            <div class="instruction-text">
                <p>Banco bíblico não encontrado.</p>
                <p>Verifique se o arquivo <strong>biblia.js</strong> foi carregado antes do <strong>app.js</strong>.</p>
            </div>
        `;
    }

    // ==========================================
    // 3. FUNÇÕES UTILITÁRIAS
    // ==========================================
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

    function obterNomeDoLivro(livro) {
        return livro.name || livro.nome || livro.book || livro.abbrev || "Livro";
    }

    function encontrarLivro(livroDigitado) {
        if (!bancoBiblicoDisponivel()) return null;

        const termo = normalizarTexto(livroDigitado);

        return bibleData.find((livro) => {
            const abbrev = normalizarTexto(livro.abbrev);
            const name = normalizarTexto(livro.name);
            const nome = normalizarTexto(livro.nome);
            const book = normalizarTexto(livro.book);

            return (
                abbrev === termo ||
                name === termo ||
                nome === termo ||
                book === termo
            );
        });
    }

    // ==========================================
    // 4. MOTOR DE ESTRELAS
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

        const quantidade = window.innerWidth < 768 ? 45 : 80;

        for (let i = 0; i < quantidade; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() < 0.08 ? Math.random() * 2 + 1.2 : Math.random() * 1.1 + 0.2,
                alpha: Math.random() * 0.8 + 0.2,
                speed: 0.003 + Math.random() * 0.01
            });
        }
    }

    function animateStars() {
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach((star) => {
            star.alpha += star.speed;

            if (star.alpha >= 1 || star.alpha <= 0.15) {
                star.speed *= -1;
            }

            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        animationFrameId = requestAnimationFrame(animateStars);
    }

    function iniciarEstrelas() {
        if (!canvas || !ctx) return;

        resizeCanvas();

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        animateStars();
    }

    // ==========================================
    // 5. NAVEGAÇÃO: CAPA / LIVRO ABERTO
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

    // deixa as funções acessíveis caso outro script precise chamar
    window.openBook = openBook;
    window.closeBook = closeBook;

    // ==========================================
    // 6. MOTOR DE BUSCA
    // ==========================================
    function carregarCapitulo(query) {
        if (!displayText || !searchInput || !ribbon) return;

        if (!bancoBiblicoDisponivel()) {
            mostrarErroBancoBiblico();
            return;
        }

        const busca = String(query || "").trim();

        if (!busca) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Digite uma referência para buscar.</p>
                    <p>Exemplo: <strong>gn 1</strong> ou <strong>gn 1 1</strong></p>
                </div>
            `;
            return;
        }

        const tokens = busca.toLowerCase().split(/\s+/);

        if (tokens.length < 2) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Referência incompleta.</p>
                    <p>Use o formato: <strong>livro capítulo</strong>.</p>
                    <p>Exemplo: <strong>gn 1</strong></p>
                </div>
            `;
            return;
        }

        const livroDigitado = tokens[0];
        const capituloDigitado = parseInt(tokens[1], 10);
        const versiculoDigitado = tokens[2] ? parseInt(tokens[2], 10) : null;

        if (Number.isNaN(capituloDigitado) || capituloDigitado <= 0) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Capítulo inválido.</p>
                    <p>Use um número válido após o nome do livro.</p>
                </div>
            `;
            return;
        }

        const livroEncontrado = encontrarLivro(livroDigitado);

        if (!livroEncontrado) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Livro não encontrado.</p>
                    <p>Tente usar a abreviação. Exemplo: <strong>gn 1</strong></p>
                </div>
            `;
            return;
        }

        const capIndex = capituloDigitado - 1;
        const capitulo = livroEncontrado.chapters?.[capIndex];

        if (!Array.isArray(capitulo)) {
            displayText.innerHTML = `
                <div class="instruction-text">
                    <p>Capítulo não encontrado.</p>
                    <p>Verifique se o capítulo ${capituloDigitado} existe neste livro.</p>
                </div>
            `;
            return;
        }

        currentReadingPosition = busca.toLowerCase();
        ribbon.classList.remove("saved");

        const nomeLivro = escaparHTML(obterNomeDoLivro(livroEncontrado));

        let capituloHTML = `
            <h2 style="color:var(--gold-dark); text-align:center; margin-bottom:25px; font-size:2rem; font-weight:normal;">
                ${nomeLivro} ${capituloDigitado}
            </h2>
        `;

        let idParaRolar = null;

        capitulo.forEach((versiculo, index) => {
            const numero = index + 1;
            const textoSeguro = escaparHTML(versiculo);

            const numeroFormatado = `
                <sup style="color:#6272a4; font-size:0.7em; margin-right:6px;">
                    ${numero}
                </sup>
            `;

            if (versiculoDigitado && numero === versiculoDigitado) {
                capituloHTML += `
                    <p id="v${numero}" style="line-height:1.8; font-size:1.15rem; margin-bottom:15px;">
                        <span class="highlight-marker">${numeroFormatado}${textoSeguro}</span>
                    </p>
                `;

                idParaRolar = `v${numero}`;
            } else {
                capituloHTML += `
                    <p id="v${numero}" style="line-height:1.8; font-size:1.15rem; margin-bottom:15px; opacity:0.9;">
                        ${numeroFormatado}${textoSeguro}
                    </p>
                `;
            }
        });

        displayText.innerHTML = capituloHTML;

        if (idParaRolar) {
            setTimeout(() => {
                const elemento = document.getElementById(idParaRolar);

                if (elemento) {
                    elemento.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }, 100);
        } else {
            displayText.scrollTop = 0;
        }
    }

    window.carregarCapitulo = carregarCapitulo;

    // ==========================================
    // 7. MARCADOR DE LEITURA
    // ==========================================
    function salvarMarcador() {
        if (!currentReadingPosition || !ribbon) return;

        localStorage.setItem("pegasus_bible_bookmark", currentReadingPosition);
        ribbon.classList.add("saved");
    }

    function continuarLeitura() {
        const saved = localStorage.getItem("pegasus_bible_bookmark");

        if (!saved) return;

        if (searchInput) {
            searchInput.value = saved;
        }

        openBook();
        carregarCapitulo(saved);

        if (ribbon) {
            ribbon.classList.add("saved");
        }
    }

    // ==========================================
    // 8. EVENTOS
    // ==========================================
    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            openBook();

            if (!currentReadingPosition && searchInput && !searchInput.value.trim()) {
                searchInput.value = "gn 1 1";
                carregarCapitulo("gn 1 1");
            }
        });
    }

    if (btnClose) {
        btnClose.addEventListener("click", closeBook);
    }

    if (btnContinue) {
        btnContinue.addEventListener("click", continuarLeitura);
    }

    if (ribbon) {
        ribbon.addEventListener("click", salvarMarcador);
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                carregarCapitulo(searchInput.value);
            }
        });
    }

    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        } else if (!document.hidden && !animationFrameId) {
            animateStars();
        }
    });

    // ==========================================
    // 9. INICIALIZAÇÃO
    // ==========================================
    iniciarEstrelas();

    const saved = localStorage.getItem("pegasus_bible_bookmark");

    if (saved && btnContinue) {
        btnContinue.classList.remove("hidden");
    }

    if (!bancoBiblicoDisponivel()) {
        console.warn("BIBLIA_TANAKH não foi encontrada. Verifique o arquivo biblia.js.");
    }
});
