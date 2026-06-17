// ==========================================
// 1. BANCO DE DADOS (AMOSTRA PARA TESTE)
// ==========================================
// Para colocar a Bíblia completa, basta substituir este bloco pelo JSON completo.
const BIBLIA_TANAKH = {
    "lucas": {
        "2": {
            "25": "Havia em Jerusalém um homem cujo nome era Simeão; e este homem era justo e temente a Deus, esperando a consolação de Israel; e o Espírito Santo estava sobre ele.",
            "26": "E fora-lhe revelado pelo Espírito Santo que ele não morreria antes de ter visto o Cristo do Senhor.",
            "27": "E, movido pelo Espírito, foi ao templo; e, quando os pais trouxeram o menino Jesus, para com ele procederem segundo o costume da lei,",
            "28": "Ele, então, o tomou em seus braços, e louvou a Deus, e disse:",
            "29": "Agora, Senhor, despedes em paz o teu servo, Segundo a tua palavra;",
            "30": "Pois já os meus olhos viram a tua salvação,"
        }
    },
    "genesis": {
        "1": {
            "1": "No princípio, criou Deus os céus e a terra.",
            "2": "A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.",
            "3": "Disse Deus: Haja luz; e houve luz."
        }
    }
};

// ==========================================
// 2. MOTOR MATEMÁTICO DE ESTRELAS (CANVAS)
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
    const numStars = 80;
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
// 3. MOTOR DE BUSCA, LEITURA E ANIMAÇÃO
// ==========================================
const search = document.getElementById('omni-search');
const displayText = document.getElementById('display-text');
const bookSurface = document.getElementById('book-surface');

search.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.toLowerCase().trim();
        const tokens = query.split(/\s+/); 
        
        if (tokens.length >= 2) { 
            const livro = tokens[0];
            const cap = tokens[1];
            const verBuscado = tokens[2]; 
            
            if (BIBLIA_TANAKH[livro] && BIBLIA_TANAKH[livro][cap]) {
                
                let capituloHTML = `<h2 style="color:var(--dracula-pink); text-align:center; margin-bottom: 25px; font-size: 2rem;">${livro.toUpperCase()} ${cap}</h2>`;
                let idParaRolar = null;

                // Monta o capítulo inteiro
                for (let v in BIBLIA_TANAKH[livro][cap]) {
                    let numeroVersiculo = `<sup style="color: #6272a4; font-size: 0.7em; margin-right: 6px; font-weight: bold;">${v}</sup>`;
                    let texto = BIBLIA_TANAKH[livro][cap][v];

                    if (verBuscado && v === verBuscado) {
                        capituloHTML += `<p id="versiculo-${v}" style="line-height:1.8; font-size:1.15rem; margin-bottom:15px; padding: 5px 0;"><span class="highlight-marker">${numeroVersiculo}${texto}</span></p>`;
                        idParaRolar = `versiculo-${v}`;
                    } else {
                        capituloHTML += `<p id="versiculo-${v}" style="line-height:1.8; font-size:1.15rem; margin-bottom:15px; padding: 5px 0;">${numeroVersiculo}${texto}</p>`;
                    }
                }

                // Animação e injeção do texto
                triggerPageFlip(() => {
                    displayText.innerHTML = capituloHTML;
                    
                    // Rolagem suave até o versículo exato (se foi buscado)
                    if (idParaRolar) {
                        setTimeout(() => {
                            const elemento = document.getElementById(idParaRolar);
                            if(elemento) {
                                elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    } else {
                        // Se buscou só o capítulo, rola para o topo
                        displayText.scrollTop = 0;
                    }
                });

                // Salva offline
                try {
                    localStorage.setItem('last_read_pegasus', query);
                } catch(err) {}

            } else {
                triggerPageFlip(() => {
                    displayText.innerHTML = `<div class="instruction-text"><p style="color: var(--dracula-pink);">Capítulo não encontrado na base de dados local.</p></div>`;
                });
            }
        }
    }
});

// Efeito 3D da página virando
function triggerPageFlip(callback) {
    bookSurface.classList.add('page-flip-animation-left');
    setTimeout(() => {
        callback();
        bookSurface.classList.remove('page-flip-animation-left');
    }, 200); 
}

// Carrega última leitura
window.addEventListener('DOMContentLoaded', () => {
    try {
        const saved = localStorage.getItem('last_read_pegasus');
        if(saved) {
            search.value = saved;
            search.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
        }
    } catch(err) {}
});
