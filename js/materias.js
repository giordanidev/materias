/**************************************
 * FUNÇÕES PARA MATÉRIAS PADRÃO       *
 **************************************/
function atualizarSeletorDatas() {
    const seletor = document.getElementById('selecionar-data');
    const datasExistentes = [...new Set(materias.map(mat => mat.data))].filter(Boolean);

    // Adicionar opção para últimos 2 dias
    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
    const dataAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    const dataOntem = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`;

    seletor.innerHTML = `
        <option value="">Todas as datas</option>
        <option value="ultimos-2-dias">Últimos 2 dias</option>
    `;
    
    datasExistentes
        .sort().reverse()
        .forEach(data => {
            const option = document.createElement('option');
            option.value = data;
            option.textContent = formatarDataParaExibicao(data);
            seletor.appendChild(option);
        });

    // Carregar seleção de data do localStorage
    const dataSelecionada = localStorage.getItem(dataSelecionadaKey);
    if (dataSelecionada) {
        seletor.value = dataSelecionada;
    }
}

function filtrarMaterias() {
    const termo = document.getElementById('pesquisa').value.toLowerCase();
    const materiasFiltradas = termo 
        ? materias.filter(mat => mat.texto.toLowerCase().includes(termo))
        : materias;
    exibirMaterias(materiasFiltradas);
}

function exibirMaterias(materiasParaExibir = null) {
    const divMaterias = document.getElementById('materias');
    const materiasExibidas = materiasParaExibir || materias;
    const seletor = document.getElementById('selecionar-data');
    const dataSelecionada = seletor.value;

    // Salvar seleção de data no localStorage
    localStorage.setItem(dataSelecionadaKey, dataSelecionada);

    let materiasFiltradas;
    if (dataSelecionada === "ultimos-2-dias") {
        const hoje = new Date();
        const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
        const dataAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        const dataOntem = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`;
        materiasFiltradas = materiasExibidas.filter(mat => mat.data === dataAtual || mat.data === dataOntem);
    } else if (dataSelecionada) {
        materiasFiltradas = materiasExibidas.filter(mat => mat.data === dataSelecionada);
    } else {
        materiasFiltradas = materiasExibidas;
    }

    if (materiasFiltradas.length === 0) {
        divMaterias.innerHTML = '<div class="text-center py-2 text-zinc-500 dark:text-zinc-400">Nenhuma matéria encontrada</div>';
        return;
    }

    const materiasPorData = materiasFiltradas.reduce((acc, mat) => {
        if (!acc[mat.data]) acc[mat.data] = [];
        acc[mat.data].push(mat);
        return acc;
    }, {});

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
                class="flex-grow py-1 px-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all active:scale-95">
                <span class="text-sm sm:text-base text-zinc-600 dark:text-zinc-100 break-words">${mat.texto}</span>
            </div>
            <button onclick="event.stopPropagation(); moverParaFavoritas('${mat.data}', ${index})"
                class="bg-yellow-500/80 hover:bg-yellow-600/80 text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
                <i class="fas fa-star"></i>
            </button>
            <button onclick="event.stopPropagation(); apagarMateria(${index})"
                class="bg-red-500/80 hover:bg-red-700/80 text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function apagarMateria(index) {
    if (index >= 0 && index < materias.length) {
        materias.splice(index, 1);
        salvarDados();
        atualizarSeletorDatas();
        exibirMaterias();
        mostrarAlerta('Matéria apagada!');
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

function moverParaFavoritas(data, index) {
    const materiasDoDia = materias.filter(mat => mat.data === data);
    if (index >= 0 && index < materiasDoDia.length) {
        const materia = materiasDoDia[index];
        
        // Verifica se já existe nas favoritas, ignorando a própria matéria que está sendo movida
        if (materiaJaExiste(materia.texto, materia)) {
            mostrarAlerta('Esta matéria já existe nas favoritas!', 'bg-yellow-500');
            return;
        }
        
        favoritas.unshift(materia);
        materias = materias.filter(m => m.timestamp !== materia.timestamp);
        salvarDados();
        atualizarSeletorDatas();
        exibirMaterias();
        exibirFavoritas();
        mostrarAlerta('Matéria movida para favoritas!', 'bg-yellow-500');
    }
}

document.getElementById('selecionar-data').addEventListener('change', () => {
    exibirMaterias();
});