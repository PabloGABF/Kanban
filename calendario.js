document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "kanban_tarefas";
    const tabela = document.querySelector(".tabela-calendario");
    const corpoCalendario = tabela?.querySelector("tbody");
    const tituloMes = document.getElementById("mes-ano-atual");
    const tituloDia = document.getElementById("titulo-dia-selecionado");
    const listaTarefas = document.getElementById("lista-tarefas");
    const botoesNavegacao = document.querySelectorAll(".btn-navegacao");

    if (!corpoCalendario || !tituloMes || !tituloDia || !listaTarefas) return;

    const hoje = new Date();
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

    const formatarData = (chave) => {
        const [ano, mes, dia] = chave.split("-").map(Number);
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

    const criarCartaoPainel = (tarefa) => {
        const cartao = document.createElement("article");
        cartao.className = "cartao-tarefa-calendario";

        const titulo = document.createElement("h4");
        titulo.textContent = tarefa.titulo || "Tarefa sem título";

        const responsavel = document.createElement("p");
        responsavel.textContent = `Responsável: ${formatarResponsavel(tarefa.responsavel)}`;

        cartao.append(titulo, responsavel);

        if (tarefa.descricao) {
            const descricao = document.createElement("p");
            descricao.className = "descricao-tarefa-calendario";
            descricao.textContent = tarefa.descricao;
            cartao.appendChild(descricao);
        }

        return cartao;
    };

    const mostrarTarefasDoDia = (chaveData) => {
        dataSelecionada = chaveData;
        const tarefas = lerTarefas().filter((tarefa) => tarefa.dataLimite === chaveData);

        tituloDia.textContent = formatarData(chaveData);
        listaTarefas.replaceChildren();

        if (tarefas.length === 0) {
            const vazio = document.createElement("p");
            vazio.textContent = "Nenhuma tarefa para este dia.";
            listaTarefas.appendChild(vazio);
        } else {
            tarefas.forEach((tarefa) => listaTarefas.appendChild(criarCartaoPainel(tarefa)));
        }

        document.querySelectorAll(".tabela-calendario td.dia-selecionado").forEach((celula) => {
            celula.classList.remove("dia-selecionado");
        });

        const celulaSelecionada = document.querySelector(`[data-data="${chaveData}"]`);
        if (celulaSelecionada) celulaSelecionada.classList.add("dia-selecionado");
    };

    const criarBotaoEvento = (tarefa, chaveData) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "evento-calendario";
        botao.textContent = tarefa.titulo || "Tarefa sem título";
        botao.title = tarefa.titulo || "Tarefa sem título";

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
        }).format(new Date(anoExibido, mesExibido, 1))
            .replace(/^\w/, (letra) => letra.toUpperCase());

        const primeiroDiaSemana = new Date(anoExibido, mesExibido, 1).getDay();
        const totalDias = new Date(anoExibido, mesExibido + 1, 0).getDate();
        let dia = 1;

        while (dia <= totalDias) {
            const linha = document.createElement("tr");

            for (let indiceSemana = 0; indiceSemana < 7; indiceSemana += 1) {
                const celula = document.createElement("td");

                if ((dia === 1 && indiceSemana < primeiroDiaSemana) || dia > totalDias) {
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
                    dia === hoje.getDate() &&
                    mesExibido === hoje.getMonth() &&
                    anoExibido === hoje.getFullYear();

                if (ehHoje) celula.classList.add("dia-atual");
                if (chaveData === dataSelecionada) celula.classList.add("dia-selecionado");

                tarefas
                    .filter((tarefa) => tarefa.dataLimite === chaveData)
                    .forEach((tarefa) => celula.appendChild(criarBotaoEvento(tarefa, chaveData)));

                const selecionar = () => mostrarTarefasDoDia(chaveData);
                celula.addEventListener("click", selecionar);
                celula.addEventListener("keydown", (evento) => {
                    if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault();
                        selecionar();
                    }
                });

                linha.appendChild(celula);
                dia += 1;
            }

            corpoCalendario.appendChild(linha);
        }
    };

    if (botoesNavegacao[0]) {
        botoesNavegacao[0].addEventListener("click", () => {
            mesExibido -= 1;
            if (mesExibido < 0) {
                mesExibido = 11;
                anoExibido -= 1;
            }
            dataSelecionada = null;
            tituloDia.textContent = "Selecione um dia no calendário";
            listaTarefas.innerHTML = "<p>Nenhuma tarefa selecionada.</p>";
            renderizarCalendario();
        });
    }

    if (botoesNavegacao[1]) {
        botoesNavegacao[1].addEventListener("click", () => {
            mesExibido += 1;
            if (mesExibido > 11) {
                mesExibido = 0;
                anoExibido += 1;
            }
            dataSelecionada = null;
            tituloDia.textContent = "Selecione um dia no calendário";
            listaTarefas.innerHTML = "<p>Nenhuma tarefa selecionada.</p>";
            renderizarCalendario();
        });
    }

    renderizarCalendario();
});// 1. Seleciona o corpo da tabela no HTML
const corpoCalendario = document.querySelector('.tabela-calendario tbody');

// 2. Limpa qualquer dia escrito à mão (Hardcoded) no HTML
corpoCalendario.innerHTML = '';

// 3. Configura a Data (Exemplo: Junho de 2026)
const ano = 2026;
const mes = 5; // ATENÇÃO: No JavaScript, Janeiro é 0 e Junho é 5!

// 4. Matemática do Calendário
const diasDoMes = new Date(ano, mes + 1, 0).getDate(); // Descobre que tem 30 dias
const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay(); // Descobre que dia 1 cai numa Segunda (1)

let diaAtual = 1;
let construtorHTML = '';

// 5. O Loop de Semanas (Cria até 6 linhas de semanas)
for (let semana = 0; semana < 6; semana++) {
    let linha = '<tr>';

    // O Loop de Dias (Cria as 7 colunas da semana)
    for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
        
        // Coloca buracos vazios antes do dia 1 ou depois do último dia
        if ((semana === 0 && diaSemana < primeiroDiaDaSemana) || (diaAtual > diasDoMes)) {
            linha += '<td class="dia-vazio"></td>';
        } else {
            // Cria o bloco do dia real com a tag semântica que aprendemos
            linha += `<td><time datetime="${ano}-06-${diaAtual.toString().padStart(2, '0')}">${diaAtual}</time></td>`;
            diaAtual++; // Passa para o próximo dia
        }
    }
    
    linha += '</tr>';
    construtorHTML += linha; // Guarda a linha construída

    // Se já passou do dia 30, para de fabricar novas semanas
    if (diaAtual > diasDoMes) {
        break; 
    }
}

// 6. O Tiro de Canhão: Injeta todo o HTML gerado de uma vez só na tela!
corpoCalendario.innerHTML = construtorHTML;
