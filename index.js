function calcularValor() {
    const metodoDePagamento = document.getElementById("metodoDePagamento").value;
    const itensInput = document.getElementById("itens").value.trim();

    if (!itensInput) {
        document.getElementById("resultado").textContent = "Não há itens no carrinho de compra!";
        return;
    }

    const itensArray = itensInput.split(";").map(item => item.trim());

    const caixa = new CaixaDaLanchonete();
    const resultado = caixa.calcularValorDaCompra(metodoDePagamento, itensArray);

    document.getElementById("resultado").textContent = resultado;

    // Atualiza a tabela de produtos
    atualizarTabela(itensArray);
}

function atualizarTabela(itensArray) {
    const tabelaBody = document.getElementById("produtoTableBody");
    tabelaBody.innerHTML = "";

    for (const item of itensArray) {
        const [codigo, quantidade] = item.split(",");
        const descricao = descricaoDoCodigo(codigo);
        const valor = calcularValorItem(codigo, quantidade);

        const row = tabelaBody.insertRow();
        row.insertCell().textContent = codigo;
        row.insertCell().textContent = descricao;
        row.insertCell().textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }
}

function descricaoDoCodigo(codigo) {
    const descricaoMap = {
        cafe: "Café",
        chantily: "Chantily (extra do Café)",
        suco: "Suco Natural",
        sanduiche: "Sanduíche",
        queijo: "Queijo (extra do Sanduíche)",
        salgado: "Salgado",
        combo1: "Suco e 1 Sanduíche",
        combo2: "Café e 1 Sanduíche"
    };
    return descricaoMap[codigo] || "Descrição não encontrada";
}

function calcularValorItem(codigo, quantidade) {
    const caixa = new CaixaDaLanchonete();
    const valorUnitario = caixa.cardapio[codigo] || 0;
    return valorUnitario * quantidade;
}

class CaixaDaLanchonete {
    constructor() {
        this.cardapio = {
            cafe: 3.00,
            chantily: 1.50,
            suco: 6.20,
            sanduiche: 6.50,
            queijo: 2.00,
            salgado: 7.25,
            combo1: 9.50,
            combo2: 7.50
        };
    }

    calcularValorDaCompra(metodoDePagamento, itens) {
        const metodoDePagamentoValidas = ['debito', 'credito', 'dinheiro'];
        if (!metodoDePagamentoValidas.includes(metodoDePagamento)) {
            return "Método de pagamento inválida!";
        }

        let valorTotal = 0;
        let mensagemErro = '';

        const itensPrincipais = new Set();
        const itensExtras = new Set();

        for (const item of itens) {
            const [codigo, quantidade] = item.split(',');

            if (!this.cardapio[codigo]) {
                mensagemErro = "Item inválido!";
                break;
            }

            if (codigo !== 'chantily' && codigo !== 'queijo') {
                itensPrincipais.add(codigo);
            } else {
                itensExtras.add(codigo);
            }

            valorTotal += this.cardapio[codigo] * quantidade;
        }

        if (mensagemErro) {
            return mensagemErro;
        }

        if (valorTotal === 0) {
            return "Quantidade inválida!";
        }

        if (itensPrincipais.size === 0) {
            return "Não há itens principais no carrinho de compra!";
        }

        for (const itemExtra of itensExtras) {
            const itemPrincipal = this.getItemPrincipal(itemExtra);
            if (!itensPrincipais.has(itemPrincipal)) {
                return "Item extra não pode ser pedido sem o principal";
            }
        }

        if (metodoDePagamento === 'dinheiro') {
            valorTotal *= 0.95; // 5% de desconto
        } else if (metodoDePagamento === 'credito') {
            valorTotal *= 1.03; // 3% de acréscimo
        }

        return `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    }

    isCombo(codigo) {
        return codigo.startsWith('combo');
    }

    getItemPrincipal(codigo) {
        if (codigo === 'chantily') {
            return 'cafe';
        } else if (codigo === 'queijo') {
            return 'sanduiche';
        }
        return codigo;
    }
}

// Exemplos de uso
const caixa = new CaixaDaLanchonete();

console.log(caixa.calcularValorDaCompra('debito', ['chantily,1'])); // "Item extra não pode ser pedido sem o principal"
console.log(caixa.calcularValorDaCompra('debito', ['cafe,1','chantily,1'])); // "R$ 4,50"
console.log(caixa.calcularValorDaCompra('credito', ['combo1,1','cafe,2'])); // "R$ 15,96"
