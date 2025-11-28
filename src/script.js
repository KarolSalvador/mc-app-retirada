// Constante para a URL base da API na n8n
const FRONTEND_HOST = 'localhost';
const N8N_BASE_URL = `http://${FRONTEND_HOST}:5678/webhook/restaurantes`;
const STRAPI_BASE_URL = `http://${FRONTEND_HOST}:1337`;


const MOCK_ORDER_DATA = {
    itemSummary: '1x Combo do Quarteirão M, 1x Combo do Mc Lanche Feliz',
    estimatedTime: '25-35 min',
    orderCode: '#ORD-6147'
};

// Variáveis globais para armazenar as coordenadas (usadas pelo Inicio.html)
let userLatitude = null;
let userLongitude = null;

// 1. FUNÇÃO DE SUCESSO: Armazena a localização nas variáveis
function success(position) {
    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;
    console.log("Localização obtida e armazenada. Lat:", userLatitude, "Lon:", userLongitude);
}

// 2. FUNÇÃO DE ERRO: Apenas loga o erro no console
function error(err) {
    console.error("Erro de Geolocalização:", err.message);R
}


// 3. FUNÇÃO PARA INICIAR A SOLICITAÇÃO DE GEOLOCALIZAÇÃO
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, { timeout: 10000 });
    } else {
        console.error("Geolocalização não é suportada por este navegador.");
    }
}

async function fetchRestaurantsAPI(lat, lon) {
    const apiUrl = `${N8N_BASE_URL}?lat=${lat}&lon=${lon}`;
    console.log(`Chamando API: ${apiUrl}`);

    return fetch(apiUrl, { timeout: 10000 });
}

// 4. FUNÇÃO DE REDIRECIONAMENTO (CHAMADA PELO BOTÃO)
async function selecionarOpcao(opcao) {
    if (opcao === 'retirar') {
        let finalLat = userLatitude;
        let finalLon = userLongitude;

        // Verifica se as coordenadas são nulas ou inválidas (Fallback)
        if (!finalLat || !finalLon || isNaN(finalLat) || isNaN(finalLon)) {
            console.warn(
                "Localização real não obtida ou inválida. Usando coordenadas fallback (Araraquara/SP)."
            );
            // DEBUG: Coordenadas de Fallback perto dos dados (Araraquara)
            finalLat = -21.78;
            finalLon = -48.18;
        } else {
            console.log("Localização obtida. Armazenando no sessionStorage.");
        }

        // Salva as coordenadas, seja a real ou o fallback
        sessionStorage.setItem("userLatitude", finalLat);
        sessionStorage.setItem("userLongitude", finalLon);

        try {
            console.log("Aguardando resposta da API do n8n...");

            const apiResponse = await fetchRestaurantsAPI(finalLat, finalLon);

            if (!apiResponse.ok) {
                throw new Error(`Status ${apiResponse.status}`);
            }

            let data = {};
            const contentType = apiResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await apiResponse.json();
            } else {
                throw new Error("Resposta da API não é JSON. Conteúd: " + (await apiResponse.text()));
            }

            sessionStorage.setItem("restaurantData", JSON.stringify(data));

            window.location.href = "restaurante.html";
        } catch (error) {
            console.error('Erro ao buscar restaurantes:', error);
            alert(`Erro ao conectar à API do n8n. Detalhes: ${error.message}`);
        }


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

// Função para buscar e redenrizar os restaurantes
async function fetchAndRenderRestaurants() {
    // Obtém a resposta salva do Session Storage
    const savedData = sessionStorage.getItem('restaurantData');
    const container = document.getElementById('restaurant-list-container');

    // <<< DEBUG >>> Confirma se os dados foram lidos do Session Storage
    console.log("<<< DEBUG 1 >>> Dados brutos do Session Storage:", savedData);

    if (!container || !savedData) {
        container.innerHTML = `<p style="text-align: center; color: #e74c3c;">Erro: Dados dos restaurantes não encontrados. Volte e tente novamente.</p>`;
        return;
    }

    try {
        const rawRestaurantsArray = JSON.parse(savedData);
        const restaurants = Array.isArray(rawRestaurantsArray) ? rawRestaurantsArray : [];

        // <<< DEBUG >>> Confirma o tamanho do array de restaurantes
        console.log("<<< DEBUG 2 >>> Número de restaurantes para renderizar:", restaurants.length);

        // <<< DEBUG >>> Mostra o array pronto para renderização
        console.log("<<< DEBUG 3 >>> Array de restaurantes:", restaurants);

        container.innerHTML = '';

        if (restaurants.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: #888;">Nenhum restaurante encontrado dentro de um raio de 5km.</p>`
            return;
        }

        restaurants.forEach(restaurant => {
            const distanceInKm = parseFloat(restaurant.distancia_km);
            const distanceDisplay = distanceInKm.toFixed(2) + ' km de você';

            // Construção da URL da imagem dos restaurantes
            let imageUrl = '';
            if (restaurant.imagem_url) {
                imageUrl = `${STRAPI_BASE_URL}${restaurant.imagem_url}`;
            } else {
                //caso não tenha imagem carrega um placeholder
                imageUrl = '/src/img/placeholder.png';
            }

            // O contêiner para a imagem (com o caminho completo)
            const imageHtml = `
                <img src="${imageUrl}" 
                     alt="Fachada do ${restaurant.nome}" 
                     class="restaurant-image">
            `;

            //cria o card de restaurante com dados dinâmicos
            const card = document.createElement('div');
            card.className = 'restaurant-card';
            card.onclick = () => selecionarRestaurante(restaurant)
            card.innerHTML = `
                <div class="card-content">
                    
                    <div class="restaurant-info">
                        <div class="restaurant-image-container">
                            ${imageHtml}
                        </div>
                        
                        <div class="text-details">
                            <span class="unit-name">${restaurant.nome}</span>
                            <span class="unit-address">${restaurant.endereco}</span>
                            <span class="unit-distance">${distanceDisplay}</span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao buscar restaurantes:', error);
        container.innerHTML = `<p style="text-align: center; color: #e74c3c;">Erro ao conectar à API do n8n. Verifique se o Docker está rodando e o workflow está ativo. Detalhes: ${error.message}</p>`;

    }

}

function selecionarRestaurante(restaurantData) {
    //armazenamento dos dados do restaurante seleciona
    sessionStorage.setItem("selectedRestaurant", JSON.stringify(restaurantData));

    window.location.href = "resumo-pedido.html";
}

// Carregamento de dados do restaurante e do pedido na tela de resumo
function carregarResumoPedido() {
    const selectedRestaurantData = sessionStorage.getItem('selectedRestaurant');
    const restaurant = selectedRestaurantData ? JSON.parse(selectedRestaurantData) : null;

    //dados mockados de pedido
    const mockOrder = MOCK_ORDER_DATA;

    if (restaurant) {
        //atualiza a lista de itens
        const itemsContainer = document.querySelector('#order-items-container');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';

            //separar itens por virgula e adiciona como span em nova linha
            const items = mockOrder.itemSummary.split(',').map(item => item.trim());
            items.forEach(item => {
                const itemElement = document.createElement('span');
                itemElement.classList.add('summary-subtext');
                itemElement.textContent = item;
                itemsContainer.appendChild(itemElement);
            });
        }

        //atualização da unidade selecionada
        const unitNameElement = document.querySelector('.summary-unit .unit-name-display');
        const unitAddressElement = document.querySelector('.summary-unit .unit-address-line');
        const unitDistanceElement = document.querySelector('.summary-unit .unit-distance-line');

        // Formatação da Distância
        const distanceInKm = parseFloat(restaurant.distancia_km);
        const distanceDisplay = distanceInKm.toFixed(1) + ' km';


        if (unitNameElement) {
            //O nome do restaurante se torna o texto principal
            unitNameElement.textContent = restaurant.nome;
        }

        if (unitAddressElement) {
            unitAddressElement.textContent = restaurant.endereco;
        }

        if (unitDistanceElement) {
            unitDistanceElement.textContent = distanceDisplay;
        }


        // 3. Atualiza o Tempo Estimado 
        const timeElementValue = document.querySelector('.estimated-time-value');
        if (timeElementValue) {
            timeElementValue.textContent = mockOrder.estimatedTime;
        }

        // MOCK: Código do pedido 
        const orderCodeElement = document.querySelector('.summary-item-code .order-code');
        if (orderCodeElement) {
            orderCodeElement.textContent = mockOrder.orderCode;
        }

        console.log("Resumo do pedido carregado com sucesso para:", restaurant.nome)
    } else {
        console.error("Erro ao carregar resumo: Nenhum restaurante selecionado.");
    }
}

function confirmarPedido() {
    const finalOrderDetails = MOCK_ORDER_DATA;

    sessionStorage.setItem('finalOrderDetails', JSON.stringify(finalOrderDetails));
    window.location.href = "pedido-preparo.html";
}

function carregarPedidoEmPreparo() {
    const savedOrder = sessionStorage.getItem('finalOrderDetails');

    if (!savedOrder) {
        console.error("Dads do pedido não encotrados no sessionStorage.");
        return;
    }

    const finalOrder = JSON.parse(savedOrder);

    console.log("<<< DEBUG >>> Objeto de pedido:", finalOrder);

    carregarUnidadeEmPreparo();

    renderizarDetalhesDoPedido(finalOrder);
}

function carregarUnidadeEmPreparo() {
    const selectedRestaurantData = sessionStorage.getItem('selectedRestaurant');
    const restaurant = selectedRestaurantData ? JSON.parse(selectedRestaurantData) : null;

    if (restaurant) {
        // Atualização da unidade selecionada
        const unitNameElement = document.querySelector('.summary-unit .unit-name-display');
        const unitAddressElement = document.querySelector('.summary-unit .unit-address-line');
        const unitDistanceElement = document.querySelector('.summary-unit .unit-distance-line');

        // Formatação da Distância
        const distanceInKm = parseFloat(restaurant.distancia_km);
        const distanceDisplay = distanceInKm.toFixed(1) + ' km';


        if (unitNameElement) {
            unitNameElement.textContent = restaurant.nome;
        }

        if (unitAddressElement) {
            unitAddressElement.textContent = restaurant.endereco;
        }

        if (unitDistanceElement) {
            unitDistanceElement.textContent = distanceDisplay;
        }

        console.log("Unidade do pedido carregada com sucesso:", restaurant.nome)

    } else {
        console.error("Erro ao carregar unidade: Nenhum restaurante selecionado.");
    }
}

function renderizarDetalhesDoPedido(orderData) {
    const timeElementValue = document.querySelector('.estimated-time-value');
    const orderCodeElement = document.querySelector('.summary-item-code .order-code');
    const itemsContainer = document.querySelector('#order-items-container');

    if (timeElementValue) {
        timeElementValue.textContent = orderData.estimatedTime;
    }

    if (orderCodeElement) {
        orderCodeElement.textContent = orderData.orderCode
    }

    if (itemsContainer) {
        itemsContainer.innerHTML = '';

        const items = orderData.itemSummary.split(',').map(item => item.trim());

        items.forEach(item => {
            const itemElement = document.createElement('span');
            itemElement.classList.add('summary-subtext');
            itemElement.textContent = item;
            itemsContainer.appendChild(itemElement)
        })
    }
    console.log("Detalhes do pedido renderizados com sucesso em pedido-preparo.html");
}

// CÓDIGO DE INICIALIZAÇÃO

// 1. Inicia a obtenção da localização (para o Inicio.html)
if (window.location.pathname.endsWith('/Inicio.html')) {
    getLocation();
}

// 2. Executa a busca e renderização (para o restaurante.html)
if (window.location.pathname.endsWith('/restaurante.html')) {
    fetchAndRenderRestaurants();
}

// 3. Executa o carregamento do resumo para tela resumo pedido
if (window.location.pathname.endsWith('/resumo-pedido.html')) {
    carregarResumoPedido();
}

// 4. Executa o carregamento do pedido em preparo
if (window.location.pathname.endsWith('/pedido-preparo.html')) {
    carregarPedidoEmPreparo();
}