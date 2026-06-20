document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "kanban_tarefas";

    const tabela = document.querySelector(".tabela-calendario");
    const corpoCalendario = tabela?.querySelector("tbody");
    const tituloMes = document.getElementById("mes-ano-atual");
    const tituloDia = document.getElementById("titulo-dia-selecionado");
    const listaTarefas = document.getElementById("lista-tarefas");
    const botoesNavegacao = document.querySelectorAll(".btn-navegacao");

    if (!corpoCalendario || !tituloMes || !tituloDia || !listaTarefas) {
        return;
    }

    const criarChaveHoje = () => {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    };

    const hoje = new Date();
    const hojeChave = criarChaveHoje();

    let anoExibido = hoje.getFullYear();
    let mesExibido = hoje.getMonth();
    let dataSelecionada = null;

    const lerTarefas = () => {
        try {
            const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(dados) ? dados : [];
        } catch {
            return [];
        }
    };

    const pad = (numero) => String(numero).padStart(2, "0");

    const criarChaveData = (ano, mes, dia) => `${ano}-${pad(mes + 1)}-${pad(dia)}`;

    const formatarDataCompleta = (chaveData) => {
        const [ano, mes, dia] = chaveData.split("-").map(Number);

        return new Intl.DateTimeFormat("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date(ano, mes - 1, dia));
    };

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

    const tarefaEstaAtrasada = (tarefa) => {
        return Boolean(
            tarefa.dataLimite &&
            tarefa.dataLimite < hojeChave &&
            tarefa.status !== "done"
        );
    };

    const criarTexto = (conteudo, classe = "") => {
        const paragrafo = document.createElement("p");
        paragrafo.textContent = conteudo;

        if (classe) {
            paragrafo.className = classe;
        }

        return paragrafo;
    };

    const criarCartaoPainel = (tarefa) => {
        const cartao = document.createElement("article");
        cartao.className = "cartao-tarefa-calendario";

        if (tarefaEstaAtrasada(tarefa)) {
            cartao.classList.add("tarefa-atrasada");
        }

        const titulo = document.createElement("h4");
        titulo.textContent = tarefa.titulo || "Tarefa sem título";

        const responsavel = criarTexto(
            `Responsável: ${formatarResponsavel(tarefa.responsavel)}`
        );

        const prioridade = criarTexto(
            `Prioridade: ${formatarPrioridade(tarefa.prioridade)}`
        );

        cartao.append(titulo, responsavel, prioridade);

        if (tarefaEstaAtrasada(tarefa)) {
            cartao.appendChild(criarTexto("Status: Atrasado", "aviso-atraso"));
        }

        if (tarefa.descricao) {
            cartao.appendChild(
                criarTexto(tarefa.descricao, "descricao-tarefa-calendario")
            );
        }

        return cartao;
    };

    const mostrarTarefasDoDia = (chaveData) => {
        dataSelecionada = chaveData;

        const tarefasDoDia = lerTarefas().filter(
            (tarefa) => tarefa.dataLimite === chaveData
        );

        tituloDia.textContent = formatarDataCompleta(chaveData);
        listaTarefas.replaceChildren();

        if (tarefasDoDia.length === 0) {
            listaTarefas.appendChild(
                criarTexto("Nenhuma tarefa para este dia.")
            );
        } else {
            tarefasDoDia.forEach((tarefa) => {
                listaTarefas.appendChild(criarCartaoPainel(tarefa));
            });
        }

        document
            .querySelectorAll(".tabela-calendario td.dia-selecionado")
            .forEach((celula) => celula.classList.remove("dia-selecionado"));

        const celulaSelecionada = document.querySelector(
            `[data-data="${chaveData}"]`
        );

        if (celulaSelecionada) {
            celulaSelecionada.classList.add("dia-selecionado");
        }
    };

    const criarBotaoEvento = (tarefa, chaveData) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "evento-calendario";
        botao.textContent = tarefa.titulo || "Tarefa sem título";
        botao.title = tarefa.titulo || "Tarefa sem título";

        if (tarefaEstaAtrasada(tarefa)) {
            botao.classList.add("evento-atrasado");
        }

        botao.addEventListener("click", (evento) => {
            evento.stopPropagation();
            mostrarTarefasDoDia(chaveData);
        });

        return botao;
    };

    const renderizarCalendario = () => {
        const tarefas = lerTarefas();
        corpoCalendario.replaceChildren();

        tituloMes.textContent = new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric"
        })
            .format(new Date(anoExibido, mesExibido, 1))
            .replace(/^\w/, (letra) => letra.toUpperCase());

        const primeiroDiaSemana = new Date(
            anoExibido,
            mesExibido,
            1
        ).getDay();

        const totalDias = new Date(
            anoExibido,
            mesExibido + 1,
            0
        ).getDate();

        let dia = 1;

        while (dia <= totalDias) {
            const linha = document.createElement("tr");

            for (let indiceSemana = 0; indiceSemana < 7; indiceSemana += 1) {
                const celula = document.createElement("td");

                const deveFicarVazia =
                    (dia === 1 && indiceSemana < primeiroDiaSemana) ||
                    dia > totalDias;

                if (deveFicarVazia) {
                    celula.className = "dia-vazio";
                    linha.appendChild(celula);
                    continue;
                }

                const chaveData = criarChaveData(anoExibido, mesExibido, dia);

                celula.className = "dia-calendario";
                celula.dataset.data = chaveData;
                celula.tabIndex = 0;

                const numeroDia = document.createElement("time");
                numeroDia.className = "numero-dia";
                numeroDia.dateTime = chaveData;
                numeroDia.textContent = String(dia);
                celula.appendChild(numeroDia);

                const ehHoje =
                    chaveData === hojeChave;

                if (ehHoje) {
                    celula.classList.add("dia-atual");
                }

                if (chaveData === dataSelecionada) {
                    celula.classList.add("dia-selecionado");
                }

                tarefas
                    .filter((tarefa) => tarefa.dataLimite === chaveData)
                    .forEach((tarefa) => {
                        celula.appendChild(criarBotaoEvento(tarefa, chaveData));
                    });

                const selecionarDia = () => mostrarTarefasDoDia(chaveData);

                celula.addEventListener("click", selecionarDia);
                celula.addEventListener("keydown", (evento) => {
                    if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault();
                        selecionarDia();
                    }
                });

                linha.appendChild(celula);
                dia += 1;
            }

            corpoCalendario.appendChild(linha);
        }
    };

    const mudarMes = (direcao) => {
        mesExibido += direcao;

        if (mesExibido < 0) {
            mesExibido = 11;
            anoExibido -= 1;
        }

        if (mesExibido > 11) {
            mesExibido = 0;
            anoExibido += 1;
        }

        dataSelecionada = null;
        tituloDia.textContent = "Selecione um dia no calendário";
        listaTarefas.replaceChildren(
            criarTexto("Nenhuma tarefa selecionada.")
        );

        renderizarCalendario();
    };

    botoesNavegacao[0]?.addEventListener("click", () => mudarMes(-1));
    botoesNavegacao[1]?.addEventListener("click", () => mudarMes(1));

    window.addEventListener("storage", renderizarCalendario);

    renderizarCalendario();
});