// ==========================================
// 1. MOTOR DE BUSCA (ATUALIZADO PARA biblia.js)
// ==========================================
const displayText = document.getElementById('display-text');
const ribbon = document.getElementById('bookmark-ribbon');
const searchInput = document.getElementById('omni-search');
let currentReadingPosition = ""; 

searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        const query = searchInput.value.toLowerCase().trim();
        const tokens = query.split(/\s+/); 
        
        if (tokens.length >= 2) { 
            const livroDigitado = tokens[0]; 
            const capIndex = parseInt(tokens[1]) - 1; 
            const verBuscado = tokens[2] ? parseInt(tokens[2]) : null; 
            
            // MÁGICA: Procura o livro pela abreviação ou nome
            const livroEncontrado = BIBLIA_TANAKH.find(livro => 
                livro.abbrev.toLowerCase() === livroDigitado || 
                livro.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === livroDigitado
            );

            if (livroEncontrado && livroEncontrado.chapters[capIndex]) {
                currentReadingPosition = query; 
                ribbon.classList.remove('saved'); 

                const nomeDoLivro = livroEncontrado.name;
                let capituloHTML = `<h2 style="color:var(--gold-dark); text-align:center; margin-bottom: 25px; font-size: 2rem; font-weight: normal;">${nomeDoLivro} ${tokens[1]}</h2>`;
                let idParaRolar = null;

                // Percorre a lista de versículos do capítulo
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
                
                // Rola para o versículo se foi pedido
                if (idParaRolar) {
                    setTimeout(() => {
                        const el = document.getElementById(idParaRolar);
                        if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                } else {
                    displayText.scrollTop = 0;
                }
            } else {
                displayText.innerHTML = `<div class="instruction-text"><p>Capítulo não encontrado.</p></div>`;
            }
        }
    }
});

// ==========================================
// 2. LÓGICA DO MARCADOR E CAPA (MANTIDA)
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
        document.getElementById('btn-continue').classList.remove('hidden');
        document.getElementById('btn-continue').addEventListener('click', () => {
            searchInput.value = saved;
            openBook();
            searchInput.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
            ribbon.classList.add('saved');
        });
    }
});
