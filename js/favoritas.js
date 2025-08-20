/**************************************
 * FUNÇÕES PARA MATÉRIAS FAVORITAS    *
 **************************************/
function exibirFavoritas(favoritasParaExibir = null) {
    const divFavoritas = document.getElementById('favoritas');
    const favoritasExibidas = favoritasParaExibir || favoritas;

    if (favoritasExibidas.length === 0) {
        const termoPesquisa = document.getElementById('pesquisa').value.trim();
        if (termoPesquisa) {
            divFavoritas.innerHTML = '<div class="text-center py-2 text-zinc-500 dark:text-zinc-400">Nenhuma favorita encontrada na pesquisa</div>';
        } else {
            divFavoritas.innerHTML = '<div class="text-center py-2 text-zinc-500 dark:text-zinc-400">Nenhuma matéria favorita adicionada</div>';
        }
        return;
    }

    const itensFavoritosHTML = favoritasExibidas
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(mat => {
            const originalIndex = favoritas.findIndex(fav => fav.timestamp === mat.timestamp);
            return `
            <div class="flex items-center gap-2">
                <div onclick="copiarMateria('${mat.texto.replace(/'/g, "\\'")}', 0, this)" data-timestamp="${mat.timestamp}"
                    class="flex-grow py-1 px-2 rounded-lg cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all active:bg-zinc-400 dark:active:bg-zinc-500 min-w-0">
                    <span class="text-sm sm:text-base text-zinc-600 dark:text-zinc-100 break-words">${mat.texto}</span>
                </div>
                <button onclick="moverParaMateriasNormais(${originalIndex})" class="bg-transparent text-blue-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold p-2 w-8 h-8 rounded text-sm transition-colors" title="Mover para Matérias">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button onclick="removerFavorita(${originalIndex})" class="bg-transparent text-red-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold p-2 w-8 h-8 rounded text-sm transition-colors" title="Remover Favorita">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        }).join('');

    divFavoritas.innerHTML = `
        <div class="bg-zinc-200/50 dark:bg-zinc-800/80 rounded-lg p-3 transition-colors">
            <div>
                ${itensFavoritosHTML}
            </div>
        </div>
    `;
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