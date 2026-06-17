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
    const numStars = 80; // Número controlado para ser ultra leve
    for(let i=0; i<numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() < 0.08 ? Math.random() * 2 + 1.5 : Math.random() * 1.2, // Raras são maiores
            alpha: Math.random(),
            speed: 0.01 + Math.random() * 0.02
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<stars.length; i++) {
        let s = stars[i];
        s.alpha += s.speed;
        if(s.alpha > 1 || s.alpha < 0) s.speed = -s.speed; // Pisca de forma suave
        
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
// 2. BANCO DE DADOS LOCAL (Exemplo Estruturado O(1))
// ==========================================
// No mundo real, você coloca a Bíblia inteira aqui nesse mesmo formato de chaves.
const BIBLIA_TANAKH = {
    "lucas": {
        "2": {
            "25": "Havia em Jerusalém un homem cujo nome era Simeão...",
            "26": "E fora-lhe revelado pelo Espírito Santo que não veria a morte antes de ver o Cristo...",
            "27": "E, movido pelo Espírito, foi ao templo; e, quando os pais trouxeram o menino Jesus, para com ele procederem segundo o costume da lei,",
            "28": "Ele, então, o tomou em seus braços, e louvou a Deus, dizendo..."
        }
    },
    "genesis": {
        "1": {
            "1": "No princípio, criou Deus os céus e a terra."
        }
    }
};


// ==========================================
// 3. MOTOR DE BUSCA E ANIMAÇÃO PEGASUS
// ==========================================
const search = document.getElementById('omni-search');
const displayText = document.getElementById('display-text');
const bookSurface = document.getElementById('book-surface');

search.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase().trim();
    // Separa por espaços puros (ignora ponto, vírgula, dois pontos)
    const tokens = query.split(/\s+/); 
    
    // Se digitou o Livro, Capítulo e o Versículo (Ex: lucas 2 27)
    if (tokens.length >= 3) {
        const livro = tokens[0];
        const cap = tokens[1];
        const ver = tokens[2];
        
        // Validação direta na memória O(1) - Instantânea
        if (BIBLIA_TANAKH[livro] && BIBLIA_TANAKH[livro][cap] && BIBLIA_TANAKH[livro][cap][ver]) {
            const textoVersiculo = BIBLIA_TANAKH[livro][cap][ver];
            
            // Executa a animação de virada de página física leve
            triggerPageFlip(() => {
                displayText.innerHTML = `
                    <h3 style="color:var(--dracula-pink); margin-bottom:10px; font-size:1.2rem;">
                        ${livro.toUpperCase()} ${cap}:${ver}
                    </h3>
                    <p style="line-height:1.6; font-size:1.15rem;">
                        ${BIBLIA_TANAKH[livro][cap][ver-1] ? BIBLIA_TANAKH[livro][cap][ver-1] + " " : ""}
                        <span class="highlight-marker">${textoVersiculo}</span>
                        ${BIBLIA_TANAKH[livro][cap][parseInt(ver)+1] ? " " + BIBLIA_TANAKH[livro][cap][parseInt(ver)+1] : ""}
                    </p>
                `);
                
                // Salva o marcador de leitura 100% Offline no aparelho
                localStorage.setItem('last_read_pegasus', `${livro} ${cap} ${ver}`);
            });
        }
    }
});

// Animação de página matemática pura usando classes CSS 3D
function triggerPageFlip(updateContentCallback) {
    // Escolhe um lado aleatório ou fixo para simular o efeito estético folheando
    bookSurface.classList.add('page-flip-animation-left');
    
    setTimeout(() => {
        updateContentCallback();
        bookSurface.classList.remove('page-flip-animation-left');
    }, 200); // Metade do tempo da transição CSS
}

// Carrega o último marcador ao abrir o app offline
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('last_read_pegasus');
    if(saved) {
        search.value = saved;
        search.dispatchEvent(new Event('input'));
    }
});
