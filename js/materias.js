/**************************************
 * FUNÇÕES PARA MATÉRIAS PADRÃO       *
 **************************************/
function adicionarMateria() {
    const input = document.getElementById('nova-materia');
    let texto = input.value.trim().replace(/\s+/g, ' ');
    texto = texto.replace(/"/g, "'"); // Substitui " por '

    if (!texto) return;

    // Verifica se já existe em qualquer lista
    const existeEmMaterias = materias.some(m => m.texto === texto);
    const existeEmFavoritas = favoritas.some(f => f.texto === texto);

    if (existeEmMaterias || existeEmFavoritas) {
        mostrarAlerta('Matéria já existe! Texto corrigido e copiado.', 'bg-yellow-500');
        copiarMateria(texto);
        input.value = '';
        return;
    }

    const isFavorita = document.getElementById('nova-favorita').checked;

    const timestamp = new Date().getTime();
    const novaMateria = {
        texto,
        data: obterDataAtual(),
        timestamp: timestamp
    };

    if (isFavorita) {
        favoritas.unshift(novaMateria);
        mostrarAlerta('Matéria favorita adicionada!', 'bg-yellow-500');
    } else {
        materias.unshift(novaMateria);
        mostrarAlerta('Matéria adicionada!');
    }

    // Limpar campos e desmarcar o checkbox
    input.value = '';
    document.getElementById('nova-favorita').checked = false;
    resetarCheckboxFavorito();

    // Atualizar interface
    salvarDados();
    atualizarSeletorDatas();
    exibirMaterias();
    exibirFavoritas();

    // Copia e anima o elemento recém-adicionado
    requestAnimationFrame(() => {
        const elementoAdicionado = document.querySelector(`div[data-timestamp="${timestamp}"]`);
        if (elementoAdicionado) {
            copiarMateria(texto, 100, elementoAdicionado);
        }
    });
}

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
    const termo = document.getElementById('pesquisa').value.trim();
    const termoSemAcento = removerAcentos(termo).toLowerCase();

    if (termo) {
        const materiasFiltradas = materias.filter(m => removerAcentos(m.texto).toLowerCase().includes(termoSemAcento));
        const favoritasFiltradas = favoritas.filter(f => removerAcentos(f.texto).toLowerCase().includes(termoSemAcento));
        
        exibirMaterias(materiasFiltradas);
        exibirFavoritas(favoritasFiltradas);
    } else {
        exibirMaterias();
        exibirFavoritas();
    }
}

function exibirMaterias(materiasParaExibir = null) {
    const divMaterias = document.getElementById('materias');
    const materiasExibidas = materiasParaExibir || materias;
    const seletor = document.getElementById('selecionar-data');
    const dataSelecionada = seletor.value;

    // Salvar seleção de data no localStorage
    localStorage.setItem(dataSelecionadaKey, dataSelecionada);

    let materiasFiltradas;
    if (materiasParaExibir) {
        // Se está exibindo resultado de pesquisa, não filtra por data
        materiasFiltradas = materiasExibidas;
    } else if (dataSelecionada === "ultimos-2-dias") {
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

    const termoPesquisa = document.getElementById('pesquisa').value.trim();

    divMaterias.innerHTML = Object.keys(materiasPorData)
        .sort().reverse()
        .map(data => `
            <div class="bg-zinc-200/50 dark:bg-zinc-800/80 rounded-lg p-3 transition-colors mb-2">
                <div class="pb-2 border-b border-zinc-300 dark:border-zinc-600 mb-2">
                    <h3 class="text-md font-semibold text-zinc-600 dark:text-zinc-300">${formatarDataParaExibicao(data)}</h3>
                </div>
                <div>
                ${materiasPorData[data]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((mat) => {
                        const originalIndex = materias.findIndex(m => m.timestamp === mat.timestamp);
                        return criarItemMateria(mat, originalIndex, termoPesquisa);
                    })
                    .join('')}
                </div>
            </div>
        `).join('');
}

function criarItemMateria(mat, originalIndex, termoPesquisa = "") {
    const textoExibido = termoPesquisa
        ? destacarTermo(mat.texto, termoPesquisa)
        : mat.texto;
    return `
        <div class="flex items-center gap-2">
            <div onclick="copiarMateria('${mat.texto.replace(/'/g, "\\'")}', 0, this)" data-timestamp="${mat.timestamp}"
                class="flex-grow py-1 px-2 rounded-lg cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all active:bg-zinc-400 dark:active:bg-zinc-500 min-w-0">
                <span class="text-sm sm:text-base text-zinc-600 dark:text-zinc-100 break-words">${textoExibido}</span>
            </div>
            <button onclick="event.stopPropagation(); moverParaFavoritas(${originalIndex})" title="Mover para favoritas"
                class="bg-transparent text-zinc-300 hover:text-yellow-500 dark:text-zinc-500 dark:hover:text-yellow-500 font-bold p-2 w-8 h-8 rounded text-sm transition-colors">
                <i class="fas fa-star"></i>
            </button>
            <button onclick="event.stopPropagation(); apagarMateria(${originalIndex})" title="Apagar matéria"
                class="bg-transparent text-zinc-300 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-500 font-bold p-2 w-8 h-8 rounded text-sm transition-colors">
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

function moverParaFavoritas(index) {
    if (index >= 0 && index < materias.length) {
        const materia = materias[index];

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

document.addEventListener('DOMContentLoaded', () => {
    const pesquisaInput = document.getElementById('pesquisa');
    const btnLimparPesquisa = document.getElementById('btn-limpar-pesquisa');

    if (pesquisaInput && btnLimparPesquisa) {
        pesquisaInput.addEventListener('input', () => {
            const hasText = pesquisaInput.value.trim() !== '';
            btnLimparPesquisa.dataset.active = hasText;
        });

        btnLimparPesquisa.addEventListener('click', () => {
            pesquisaInput.value = '';
            pesquisaInput.dispatchEvent(new Event('input'));
            filtrarMaterias();
        });

        // Zera o campo ao pressionar Enter
        pesquisaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                pesquisaInput.value = '';
                pesquisaInput.dispatchEvent(new Event('input'));
                filtrarMaterias();
            }
        });
    }
});