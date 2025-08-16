/**************************************
 * VARIÁVEIS GLOBAIS E INICIALIZAÇÃO  *
 **************************************/
let materias = [];
let favoritas = [];
const storageKey = 'materias';
const favoritasKey = 'materiasFavoritas';

// Carregar dados do localStorage ao iniciar
function carregarDados() {
    if (localStorage.getItem(storageKey)) {
        materias = JSON.parse(localStorage.getItem(storageKey));
    }
    if (localStorage.getItem(favoritasKey)) {
        favoritas = JSON.parse(localStorage.getItem(favoritasKey));
    }
    atualizarSeletorDatas();
    exibirMaterias();
    exibirFavoritas();
}

/**************************************
 * FUNÇÕES DE GERENCIAMENTO DE ESTADO *
 **************************************/
function salvarDados() {
    localStorage.setItem(storageKey, JSON.stringify(materias));
    localStorage.setItem(favoritasKey, JSON.stringify(favoritas));
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

/**************************************
 * FUNÇÕES DE FORMATAÇÃO E UTILIDADES *
 **************************************/
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

/**************************************
 * FUNÇÕES DE MANIPULAÇÃO DE MATÉRIAS *
 **************************************/
function adicionarMateria() {
    const input = document.getElementById('nova-materia');
    const texto = input.value.trim().replace(/\s+/g, ' ');
    const isFavorita = document.getElementById('nova-favorita').checked;

    if (!texto) return;

    const dataAtual = obterDataAtual();
    const novaMateria = {
        texto,
        data: dataAtual,
        timestamp: new Date().getTime()
    };

    if (isFavorita) {
        // Adicionar apenas às favoritas
        favoritas.unshift(novaMateria);
        mostrarAlerta('Matéria favorita adicionada!', 'bg-yellow-500');
    } else {
        // Adicionar apenas às matérias normais
        materias.unshift(novaMateria);
        mostrarAlerta('Matéria adicionada!');
    }

    // Limpar campos
    input.value = '';
    document.getElementById('nova-favorita').checked = false;
    document.querySelector('#nova-favorita + div').classList.remove('bg-yellow-500', 'dark:bg-yellow-600');
    document.querySelector('#nova-favorita + div i').classList.remove('text-white');

    // Atualizar interface e salvar
    salvarDados();
    atualizarSeletorDatas();
    exibirMaterias();
    exibirFavoritas();
    copiarMateria(texto, 300);
}

function atualizarSeletorDatas() {
    const seletor = document.getElementById('selecionar-data');
    const datasExistentes = [...new Set(materias.map(mat => mat.data))].filter(Boolean);

    seletor.innerHTML = '<option value="">Todas as datas</option>';
    
    datasExistentes
        .sort().reverse()
        .forEach(data => {
            const option = document.createElement('option');
            option.value = data;
            option.textContent = formatarDataParaExibicao(data);
            seletor.appendChild(option);
        });
}

function filtrarMaterias() {
    const termo = document.getElementById('pesquisa').value.toLowerCase();
    const materiasFiltradas = termo 
        ? materias.filter(mat => mat.texto.toLowerCase().includes(termo))
        : materias;
    exibirMaterias(materiasFiltradas);
}

function copiarMateria(texto, delay = 0) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        setTimeout(() => {
            mostrarAlerta(
                successful 
                    ? 'Matéria copiada!' 
                    : 'Falha ao copiar',
                successful ? 'bg-green-500' : 'bg-yellow-500'
            );
        }, delay);
    } catch (err) {
        setTimeout(() => mostrarAlerta('Erro ao copiar', 'bg-red-500'), delay);
    } finally {
        document.body.removeChild(textarea);
    }
}

function copiarTextoDoBotao(botao) {
    const texto = botao.querySelector('span')?.textContent;
    if (texto) copiarMateria(texto);
}

/**************************************
 * FUNÇÕES PARA MATÉRIAS FAVORITAS    *
 **************************************/
function exibirFavoritas() {
    const divFavoritas = document.getElementById('favoritas');
    
    if (favoritas.length === 0) {
        divFavoritas.innerHTML = '<div class="text-center py-2 text-zinc-500 dark:text-zinc-400">Nenhuma matéria favorita</div>';
        return;
    }

    divFavoritas.innerHTML = favoritas.map((mat, index) => `
        <div class="flex items-center gap-2">
            <div onclick="copiarMateria('${mat.texto.replace(/'/g, "\\'")}')"
                class="flex-grow py-1 px-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-all active:scale-95">
                <span class="text-sm sm:text-base text-zinc-600 dark:text-zinc-100 break-words">${mat.texto}</span>
            </div>
            <button onclick="removerFavorita(${index})"
                class="bg-red-500 hover:bg-red-700 text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function removerFavorita(index) {
    if (index >= 0 && index < favoritas.length) {
        favoritas.splice(index, 1);
        salvarDados();
        exibirFavoritas();
    }
}

function apagarTodasFavoritas() {
    if (favoritas.length === 0) {
        mostrarAlerta('Não há matérias favoritas para apagar', 'bg-yellow-500');
        return;
    }

    if (confirm('Tem certeza que deseja apagar TODAS as matérias favoritas?')) {
        favoritas = [];
        salvarDados();
        exibirFavoritas();
        mostrarAlerta('Todas as matérias favoritas foram apagadas!');
    }
}

/**************************************
 * FUNÇÕES PARA EXCLUSÃO DE MATÉRIAS  *
 **************************************/
function apagarMateria(index) {
    if (index >= 0 && index < materias.length) {
        materias.splice(index, 1);
        salvarDados();
        atualizarSeletorDatas();
        exibirMaterias();
    }
}

function apagarMateriasDoDia() {
    const data = document.getElementById('selecionar-data').value || obterDataAtual();
    const materiasDoDia = materias.filter(mat => mat.data === data);
    
    if (materiasDoDia.length === 0) {
        mostrarAlerta(`Nenhuma matéria encontrada para o dia ${formatarDataParaExibicao(data)}`, 'bg-yellow-500');
        return;
    }

    if (confirm(`Apagar todas as ${materiasDoDia.length} matérias do dia ${formatarDataParaExibicao(data)}?`)) {
        materias = materias.filter(mat => mat.data !== data);
        salvarDados();
        atualizarSeletorDatas();
        exibirMaterias();
        mostrarAlerta(`Matérias do dia ${formatarDataParaExibicao(data)} removidas!`);
    }
}

function apagarTodasMaterias() {
    if (materias.length === 0) {
        mostrarAlerta('Não há matérias para apagar', 'bg-yellow-500');
        return;
    }

    if (confirm(`Tem certeza que deseja apagar TODAS as ${materias.length} matérias?`)) {
        materias = [];
        salvarDados();
        atualizarSeletorDatas();
        exibirMaterias();
        mostrarAlerta('Todas as matérias foram apagadas!');
    }
}

/**************************************
 * FUNÇÕES DE EXIBIÇÃO DE MATÉRIAS    *
 **************************************/
function exibirMaterias(materiasParaExibir = null) {
    const divMaterias = document.getElementById('materias');
    const materiasExibidas = materiasParaExibir || materias;
    const dataSelecionada = document.getElementById('selecionar-data').value;

    // Filtrar por data se selecionada
    const materiasFiltradas = dataSelecionada
        ? materiasExibidas.filter(mat => mat.data === dataSelecionada)
        : materiasExibidas;

    if (materiasFiltradas.length === 0) {
        divMaterias.innerHTML = '<div class="text-center py-2 text-zinc-500 dark:text-zinc-400">Nenhuma matéria encontrada</div>';
        return;
    }

    // Agrupar por data
    const materiasPorData = materiasFiltradas.reduce((acc, mat) => {
        if (!acc[mat.data]) acc[mat.data] = [];
        acc[mat.data].push(mat);
        return acc;
    }, {});

    // Ordenar datas e exibir
    divMaterias.innerHTML = Object.keys(materiasPorData)
        .sort().reverse()
        .map(data => `
            <div class="mt-4 mb-2 pb-2 border-b border-zinc-300 dark:border-zinc-600">
                <h3 class="text-md font-semibold text-zinc-600 dark:text-zinc-300">${formatarDataParaExibicao(data)}</h3>
            </div>
            ${materiasPorData[data]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((mat, index) => criarItemMateria(mat, index))
                .join('')}
        `).join('');
}

function criarItemMateria(mat, index) {
    return `
        <div class="flex items-center gap-2">
            <div onclick="copiarMateria('${mat.texto.replace(/'/g, "\\'")}')"
                class="flex-grow py-1 px-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all active:scale-95">
                <span class="text-sm sm:text-base text-zinc-600 dark:text-zinc-100 break-words">${mat.texto}</span>
            </div>
            <button onclick="event.stopPropagation(); moverParaFavoritas('${mat.data}', ${index})"
                class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
                <i class="fas fa-star"></i>
            </button>
            <button onclick="event.stopPropagation(); apagarMateria(${materias.findIndex(m => m.timestamp === mat.timestamp)})"
                class="bg-red-500 hover:bg-red-700 text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function moverParaFavoritas(data, index) {
    const materiasDoDia = materias.filter(mat => mat.data === data);
    if (index >= 0 && index < materiasDoDia.length) {
        const materia = materiasDoDia[index];
        favoritas.unshift(materia);
        materias = materias.filter(m => m.timestamp !== materia.timestamp);
        salvarDados();
        atualizarSeletorDatas();
        exibirMaterias();
        exibirFavoritas();
        mostrarAlerta('Matéria movida para favoritas!', 'bg-yellow-500');
    }
}

/**************************************
 * INICIALIZAÇÃO                      *
 **************************************/
document.addEventListener('DOMContentLoaded', () => {
    // Configuração inicial
    carregarDados();
    
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
    
    // Aplicar dark mode se configurado
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        updateButtonText();
    }
});