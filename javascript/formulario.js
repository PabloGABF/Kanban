document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "kanban_tarefas";

    const formulario = document.querySelector(".formulario-tarefa");
    const tituloInput = document.getElementById("titulo-tarefa");
    const descricaoInput = document.getElementById("descricao-tarefa");
    const responsavelInput = document.getElementById("responsavel-tarefa");
    const dataLimiteInput = document.getElementById("data-limite");
    const colunaInput = document.getElementById("coluna-tarefa");
    const botaoSubmit = document.querySelector(".btn-primario");
    const tituloPagina = document.querySelector(".cabecalho-tarefa h2");

    if (!formulario || !tituloInput || !dataLimiteInput) {
        return;
    }

    const criarChaveHoje = () => {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    };

    const lerTarefas = () => {
        try {
            const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(dados) ? dados : [];
        } catch {
            return [];
        }
    };

    const salvarTarefas = (tarefas) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
    };

    const hoje = criarChaveHoje();
    const parametros = new URLSearchParams(window.location.search);
    const parametroEdicao = parametros.get("edit");
    const indiceRecebido =
        parametroEdicao === null ? null : Number(parametroEdicao);
    const listaTarefas = lerTarefas();

    const modoEdicao =
        Number.isInteger(indiceRecebido) &&
        indiceRecebido >= 0 &&
        Boolean(listaTarefas[indiceRecebido]);

    const tarefaOriginal = modoEdicao ? listaTarefas[indiceRecebido] : null;
    const prazoOriginal = tarefaOriginal?.dataLimite || "";

    /*
       O mínimo no navegador bloqueia a escolha visual de datas passadas.
       Em edição, mantemos o prazo antigo caso a tarefa já esteja atrasada,
       para que ela possa ser corrigida sem perder os dados.
    */
    dataLimiteInput.min =
        modoEdicao && prazoOriginal && prazoOriginal < hoje
            ? prazoOriginal
            : hoje;

    if (modoEdicao) {
        tituloInput.value = tarefaOriginal.titulo || "";
        descricaoInput.value = tarefaOriginal.descricao || "";
        responsavelInput.value = tarefaOriginal.responsavel || "";
        dataLimiteInput.value = prazoOriginal;

        const radioPrioridade = document.querySelector(
            `input[name="prioridade"][value="${tarefaOriginal.prioridade || "baixa"}"]`
        );

        if (radioPrioridade) {
            radioPrioridade.checked = true;
        }

        if (colunaInput) {
            colunaInput.value = tarefaOriginal.status || "to-do";
        }

        if (tituloPagina) {
            tituloPagina.textContent = "Editar Tarefa";
        }

        if (botaoSubmit) {
            botaoSubmit.textContent = "Salvar Alterações";
        }
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const prazoEscolhido = dataLimiteInput.value;

        if (!prazoEscolhido) {
            window.alert("Informe a data limite da tarefa.");
            dataLimiteInput.focus();
            return;
        }

        /*
           A edição de uma tarefa antiga é permitida sem alterar seu prazo.
           Porém, se o usuário informar uma nova data, ela não pode estar no passado.
        */
        const prazoFoiAlterado = !modoEdicao || prazoEscolhido !== prazoOriginal;

        if (prazoFoiAlterado && prazoEscolhido < hoje) {
            window.alert("Não é possível criar ou alterar uma tarefa para uma data que já passou.");
            dataLimiteInput.focus();
            return;
        }

        const prioridadeSelecionada = document.querySelector(
            'input[name="prioridade"]:checked'
        );

        const tarefa = {
            id: modoEdicao ? tarefaOriginal.id : Date.now(),
            titulo: tituloInput.value.trim(),
            descricao: descricaoInput?.value.trim() || "",
            responsavel: responsavelInput?.value || "",
            dataLimite: prazoEscolhido,
            prioridade: prioridadeSelecionada?.value || "baixa",
            status: colunaInput?.value || tarefaOriginal?.status || "to-do"
        };

        if (modoEdicao) {
            listaTarefas[indiceRecebido] = tarefa;
        } else {
            listaTarefas.push(tarefa);
        }

        salvarTarefas(listaTarefas);
        window.location.href = "index.html";
    });
});