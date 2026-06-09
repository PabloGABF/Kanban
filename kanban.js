document.addEventListener('DOMContentLoaded', () => {
    console.log("--- KANBAN: Iniciando leitura e Drag/Drop ---");
    
    const STORAGE_KEY = 'kanban_tarefas';
    const listaTarefas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // Selecionamos a área de cartões da coluna To-Do para renderização inicial
    const areaToDo = document.querySelector('#to-do .area-cartoes');

    // 1. RENDERIZAÇÃO DOS CARTÕES
    listaTarefas.forEach((tarefa, index) => {
        const article = document.createElement('article');
        article.className = 'cartao-tarefa';
        article.draggable = true; // ATRIBUTO ESSENCIAL: Diz ao navegador que este elemento pode ser arrastado
        article.dataset.id = index; // Penduramos o ID aqui para o futuro LocalStorage
        
        article.innerHTML = `
            <h3>${tarefa.titulo}</h3>
            <p>${tarefa.descricao || 'Sem descrição'}</p>
            <small>Responsável: ${tarefa.responsavel || 'Ninguém'}</small>
        `;

        // Eventos do CARTÃO (Quem está sendo arrastado)
        article.addEventListener('dragstart', () => {
            article.classList.add('arrastando');
        });

        article.addEventListener('dragend', () => {
            article.classList.remove('arrastando');
        });

        if (areaToDo) areaToDo.appendChild(article);
    });

    // 2. LÓGICA DAS COLUNAS (Zonas de Soltar / Dropzones)
    const colunas = document.querySelectorAll('.coluna');

    colunas.forEach(coluna => {
        const areaCartoes = coluna.querySelector('.area-cartoes');

        // dragover: O cartão está sobrevoando a coluna
        coluna.addEventListener('dragover', e => {
            e.preventDefault(); // REGRA DE OURO: O HTML5 bloqueia drops por padrão. O preventDefault libera.
            coluna.classList.add('drag-over'); // Efeito visual do CSS
            
            const cartaoArrastando = document.querySelector('.arrastando');
            if(cartaoArrastando) {
                areaCartoes.appendChild(cartaoArrastando); // Move fisicamente o cartão na DOM
            }
        });

        // dragleave: O cartão saiu de cima da coluna
        coluna.addEventListener('dragleave', () => {
            coluna.classList.remove('drag-over');
        });

        // drop: O usuário soltou o clique
        coluna.addEventListener('drop', () => {
            coluna.classList.remove('drag-over');
            // FUTURO: É exatamente aqui que vamos colocar a lógica para salvar a nova posição no LocalStorage!
            console.log("Cartão solto! Futura atualização de banco de dados entra aqui.");
        });
    });
});
