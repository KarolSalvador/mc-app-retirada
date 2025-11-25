function selecionarOpcao(opcao) {
    if (opcao === 'retirar') {
        window.location.href = "restaurante.html"; 
        
    } else if (opcao === 'delivery') {
        // 🛑 Opção Delivery: Não faz nada (apenas mostra um aviso no console)
        console.log("Funcionalidade de Delivery ainda não implementada.");
        // alert("Entrega por delivery indisponível no momento."); 
        
    } else {
        console.error("Opção de pedido inválida: " + opcao);
    }
}

function irParaInicio() {
    // Redireciona para o arquivo de início
    window.location.href = "Inicio.html";
}