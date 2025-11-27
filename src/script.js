// Constante para a URL base da API na n8n
const N8N_BASE_URL = "http://localhost:5678/webhook/restaurantes";
const STRAPI_BASE_URL = "http://localhost:1337";


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
    console.error("Erro de Geolocalização:", err.message);
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

// CÓDIGO DE INICIALIZAÇÃO

// 1. Inicia a obtenção da localização (para o Inicio.html)
if (window.location.pathname.endsWith('/Inicio.html')) {
    getLocation();
}

// 2. Executa a busca e renderização (para o restaurante.html)
if (window.location.pathname.endsWith('/restaurante.html')) {
    fetchAndRenderRestaurants();
}