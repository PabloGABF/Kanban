document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('.formulario-tarefa');
    
    // Mapeamento dos campos
    const tituloInput = document.getElementById('titulo-tarefa');
    const descInput = document.getElementById('descricao-tarefa');
    const respInput = document.getElementById('responsavel-tarefa');
    const btnSubmit = document.querySelector('.btn-primario');
    const tituloPagina = document.querySelector('.cabecalho-tarefa h2');

    // 1. VERIFICAÇÃO DE MODO (Criação vs Edição)
    const urlParams = new URLSearchParams(window.location.search);
    const editIndex = urlParams.get('edit');
    let listaTarefas = JSON.parse(localStorage.getItem('kanban_tarefas')) || [];

    // Se existe um índice na URL e essa tarefa existe no banco de dados
    if (editIndex !== null && listaTarefas[editIndex]) {
        const tarefaEditada = listaTarefas[editIndex];
        
        // Preenche os campos com os dados antigos
        if (tituloInput) tituloInput.value = tarefaEditada.titulo;
        if (descInput) descInput.value = tarefaEditada.descricao;
        if (respInput) respInput.value = tarefaEditada.responsavel;
        
        // Marca o radio button correto de prioridade
        const prioridadeRadio = document.querySelector(`input[name="prioridade"][value="${tarefaEditada.prioridade}"]`);
        if (prioridadeRadio) prioridadeRadio.checked = true;

        // Adaptação visual para o usuário não se confundir
        if (tituloPagina) tituloPagina.textContent = "Editar Tarefa";
        if (btnSubmit) btnSubmit.textContent = "Salvar Alterações";
    }

    // 2. SALVANDO OS DADOS
    if (formulario) {
        formulario.addEventListener('submit', function(evento) {
            evento.preventDefault();

            // Monta o objeto. Se estiver editando, mantém o ID e o Status que a tarefa já tinha.
            const novaTarefa = {
                id: (editIndex !== null) ? listaTarefas[editIndex].id : Date.now(),
                titulo: tituloInput.value,
                descricao: descInput ? descInput.value : '',
                responsavel: respInput ? respInput.value : 'Não atribuído',
                prioridade: document.querySelector('input[name="prioridade"]:checked').value,
                status: (editIndex !== null) ? listaTarefas[editIndex].status : 'to-do' 
            };

            if (editIndex !== null) {
                // Modo Edição: Substitui a tarefa na mesma posição
                listaTarefas[editIndex] = novaTarefa;
            } else {
                // Modo Criação: Adiciona no final da fila
                listaTarefas.push(novaTarefa);
            }

            localStorage.setItem('kanban_tarefas', JSON.stringify(listaTarefas));
            
            // Retorna ao quadro principal
            window.location.href = 'index.html'; 
        });
    }
});
