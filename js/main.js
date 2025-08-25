/**************************************
 * VARIÁVEIS GLOBAIS COMPARTILHADAS   *
 **************************************/
let materias = [];
let favoritas = [];
const storageKey = 'materias';
const favoritasKey = 'materiasFavoritas';
const dataSelecionadaKey = 'dataSelecionada';

/**************************************
 * FUNÇÕES COMPARTILHADAS             *
 **************************************/
function salvarDados() {
    localStorage.setItem(storageKey, JSON.stringify(materias));
    localStorage.setItem(favoritasKey, JSON.stringify(favoritas));
}

function formatarDataParaExibicao(dataString) {
    if (!dataString) return 'Data inválida';
    try {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
}

function obterDataAtual() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
}

function mostrarAlerta(mensagem, bgColor = 'bg-green-500') {
    const alertaContainer = document.getElementById('alerta-container');
    const alerta = document.createElement('div');
    alerta.className = `${bgColor} text-white p-3 rounded-lg shadow text-sm sm:text-base mb-1 opacity-0 animate-fade-in`;
    alerta.textContent = mensagem;

    if (alertaContainer.firstChild) {
        alertaContainer.insertBefore(alerta, alertaContainer.firstChild);
    } else {
        alertaContainer.appendChild(alerta);
    }

    void alerta.offsetWidth;
    alerta.classList.remove('opacity-0');

    setTimeout(() => {
        alerta.classList.add('animate-fade-out');
        alerta.addEventListener('animationend', () => alerta.remove(), { once: true });
    }, 2500);
}

function copiarMateria(texto, delay = 0, elementToRing = null) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();

    // Limpa a pesquisa se houver texto
    const pesquisaInput = document.getElementById('pesquisa');
    if (pesquisaInput.value) {
        pesquisaInput.value = '';
        pesquisaInput.dispatchEvent(new Event('input')); // Reseta o botão de limpar
        filtrarMaterias(); // Filtra para mostrar as listas completas novamente
    }

    try {
        document.execCommand('copy');
        mostrarAlerta('Matéria copiada!');
        
        // Aplica o ring verde diretamente ao elemento clicado
        if (elementToRing) {
            setTimeout(() => {
                elementToRing.classList.remove('ring-copiado');
                void elementToRing.offsetWidth; // Força reflow para reiniciar a animação
                elementToRing.classList.add('ring-copiado');
                setTimeout(() => {
                    // Garante que o elemento ainda existe antes de remover a classe
                    if (elementToRing && elementToRing.parentElement) {
                        elementToRing.classList.remove('ring-copiado');
                    }
                }, 2000);
            }, delay);
        }
    } catch (err) {
        mostrarAlerta('Erro ao copiar', 'bg-red-500');
    } finally {
        document.body.removeChild(textarea);
        // NÃO redesenhar as listas aqui
        // exibirMaterias();    <-- REMOVIDO
        // exibirFavoritas();  <-- REMOVIDO
    }
}

function toggleDarkMode() {
    const isDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark);
    updateButtonText();
}

function updateButtonText() {
    const isDark = document.documentElement.classList.contains('dark');
    document.querySelector('.light-text').classList.toggle('hidden', isDark);
    document.querySelector('.dark-text').classList.toggle('hidden', !isDark);
}

function materiaJaExiste(texto, ignorarMateria = null) {
    const textoLower = texto.toLowerCase().trim();
    
    const existeEmMaterias = materias.some(mat => 
        mat.texto.toLowerCase().trim() === textoLower &&
        (!ignorarMateria || mat.timestamp !== ignorarMateria.timestamp)
    );
    
    const existeEmFavoritas = favoritas.some(fav => 
        fav.texto.toLowerCase().trim() === textoLower &&
        (!ignorarMateria || fav.timestamp !== ignorarMateria.timestamp)
    );
    
    return existeEmMaterias || existeEmFavoritas;
}

function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function destacarTermo(texto, termo) {
    if (!termo) return texto;
    const termoSemAcento = removerAcentos(termo);
    const textoSemAcento = removerAcentos(texto);

    // Regex global e case-insensitive
    const regex = new RegExp(termoSemAcento, "gi");
    let resultado = "";
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(textoSemAcento)) !== null) {
        // Pega o índice real no texto original
        const realIndex = [...textoSemAcento.slice(0, match.index)].length;
        resultado += texto.slice(lastIndex, realIndex);
        resultado += `<span class="bg-yellow-300 text-black rounded px-1">${texto.slice(realIndex, realIndex + termo.length)}</span>`;
        lastIndex = realIndex + termo.length;
    }
    resultado += texto.slice(lastIndex);
    return resultado;
}

/**************************************
 * INICIALIZAÇÃO                      *
 **************************************/
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados
    if (localStorage.getItem(storageKey)) {
        materias = JSON.parse(localStorage.getItem(storageKey));
    }
    if (localStorage.getItem(favoritasKey)) {
        favoritas = JSON.parse(localStorage.getItem(favoritasKey));
    }

    // Configurar dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        updateButtonText();
    }

    // Event listeners
    document.getElementById('pesquisa').addEventListener('input', filtrarMaterias);
    document.getElementById('nova-materia').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarMateria();
    });
    document.getElementById('selecionar-data').addEventListener('change', () => exibirMaterias());
    document.getElementById('nova-favorita').addEventListener('change', function() {
        const iconDiv = this.nextElementSibling;
        iconDiv.classList.toggle('bg-yellow-500', this.checked);
        iconDiv.classList.toggle('dark:bg-yellow-600', this.checked);
        iconDiv.querySelector('i').classList.toggle('text-white', this.checked);
    });

    // Exibir dados
    atualizarSeletorDatas();
    exibirMaterias();
    exibirFavoritas();

    // Fechar modal ao clicar fora do conteúdo
    const modalAjuda = document.getElementById('modal-ajuda');
    if (modalAjuda) {
        modalAjuda.addEventListener('click', function(e) {
            // Fecha apenas se clicar no fundo (não na caixa de conteúdo)
            if (e.target === modalAjuda) {
                fecharModalAjuda();
            }
        });
    }
});

function resetarCheckboxFavorito() {
    document.getElementById('nova-favorita').checked = false;
    const checkboxDiv = document.querySelector('#nova-favorita + div');
    checkboxDiv.classList.remove('bg-yellow-500', 'dark:bg-yellow-600');
    checkboxDiv.querySelector('i').classList.remove('text-white');
}

function abrirModalAjuda() {
    document.getElementById('modal-ajuda').classList.remove('hidden');
}
function fecharModalAjuda() {
    document.getElementById('modal-ajuda').classList.add('hidden');
}

document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('modal-ajuda');
    if (modal && !modal.classList.contains('hidden') && e.key === 'Escape') {
        fecharModalAjuda();
    }
});

function exclusivoFavoritaProtegida(tipo) {
    const favorita = document.getElementById('nova-favorita');
    const protegida = document.getElementById('nova-protegida');
    const favoritaDiv = favorita.nextElementSibling;
    const protegidaDiv = protegida.nextElementSibling;

    if (tipo === 'favorita' && favorita.checked) {
        protegida.checked = false;
        // Reset visual protegida
        protegidaDiv.classList.remove('bg-blue-500', 'text-white');
        protegidaDiv.classList.add('bg-zinc-300', 'dark:bg-zinc-700', 'text-white');
    }
    if (tipo === 'protegida' && protegida.checked) {
        favorita.checked = false;
        // Reset visual favorita
        favoritaDiv.classList.remove('bg-yellow-500', 'text-white');
        favoritaDiv.classList.add('bg-zinc-300', 'dark:bg-zinc-700', 'text-white');
    }
}

let debounceProtegidasTimeout;

function pesquisarProtegidasDebounce(termoSemAcento, termoOriginal) {
    clearTimeout(debounceProtegidasTimeout);
    debounceProtegidasTimeout = setTimeout(() => {
        filtrarProtegidas(termoSemAcento, termoOriginal);
    }, 400); // 400ms de atraso, ajuste conforme necessário
}