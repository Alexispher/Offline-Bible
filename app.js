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
    const numStars = 80; // Quantidade leve
    for(let i=0; i<numStars; i++) {
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
const displayText = document.getElementById('display-text');
const ribbon = document.getElementById('bookmark-ribbon');
let currentReadingPosition = ""; 

searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.toLowerCase().trim();
        const tokens = query.split(/\s+/); 
        
        if (tokens.length >= 2) { 
            const livroDigitado = tokens[0]; // ex: "gn" ou "genesis"
            const capIndex = parseInt(tokens[1]) - 1; // Capítulo 1 vira index 0
            const verBuscado = tokens[2] ? parseInt(tokens[2]) : null; 
            
            // MÁGICA DA BUSCA: Localiza o livro no Array pelo nome ou pela abreviação
            const livroEncontrado = BIBLIA_TANAKH.find(livro => 
                livro.abbrev.toLowerCase() === livroDigitado || 
                // Remove os acentos matematicamente (Gênesis -> genesis)
                livro.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === livroDigitado
            );

            // Se achou o livro E achou o capítulo
            if (livroEncontrado && livroEncontrado.chapters[capIndex]) {
                currentReadingPosition = query; 
                ribbon.classList.remove('saved'); // Reseta a fita se houver

                const capituloReal = tokens[1]; 
                const nomeDoLivro = livroEncontrado.name; // Nome formatado bonito (Ex: Gênesis)
                
                let capituloHTML = `<h2 style="color:var(--gold-dark); text-align:center; margin-bottom: 25px; font-size: 2rem; font-weight: normal;">${nomeDoLivro} ${capituloReal}</h2>`;
                let idParaRolar = null;

                const versiculos = livroEncontrado.chapters[capIndex];

                // Monta a página com os versículos
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
                
                // Rola para a marcação suavemente
                if (idParaRolar) {
                    setTimeout(() => {
                        const el = document.getElementById(idParaRolar);
                        if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                } else {
                    displayText.scrollTop = 0;
                }

            } else {
                displayText.innerHTML = `<div class="instruction-text"><p>Capítulo não encontrado na base offline.</p></div>`;
            }
        }
    }
});


// ==========================================
// 4. LÓGICA DO MARCADOR (FITA)
// ==========================================
ribbon.addEventListener('click', () => {
    if (currentReadingPosition !== "") {
        try {
            localStorage.setItem('pegasus_bible_bookmark', currentReadingPosition);
            ribbon.classList.add('saved'); // Fita muda de cor indicando que salvou
        } catch(err) {
            console.warn("Salvamento offline bloqueado pelo navegador.");
        }
    }
});

// Verifica se tem marcação salva ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    try {
        const saved = localStorage.getItem('pegasus_bible_bookmark');
        if(saved) {
            btnContinue.classList.remove('hidden'); // Mostra botão "Continuar Leitura" na capa
            
            btnContinue.addEventListener('click', () => {
                searchInput.value = saved;
                openBook();
                // Simula o Enter para carregar a busca salva automaticamente
                searchInput.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
                ribbon.classList.add('saved');
            });
        }
    } catch(err) {}
});
