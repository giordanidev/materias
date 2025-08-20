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

function copiarMateria(texto, delay = 0) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.getElementById('pesquisa').value = '';
    exibirMaterias();
    exibirFavoritas(); // Garante atualização das favoritas

    try {
        document.execCommand('copy');
        mostrarAlerta('Matéria copiada!');
        setTimeout(() => {
            // Aplica o ring tanto nas matérias quanto nas favoritas
            document.querySelectorAll('.flex-grow.py-1.px-2').forEach(el => {
                if (el.textContent.trim() === texto.trim()) {
                    // Remove a classe se já existe, força reflow, adiciona novamente
                    el.classList.remove('ring-copiado');
                    void el.offsetWidth;
                    el.classList.add('ring-copiado');
                    setTimeout(() => el.classList.remove('ring-copiado'), 2000);
                }
            });
        }, delay);
    } catch (err) {
        mostrarAlerta('Erro ao copiar', 'bg-red-500');
    } finally {
        document.body.removeChild(textarea);
    }
}

function copiarTextoDoBotao(span) {
    try {
        const texto = span.textContent.trim();
        copiarMateria(texto, 100);
    } catch (error) {
        console.error('Erro ao copiar texto do botão:', error);
        mostrarAlerta('Erro ao copiar texto', 'bg-red-500');
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
});

function resetarCheckboxFavorito() {
    document.getElementById('nova-favorita').checked = false;
    const checkboxDiv = document.querySelector('#nova-favorita + div');
    checkboxDiv.classList.remove('bg-yellow-500', 'dark:bg-yellow-600');
    checkboxDiv.querySelector('i').classList.remove('text-white');
}