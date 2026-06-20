document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "kanban_tarefas";
    const colunas = document.querySelectorAll(".coluna");
    let indiceArrastado = null;

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

    const criarChaveHoje = () => {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    };

    const hoje = criarChaveHoje();

    const formatarResponsavel = (valor) => {
        const nomes = {
            pablo: "Pablo",
            maria: "Camilli",
            joao: "Pedro"
        };

        return nomes[valor] || valor || "Não atribuído";
    };

    const formatarPrioridade = (prioridade) => {
        const nomes = {
            baixa: "Baixa",
            media: "Média",
            alta: "Alta"
        };

        return nomes[prioridade] || "Baixa";
    };

    const formatarData = (chaveData) => {
        if (!chaveData || !/^\d{4}-\d{2}-\d{2}$/.test(chaveData)) {
            return "Sem prazo";
        }

        const [ano, mes, dia] = chaveData.split("-").map(Number);

        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(new Date(ano, mes - 1, dia));
    };

    const tarefaEstaAtrasada = (tarefa) => {
        return Boolean(
            tarefa.dataLimite &&
            tarefa.dataLimite < hoje &&
            tarefa.status !== "done"
        );
    };

    const criarBotaoAcao = (icone, titulo, classeExtra, aoClicar) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = `btn-acao ${classeExtra}`;
        botao.textContent = icone;
        botao.title = titulo;
        botao.setAttribute("aria-label", titulo);
        botao.addEventListener("click", aoClicar);

        return botao;
    };

    const criarCartao = (tarefa, indice) => {
        const article = document.createElement("article");
        const prioridade = tarefa.prioridade || "baixa";
        const atrasada = tarefaEstaAtrasada(tarefa);

        article.className = "cartao-tarefa";
        article.draggable = true;
        article.dataset.indice = String(indice);

        if (atrasada) {
            article.classList.add("cartao-atrasado");
        }

        const acoes = document.createElement("div");
        acoes.className = "acoes-cartao";

        const botaoEditar = criarBotaoAcao(
            "✎",
            "Editar tarefa",
            "btn-editar",
            () => {
                window.location.href = `criar_tarefa.html?edit=${indice}`;
            }
        );

        const botaoExcluir = criarBotaoAcao(
            "⌫",
            "Excluir tarefa",
            "btn-excluir",
            () => {
                const confirmar = window.confirm("Tem certeza que deseja excluir esta tarefa?");

                if (!confirmar) {
                    return;
                }

                const tarefas = lerTarefas();
                tarefas.splice(indice, 1);
                salvarTarefas(tarefas);
                renderizarKanban();
            }
        );

        acoes.append(botaoEditar, botaoExcluir);

        const titulo = document.createElement("h3");
        titulo.textContent = tarefa.titulo || "Tarefa sem título";

        const descricao = document.createElement("p");
        descricao.className = "descricao-cartao";
        descricao.textContent = tarefa.descricao || "Sem descrição";

        const responsavel = document.createElement("small");
        responsavel.className = "responsavel";
        responsavel.textContent = `Responsável: ${formatarResponsavel(tarefa.responsavel)}`;

        const meta = document.createElement("div");
        meta.className = "meta-cartao";

        const badgePrioridade = document.createElement("span");
        badgePrioridade.className = `badge-prioridade prioridade-${prioridade}`;
        badgePrioridade.textContent = `Prioridade: ${formatarPrioridade(prioridade)}`;

        const prazo = document.createElement("span");
        prazo.className = "prazo-cartao";
        prazo.textContent = tarefa.dataLimite
            ? `Prazo: ${formatarData(tarefa.dataLimite)}`
            : "Prazo não informado";

        meta.append(badgePrioridade, prazo);

        if (atrasada) {
            const badgeAtraso = document.createElement("span");
            badgeAtraso.className = "prazo-cartao prazo-atrasado";
            badgeAtraso.textContent = "Atrasado";
            meta.appendChild(badgeAtraso);
        }

        article.append(acoes, titulo, descricao, responsavel, meta);

        article.addEventListener("dragstart", (evento) => {
            indiceArrastado = indice;
            article.classList.add("arrastando");

            evento.dataTransfer.effectAllowed = "move";
            evento.dataTransfer.setData("text/plain", String(indice));
        });

        article.addEventListener("dragend", () => {
            indiceArrastado = null;
            article.classList.remove("arrastando");
            colunas.forEach((coluna) => coluna.classList.remove("drag-over"));
        });

        return article;
    };

    const renderizarKanban = () => {
        const tarefas = lerTarefas();

        colunas.forEach((coluna) => {
            const area = coluna.querySelector(".area-cartoes");
            if (area) {
                area.replaceChildren();
            }
        });

        tarefas.forEach((tarefa, indice) => {
            const status = tarefa.status || "to-do";
            const coluna = document.getElementById(status) || document.getElementById("to-do");
            const area = coluna?.querySelector(".area-cartoes");

            if (area) {
                area.appendChild(criarCartao(tarefa, indice));
            }
        });
    };

    colunas.forEach((coluna) => {
        coluna.addEventListener("dragover", (evento) => {
            evento.preventDefault();
            evento.dataTransfer.dropEffect = "move";
            coluna.classList.add("drag-over");
        });

        coluna.addEventListener("dragleave", (evento) => {
            if (!coluna.contains(evento.relatedTarget)) {
                coluna.classList.remove("drag-over");
            }
        });

        coluna.addEventListener("drop", (evento) => {
            evento.preventDefault();
            coluna.classList.remove("drag-over");

            const indiceTransferido = Number(evento.dataTransfer.getData("text/plain"));
            const indice = Number.isInteger(indiceTransferido)
                ? indiceTransferido
                : indiceArrastado;

            if (!Number.isInteger(indice)) {
                return;
            }

            const tarefas = lerTarefas();

            if (!tarefas[indice]) {
                return;
            }

            tarefas[indice].status = coluna.id;
            salvarTarefas(tarefas);
            renderizarKanban();
        });
    });

    window.addEventListener("storage", renderizarKanban);

    renderizarKanban();
});