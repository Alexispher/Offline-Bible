// ==========================================
// 1. MOTOR MATEMÁTICO DE ESTRELAS (CANVAS)
// ==========================================
const canvas = document.getElementById('starsCanvas');
const ctx = canvas.getContext('2d');
let stars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    for(let i=0; i<80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() < 0.08 ? Math.random() * 2 + 1.5 : Math.random() * 1.2,
            alpha: Math.random(),
            speed: 0.005 + Math.random() * 0.015
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<stars.length; i++) {
        let s = stars[i];
        s.alpha += s.speed;
        if(s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animateStars();

// ==========================================
// 2. NAVEGAÇÃO: CAPA vs LIVRO ABERTO
// ==========================================
const coverLayer = document.getElementById('book-cover');
const insideLayer = document.getElementById('book-inside');
const btnOpen = document.getElementById('btn-open-book');
const btnClose = document.getElementById('btn-close-book');
const btnContinue = document.getElementById('btn-continue');
const searchInput = document.getElementById('omni-search');
const ribbon = document.getElementById('bookmark-ribbon');
const displayText = document.getElementById('display-text');
let currentReadingPosition = ""; 

function openBook() {
    coverLayer.classList.remove('active');
    coverLayer.classList.add('hidden');
    insideLayer.classList.remove('hidden');
    insideLayer.classList.add('active');
    searchInput.focus();
}

function closeBook() {
    insideLayer.classList.remove('active');
    insideLayer.classList.add('hidden');
    coverLayer.classList.remove('hidden');
    coverLayer.classList.add('active');
}

btnOpen.addEventListener('click', openBook);
btnClose.addEventListener('click', closeBook);

// ==========================================
// 3. MOTOR DE BUSCA (ATUALIZADO PARA O NOVO JSON)
// ==========================================
function carregarCapitulo(query) {
    const tokens = query.toLowerCase().trim().split(/\s+/); 
    if (tokens.length >= 2) { 
        const livroDigitado = tokens[0]; 
        const capIndex = parseInt(tokens[1]) - 1; 
        const verBuscado = tokens[2] ? parseInt(tokens[2]) : null; 
        
        const livroEncontrado = BIBLIA_TANAKH.find(livro => 
            livro.abbrev.toLowerCase() === livroDigitado || 
            livro.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === livroDigitado
        );

        if (livroEncontrado && livroEncontrado.chapters[capIndex]) {
            currentReadingPosition = query; 
            ribbon.classList.remove('saved'); 

            let capituloHTML = `<h2 style="color:var(--gold-dark); text-align:center; margin-bottom: 25px; font-size: 2rem; font-weight: normal;">${livroEncontrado.name} ${tokens[1]}</h2>`;
            let idParaRolar = null;
            const versiculos = livroEncontrado.chapters[capIndex];

            for (let i = 0; i < versiculos.length; i++) {
                let num = i + 1; 
                let texto = versiculos[i];
                let numeroFormatado = `<sup style="color: #6272a4; font-size: 0.7em; margin-right: 6px;">${num}</sup>`;

                if (verBuscado && num === verBuscado) {
                    capituloHTML += `<p id="v${num}" style="line-height:1.8; font-size:1.15rem; margin-bottom:15px;"><span class="highlight-marker">${numeroFormatado}${texto}</span></p>`;
                    idParaRolar = `v${num}`;
                } else {
                    capituloHTML += `<p id="v${num}" style="line-height:1.8; font-size:1.15rem; margin-bottom:15px; opacity: 0.9;">${numeroFormatado}${texto}</p>`;
                }
            }
            displayText.innerHTML = capituloHTML;
            if (idParaRolar) {
                setTimeout(() => {
                    const el = document.getElementById(idParaRolar);
                    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else {
                displayText.scrollTop = 0;
            }
        }
    }
}

searchInput.addEventListener('keyup', (e) => { if(e.key === 'Enter') carregarCapitulo(searchInput.value); });

// ==========================================
// 4. LÓGICA DE ABERTURA AUTOMÁTICA E MARCADOR
// ==========================================
ribbon.addEventListener('click', () => {
    if (currentReadingPosition !== "") {
        localStorage.setItem('pegasus_bible_bookmark', currentReadingPosition);
        ribbon.classList.add('saved');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('pegasus_bible_bookmark');
    if(saved) {
        btnContinue.classList.remove('hidden');
        btnContinue.addEventListener('click', () => {
            searchInput.value = saved;
            openBook();
            carregarCapitulo(saved);
            ribbon.classList.add('saved');
        });
    } else {
        // Primeira abertura: Génesis 1:1 automático
        searchInput.value = "gn 1 1";
        openBook();
        carregarCapitulo("gn 1 1");
    }
});
