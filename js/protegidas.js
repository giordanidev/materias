const API_URL = 'https://materias-protegidas.onrender.com/api/mensagens-protegidas';

let carregandoProtegidas = false;
let ultimaListaProtegidas = null;
let paginaAtualProtegidas = 1;
let totalPaginasProtegidas = 1;

/**
 * Carrega e exibe as matérias protegidas.
 */
async function carregarProtegidas(mostrarMensagem = false, pagina = 1) {
    carregandoProtegidas = true;
    mostrarCarregandoProtegidas();

    if (mostrarMensagem) {
        const div = document.getElementById('protegidas');
        if (div) {
            div.innerHTML = '<div class="text-center py-2 text-zinc-500 dark:text-zinc-400">Carregando matérias...</div>';
        }
    }

    try {
        const res = await fetch(`${API_URL}?page=${pagina}&limit=15`);
        const data = await res.json();
        //console.log('Protegidas:', data);
        const lista = Array.isArray(data.mensagens) ? data.mensagens
            : Array.isArray(data) ? data
            : [];
        paginaAtualProtegidas = data.page || 1;
        totalPaginasProtegidas = data.totalPages || 1;
        //console.log('Página:', paginaAtualProtegidas, 'Total páginas:', totalPaginasProtegidas, 'Itens:', lista.length);

        exibirProtegidas(lista);
        exibirPaginacaoProtegidas();
        ultimaListaProtegidas = lista;
    } catch (err) {
        document.getElementById('protegidas').innerHTML =
            '<div class="text-center py-2 text-red-500">Erro ao carregar matérias protegidas</div>';
    }
    carregandoProtegidas = false;
    mostrarCarregandoProtegidas();
}

/**
 * Compara duas listas de matérias protegidas.
 */
function listasIguais(lista1, lista2) {
    if (!Array.isArray(lista1) || !Array.isArray(lista2)) return false;
    if (lista1.length !== lista2.length) return false;
    for (let i = 0; i < lista1.length; i++) {
        if (lista1[i]._id !== lista2[i]._id || lista1[i].texto !== lista2[i].texto) return false;
    }
    return true;
}

/**
 * Filtra e exibe as matérias protegidas com base no termo de pesquisa.
 * @param {string} termoSemAcento
 * @param {string} termoOriginal
 */
function filtrarProtegidas(termoSemAcento, termoOriginal) {
    carregandoProtegidas = true;
    mostrarCarregandoProtegidas();

    fetch(`${API_URL}/search?termo=${encodeURIComponent(termoOriginal)}`)
        .then(res => res.json())
        .then(lista => {
            exibirProtegidas(lista, termoOriginal);
            document.getElementById('paginacao-protegidas').innerHTML = '';
        })
        .catch(() => {
            document.getElementById('protegidas').innerHTML =
                '<div class="text-center py-2 text-red-500">Erro ao carregar matérias protegidas</div>';
        })
        .finally(() => {
            carregandoProtegidas = false;
            mostrarCarregandoProtegidas();
        });
}

/**
 * Exibe as matérias protegidas na interface.
 * @param {Array} lista
 */
function exibirProtegidas(lista, termoPesquisa = "") {
    const div = document.getElementById('protegidas');
    if (!div) return;

    if (!lista.length) {
        div.innerHTML = '<div class="text-center py-2 text-zinc-500 dark:text-zinc-400">Nenhuma matéria protegida encontrada</div>';
        return;
    }

    const itensProtegidosHTML = lista
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .map(msg => {
            const textoExibido = termoPesquisa
                ? destacarTermo(msg.texto, termoPesquisa)
                : msg.texto;
            const podeApagar = (Date.now() - new Date(msg.data).getTime()) < 600000; // 10 min
            return `
            <div class="flex items-center gap-2">
                <div onclick="copiarMateria('${msg.texto.replace(/'/g, "\\'")}', 0, this)" data-timestamp="${msg._id}"
                    class="flex-grow py-1 px-2 rounded-lg cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all active:bg-zinc-400 dark:active:bg-zinc-500 min-w-0">
                    <span class="text-sm sm:text-base text-zinc-600 dark:text-zinc-100 break-words">${textoExibido}</span>
                </div>
                ${podeApagar
                    ? `<button onclick="apagarProtegida('${msg._id}')" class="bg-transparent text-zinc-300 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-500 font-bold p-2 w-8 min-w-8 h-8 rounded text-sm transition-colors" title="Apagar"><i class="fas fa-trash"></i></button>`
                    : `<button onclick="apagarProtegida('${msg._id}', true)" class="bg-transparent text-zinc-300 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-500 font-bold p-2 w-8 min-w-8 h-8 rounded text-sm transition-colors" title="Apagar com chave"><i class="fas fa-lock"></i></button>`
                }
            </div>
            `;
        }).join('');

    div.innerHTML = `
        <div class="bg-zinc-200/50 dark:bg-zinc-800/80 rounded-lg p-3 transition-colors">
            <div>
                ${itensProtegidosHTML}
            </div>
        </div>
    `;
}

/**
 * Exibe ou oculta o spinner de carregamento ao lado do título.
 */
function mostrarCarregandoProtegidas() {
    const titulo = document.querySelector('#protegidas-container h2');
    if (!titulo) return;
    let spinner = titulo.querySelector('.fa-spinner');
    if (carregandoProtegidas) {
        if (!spinner) {
            spinner = document.createElement('i');
            spinner.className = "fas fa-spinner fa-spin ml-2 text-zinc-500 dark:text-zinc-300";
            titulo.appendChild(spinner);
        }
    } else {
        if (spinner) spinner.remove();
    }
}

/**
 * Apaga uma matéria protegida.
 * @param {string} id
 * @param {boolean} exigeChave
 */
async function apagarProtegida(id, exigeChave = false) {
    let body = {};
    if (exigeChave) {
        const chave = document.getElementById('chave-acesso').value;
        if (!chave) {
            mostrarAlerta('Informe a chave de acesso!', 'bg-yellow-500');
            return;
        }
        body.chave = chave;
    }
    carregandoProtegidas = true;
    mostrarCarregandoProtegidas();
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await res.json();
    carregandoProtegidas = false;
    mostrarCarregandoProtegidas();
    if (result.sucesso) {
        mostrarAlerta('Mensagem protegida apagada!', 'bg-green-500');
        carregarProtegidas();
    } else {
        mostrarAlerta(result.erro || 'Erro ao apagar', 'bg-red-500');
    }
}

/**
 * Exibe a paginação das matérias protegidas.
 */
function exibirPaginacaoProtegidas() {
    const div = document.getElementById('paginacao-protegidas');
    if (!div) return;
    let html = '';
    if (totalPaginasProtegidas > 1) {
        html += `<div class="flex gap-2 justify-center mt-2">`;
        if (paginaAtualProtegidas > 1) {
            html += `<button onclick="carregarProtegidas(false, ${paginaAtualProtegidas - 1})" class="px-2 py-1 rounded bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-100">Anterior</button>`;
        }
        html += `<span class="px-2 py-1 text-sm text-zinc-500 dark:text-zinc-400">Página ${paginaAtualProtegidas} de ${totalPaginasProtegidas}</span>`;
        if (paginaAtualProtegidas < totalPaginasProtegidas) {
            html += `<button onclick="carregarProtegidas(false, ${paginaAtualProtegidas + 1})" class="px-2 py-1 rounded bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-100">Próxima</button>`;
        }
        html += `</div>`;
    }
    div.innerHTML = html;
}

/**
 * Adiciona uma nova matéria protegida.
 * @param {string} texto
 * @param {string} origem
 */
async function adicionarMateriaProtegida(texto, origem = 'manual') {
    // Busca todas as protegidas para verificar duplicidade
    const res = await fetch(`${API_URL}?limit=1000`);
    const data = await res.json();
    const lista = Array.isArray(data.mensagens) ? data.mensagens : Array.isArray(data) ? data : [];
    const jaExiste = lista.some(msg => msg.texto.trim().toLowerCase() === texto.trim().toLowerCase());
    if (jaExiste) {
        mostrarAlerta('Matéria já existe em protegidas!', 'bg-yellow-500');
        return false;
    }
    // Adiciona se não existir
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, origem })
    });
    mostrarAlerta('Matéria protegida adicionada!', 'bg-blue-500');
    carregarProtegidas(false);
    return true;
}

// Atualiza a lista protegida ao carregar e a cada 30 segundos
document.addEventListener('DOMContentLoaded', () => {
    carregarProtegidas(true); // Mostra mensagem "Carregando matérias..." só na primeira vez
    setInterval(() => {
        carregandoProtegidas = true;
        mostrarCarregandoProtegidas();
        carregarProtegidas(false); // Só mostra spinner, sem mensagem
    }, 30000);
});