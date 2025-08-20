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
                class="flex-grow py-1 px-2 bg-yellow-100 dark:bg-yellow-600/20 rounded-lg cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800/80 transition-all">
                <span class="text-sm sm:text-base text-zinc-600 dark:text-zinc-100 break-words">${mat.texto}</span>
            </div>
            <button onclick="moverParaMateriasNormais(${index})"
                class="bg-zinc-300 dark:bg-zinc-700 text-blue-600 dark:hover:bg-blue-600/80 hover:bg-blue-600/80 hover:text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
                <i class="fas fa-arrow-left"></i>
            </button>
            <button onclick="removerFavorita(${index})"
                class="bg-zinc-300 dark:bg-zinc-700 text-red-600 hover:bg-red-600/80 dark:hover:bg-red-600/80 hover:text-white font-bold px-3 h-8 rounded text-sm transition-transform active:scale-95">
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

// Nova função para resetar o estilo do checkbox
function resetarEstiloCheckbox() {
    const checkboxDiv = document.querySelector('#nova-favorita + div');
    checkboxDiv.classList.remove('bg-yellow-500', 'dark:bg-yellow-600');
    checkboxDiv.querySelector('i').classList.remove('text-white');
}