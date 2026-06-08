// 1. Seleciona o corpo da tabela no HTML
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