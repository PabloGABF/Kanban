document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('.formulario-tarefa');
    
    console.log("Formulário carregado:", formulario);

    if (formulario) {
        formulario.addEventListener('submit', function(evento) {
            evento.preventDefault();
            console.log("Submit detectado! Iniciando salvamento...");

            // Vamos capturar os campos um por um com verificação
            const titulo = document.getElementById('titulo-tarefa');
            const desc = document.getElementById('descricao-tarefa');
            const resp = document.getElementById('responsavel-tarefa');
            
            console.log("Elementos encontrados:", {titulo, desc, resp});

            if (!titulo) {
                console.error("ERRO: O campo 'titulo-tarefa' não foi encontrado no HTML!");
                return;
            }

            const novaTarefa = {
                id: Date.now(),
                titulo: titulo.value,
                descricao: desc ? desc.value : '',
                responsavel: resp ? resp.value : 'Não atribuído',
                prioridade: document.querySelector('input[name="prioridade"]:checked').value,
                status: 'a-fazer'
            };

            console.log("Objeto criado:", novaTarefa);

            try {
                let lista = JSON.parse(localStorage.getItem('kanban_tarefas')) || [];
                lista.push(novaTarefa);
                localStorage.setItem('kanban_tarefas', JSON.stringify(lista));
                console.log("SUCESSO: Tarefa salva no localStorage!");
                
                // Redirecionamento comentado para vermos o console
                // window.location.href = 'index.html'; 
            } catch (err) {
                console.error("ERRO AO SALVAR:", err);
            }
        });
    } else {
        console.error("ERRO: Formulário com classe 'formulario-tarefa' não encontrado no HTML!");
    }
});