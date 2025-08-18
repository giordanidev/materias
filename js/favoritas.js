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
                class="flex-grow py-1 px-2 bg-yellow-100 dark:bg-yellow-600/20 rounded-lg cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800/80 transition-all active:scale-95">
                <span class="text-sm sm:text-base text-zinc-600 dark:text-zinc-100 break-words">${mat.texto}</span>
            </div>
            <button onclick="moverParaMateriasNormais(${index})"
                class="bg-blue-500 hover:bg-blue-700/80 text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
                <i class="fas fa-arrow-left"></i>
            </button>
            <button onclick="removerFavorita(${index})"
                class="bg-red-500 hover:bg-red-700/80 text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function moverParaMateriasNormais(index) {
    if (index >= 0 && index < favoritas.length) {
        const materia = favoritas[index];
        
        if (materiaJaExiste(materia.texto, materia)) {
            mostrarAlerta('Esta matéria já existe na lista normal!', 'bg-yellow-500');
            return;
        }
        
        materias.unshift(materia);
        favoritas.splice(index, 1);
        salvarDados();
        exibirMaterias();
        exibirFavoritas();
        mostrarAlerta('Matéria movida para lista normal!', 'bg-blue-500');
    }
}

function removerFavorita(index) {
    if (index >= 0 && index < favoritas.length) {
        favoritas.splice(index, 1);
        salvarDados();
        exibirFavoritas();
        mostrarAlerta('Matéria favorita apagada!');
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

function adicionarMateria() {
    const input = document.getElementById('nova-materia');
    const texto = input.value.trim().replace(/\s+/g, ' ');
    const isFavorita = document.getElementById('nova-favorita').checked;

    if (!texto) return;

    if (materiaJaExiste(texto)) {
        mostrarAlerta('Esta matéria já existe nas listas!', 'bg-yellow-500');
        input.value = '';
        return;
    }

    const novaMateria = {
        texto,
        data: obterDataAtual(),
        timestamp: new Date().getTime()
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
    resetarEstiloCheckbox();

    // Atualizar interface
    salvarDados();
    atualizarSeletorDatas();
    exibirMaterias();
    exibirFavoritas();
    copiarMateria(texto, 300);
}

// Nova função para resetar o estilo do checkbox
function resetarEstiloCheckbox() {
    const checkboxDiv = document.querySelector('#nova-favorita + div');
    checkboxDiv.classList.remove('bg-yellow-500', 'dark:bg-yellow-600');
    checkboxDiv.querySelector('i').classList.remove('text-white');
}