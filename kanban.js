document.addEventListener('DOMContentLoaded', () => {
    console.log("--- KANBAN: Iniciando leitura ---");
    
    // 1. Busca os dados
    const STORAGE_KEY = 'kanban_tarefas';
    const listaTarefas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    console.log("Kanban: Encontrei esta lista de tarefas:", listaTarefas);

    // 2. Busca o container
    const colunaAFazer = document.getElementById('a-fazer');
    console.log("Kanban: Elemento 'a-fazer' encontrado?", colunaAFazer);

    if (!colunaAFazer) {
        console.error("ERRO CRÍTICO: Div 'a-fazer' não foi encontrada!");
        return;
    }

    // 3. Renderização forçada (sem filtros)
    if (listaTarefas.length === 0) {
        console.log("Kanban: O banco está vazio.");
    }

    listaTarefas.forEach((tarefa, index) => {
        console.log(`Renderizando tarefa ${index}: ${tarefa.titulo}`);
        
        // Criamos o elemento do zero para evitar erros de texto
        const article = document.createElement('article');
        article.className = 'cartao-tarefa';
        article.innerHTML = `
            <h3>${tarefa.titulo}</h3>
            <p>${tarefa.descricao || 'Sem descrição'}</p>
            <small>Responsável: ${tarefa.responsavel || 'Ninguém'}</small>
        `;

        // Adiciona à coluna
        colunaAFazer.appendChild(article);
        console.log("Cartão adicionado visualmente!");
    });
});