function selecionarOpcao(opcao) {
    if (opcao === 'retirar') {
        window.location.href = "restaurante.html";
        
    } else if (opcao === 'delivery') {
        
        console.log("Funcionalidade de Delivery ainda não implementada.");
        
        
    } else {
        console.error("Opção de pedido inválida: " + opcao);
    }
}

function irParaInicio() {
    // Redireciona para o arquivo de início
    window.location.href = "Inicio.html";
}

function irPararestaurante() {
    // Redireciona para o arquivo de restaurante
    window.location.href = "restaurante.html";
}

function irParaResumoPedido() {
    // Redireciona para o arquivo de resumo do pedido
    window.location.href = "resumo-pedido.html";
}