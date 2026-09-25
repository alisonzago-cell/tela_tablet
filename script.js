// Configurações
let nightModeOverride = null;
const UPDATE_WEATHER_INTERVAL = 30 * 60 * 1000; // 30 min
const CHANGE_BG_INTERVAL = 5 * 60 * 1000; // 5 min
const LATITUDE = -23.5276;
const LONGITUDE = -46.6384;

// Segunda Camada: Fallback de clima se a imagem do Google não existir
window.handleMissingWeatherIcon = function (imgElement, prob) {
    if (imgElement.dataset.fallbackApplied) return; // Evita loop infinito
    imgElement.dataset.fallbackApplied = "true";

    // Mostra o ícone de aviso na barra de status
    const warnIcon = document.getElementById('weather-fallback-warning');
    if (warnIcon) warnIcon.style.display = 'inline-block';

    // Aplica a lógica da segunda camada (chance de chuva)
    if (prob >= 75) imgElement.src = 'icones/light/thunderstorms.svg';
    else if (prob >= 50) imgElement.src = 'icones/light/heavy_rain.svg';
    else if (prob >= 30) imgElement.src = 'icones/light/showers_rain.svg';
    else if (prob >= 15) imgElement.src = 'icones/light/partly_cloudy_day.svg';
    else imgElement.src = 'icones/light/clear_day.svg';
};

// Função genérica para embaralhar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Imagens de fundo locais (80 imagens curadas baixadas)
const backgroundImages = [
    "fundos/fundo_01.jpg", "fundos/fundo_03.jpg", "fundos/fundo_04.jpg", "fundos/fundo_08.jpg",
    "fundos/fundo_09.jpg", "fundos/fundo_10.jpg", "fundos/fundo_12.jpg", "fundos/fundo_13.jpg",
    "fundos/fundo_16.jpg", "fundos/fundo_17.jpg", "fundos/fundo_19.jpg", "fundos/fundo_21.jpg",
    "fundos/fundo_27.jpg", "fundos/fundo_28.jpg", "fundos/fundo_29.jpg", "fundos/fundo_33.jpg",
    "fundos/fundo_34.jpg", "fundos/fundo_35.jpg", "fundos/fundo_36.jpg", "fundos/fundo_38.jpg",
    "fundos/fundo_41.jpg", "fundos/fundo_43.jpg", "fundos/fundo_44.jpg", "fundos/fundo_45.jpg",
    "fundos/fundo_46.jpg", "fundos/fundo_49.jpg", "fundos/fundo_52.jpg", "fundos/fundo_53.jpg",
    "fundos/fundo_55.jpg", "fundos/fundo_56.jpg", "fundos/fundo_57.jpg", "fundos/fundo_58.jpg",
    "fundos/fundo_60.jpg", "fundos/fundo_61.jpg", "fundos/fundo_62.jpg", "fundos/fundo_63.jpg",
    "fundos/fundo_65.jpg", "fundos/fundo_69.jpg", "fundos/fundo_70.jpg", "fundos/fundo_71.jpg",
    "fundos/fundo_72.jpg", "fundos/fundo_73.jpg", "fundos/fundo_74.jpg", "fundos/fundo_76.jpg",
    "fundos/fundo_77.jpg", "fundos/fundo_78.jpg", "fundos/fundo_79.jpg", "fundos/fundo_80.jpg"
];
// Embaralha as imagens toda vez que o painel é carregado
shuffleArray(backgroundImages);

// Elementos
const bg1 = document.getElementById('bg1');
const bg2 = document.getElementById('bg2');
const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');

// ======== SCROLLS NATIVOS CLICÁVEIS (LENTOS & INTEGRAIS) ========
function smoothScroll(element, direction, targetPosition, duration) {
    const startPosition = direction === 'x' ? element.scrollLeft : element.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Curva de velocidade (começa e termina suavemente)
        const ease = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        if (direction === 'x') {
            element.scrollLeft = startPosition + (distance * ease);
        } else {
            element.scrollTop = startPosition + (distance * ease);
        }

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

let resetHourlyTimeout;
window.scrollHourly = function () {
    const el = document.getElementById('hourly-forecast');
    if (!el) return;

    // Cancela o timer de retorno anterior, se existir
    clearTimeout(resetHourlyTimeout);

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        // Volta pro inicio
        smoothScroll(el, 'x', 0, 800); // 800 milissegundos
    } else {
        // Rola pra direita TOTALMENTE pro final de uma vez
        smoothScroll(el, 'x', el.scrollWidth - el.clientWidth, 800);

        // Configura o retorno automático após 30 segundos
        resetHourlyTimeout = setTimeout(() => {
            if (el.scrollLeft > 0) smoothScroll(el, 'x', 0, 800);
        }, 30000); // 30 segundos
    }
}

let resetDailyTimeout;
window.scrollDaily = function () {
    const el = document.getElementById('daily-forecast');
    if (!el) return;

    // Cancela o timer de retorno anterior, se existir
    clearTimeout(resetDailyTimeout);

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        // Volta pro topo
        smoothScroll(el, 'y', 0, 800);
    } else {
        // Rola pra baixo TOTALMENTE pro final de uma vez
        smoothScroll(el, 'y', el.scrollHeight - el.clientHeight, 800);

        // Configura o retorno automático após 30 segundos
        resetDailyTimeout = setTimeout(() => {
            if (el.scrollTop > 0) smoothScroll(el, 'y', 0, 800);
        }, 30000); // 30 segundos
    }
}

// ======== FUNÇÕES AUXILIARES DA PLANTA ========
function updateClock() {
    const now = new Date();
    // Ajuste de fuso horário (-1h) para tablets desatualizados
    now.setHours(now.getHours() - 1);

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dayNamesList = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dayOfWeek = dayNamesList[now.getDay()];
    dateEl.textContent = `${dayOfWeek}, ${day}/${month}/${year}`;

    // Atualiza dinamicamente os ETAs do Trânsito
    if (window.trafficDurations) {
        for (let id in window.trafficDurations) {
            const duration = window.trafficDurations[id];
            // Usa o horário ajustado do tablet (now)
            const arrivalTime = new Date(now.getTime() + duration * 1000);
            const arrH = String(arrivalTime.getHours()).padStart(2, '0');
            const arrM = String(arrivalTime.getMinutes()).padStart(2, '0');

            const oldArrEl = document.getElementById(`traffic-arrival-${id}`);
            if (oldArrEl) oldArrEl.textContent = 'Chegada est. ' + arrH + ':' + arrM;

            const newEtaEl = document.getElementById(`tf-eta-${id}`);
            if (newEtaEl) newEtaEl.textContent = 'ETA: ' + arrH + 'h' + arrM;
        }
    }

    // Automação da mudança do trânsito na sexta 18h e segunda 0h
    // Verifica a cada segundo a hora exata
    const d = now.getDay();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (d === 5 && h === 18 && m === 0 && s === 0) {
        // Sexta-feira 18:00:00 -> Vai para a página 2
        if (typeof window.toggleTrafficSlider === 'function' && !window.isTrafficSlidePage2) {
            window.toggleTrafficSlider();
        }
    } else if (d === 1 && h === 0 && m === 0 && s === 0) {
        // Segunda-feira 00:00:00 -> Volta para a página 1
        if (typeof window.toggleTrafficSlider === 'function' && window.isTrafficSlidePage2) {
            window.toggleTrafficSlider();
        }
    }

    // Automação do Modo Noturno (Baseado no relógio principal)
    if (nightModeOverride === null) {
        const overlay = document.getElementById('night-mode-overlay');
        if (overlay) {
            // Utiliza o 'h' já calculado com ajuste de fuso
            // <--- AJUSTE O HORÁRIO NOTURNO AQUI --->
            // h >= 23 significa que começa às 22:00
            // h < 5 significa que termina às 05:00 da manhã
            const isNight = h >= 22 || h < 4;

            if (isNight && !overlay.classList.contains('active')) {
                overlay.classList.add('active');
            } else if (!isNight && overlay.classList.contains('active')) {
                overlay.classList.remove('active');
            }
        }
    }
}
setInterval(updateClock, 1000);
updateClock();

// ======== STATUS DA REDE (WI-FI) ========
function updateNetworkStatus() {
    const wifiIcon = document.getElementById('wifi-icon');
    if (!wifiIcon) return;

    if (navigator.onLine) {
        wifiIcon.className = 'ph ph-wifi-high';
        wifiIcon.style.color = '#10b981'; // verde
        wifiIcon.title = "Wi-Fi: Conectado";
    } else {
        wifiIcon.className = 'ph ph-wifi-slash';
        wifiIcon.style.color = '#ef4444'; // vermelho
        wifiIcon.title = "Wi-Fi: Desconectado";
    }
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();

// ======== BACKGROUND ROTATIVO ========
let currentBgIndex = 0;
let isBg1Active = true;

// Preload da primeira imagem
bg1.style.backgroundImage = `url('${backgroundImages[currentBgIndex]}')`;

function changeBackground() {
    currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
    const nextImageUrl = backgroundImages[currentBgIndex];

    const img = new Image();
    img.src = nextImageUrl;

    img.onload = () => {
        const nextImage = `url('${nextImageUrl}')`;
        if (isBg1Active) {
            bg2.style.backgroundImage = nextImage;
            // Aguarda o navegador renderizar a nova imagem de fundo no DOM escondido
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    bg2.style.opacity = 1;
                    bg1.style.opacity = 0;
                });
            });
        } else {
            bg1.style.backgroundImage = nextImage;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    bg1.style.opacity = 1;
                    bg2.style.opacity = 0;
                });
            });
        }
        isBg1Active = !isBg1Active;
    };
}
setInterval(changeBackground, CHANGE_BG_INTERVAL);

// Calendário Removido Temporariamente 

// ======== PREVISÃO DO TEMPO ========
async function fetchWeather() {
    const refreshIcon = document.getElementById('weather-refresh-icon');
    if (refreshIcon) refreshIcon.style.transform = 'rotate(180deg)';

    try {
        const apiKey = 'AIzaSyAMPM6odYJFIjJyy0eYwGVsf0wn7u6GKzY';

        // ======== FETCH WEATHER VIA PROXY ========
        // O proxy no Cloudflare é usado para contornar problemas de CORS e certificados SSL legados do Android 4.2.2
        const proxyBase = 'https://tablet.alison-zago.workers.dev/?url=';

        const currentUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${LATITUDE}&location.longitude=${LONGITUDE}`;
        const hourlyUrl = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${apiKey}&location.latitude=${LATITUDE}&location.longitude=${LONGITUDE}&pageSize=12`;
        const dailyUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${LATITUDE}&location.longitude=${LONGITUDE}&pageSize=14`;

        // AQI pelo OpenMeteo via Proxy
        const apiProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const aqiUrl = `${apiProtocol}//air-quality-api.open-meteo.com/v1/air-quality?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=us_aqi&timezone=America%2FSao_Paulo`;

        // Busca simultânea das 4 APIs (Google e OpenMeteo). 
        // O ".catch" individual garante que se uma cair (ex: AQI), o resto continua renderizando.
        const [currData, hourlyData, dailyData, aqiData] = await Promise.all([
            fetch(proxyBase + encodeURIComponent(currentUrl))
                .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
                .catch(e => { console.error("Erro Google Current API:", e); return null; }),
            fetch(proxyBase + encodeURIComponent(hourlyUrl))
                .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
                .catch(e => { console.error("Erro Google Hourly API:", e); return null; }),
            fetch(proxyBase + encodeURIComponent(dailyUrl))
                .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
                .catch(e => { console.error("Erro Google Daily API:", e); return null; }),
            fetch(proxyBase + encodeURIComponent(aqiUrl))
                .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
                .catch(e => { console.error("Erro OpenMeteo AQI API:", e); return null; })
        ]);

        // Qualidade do Ar (US AQI)
        if (aqiData && aqiData.current && aqiData.current.us_aqi !== undefined) {
            const aqi = aqiData.current.us_aqi;
            let aqiText = "Bom";
            let aqiColor = "#4ade80"; // verde
            if (aqi > 50) { aqiText = "Moderado"; aqiColor = "#facc15"; } // amarelo
            if (aqi > 100) { aqiText = "Sensíveis"; aqiColor = "#fb923c"; } // laranja
            if (aqi > 150) { aqiText = "Ruim"; aqiColor = "#ef4444"; } // vermelho
            if (aqi > 200) { aqiText = "M. Ruim"; aqiColor = "#9333ea"; } // roxo
            if (aqi > 300) { aqiText = "Péssimo"; aqiColor = "#7f1d1d"; } // vinho

            const aqiEl = document.getElementById('current-aqi');
            if (aqiEl) {
                aqiEl.textContent = aqiText;
                aqiEl.style.color = aqiColor;
                aqiEl.style.fontWeight = "600";
            }
        }

        let todayIndex = 0;
        // Dados atuais (Google)
        if (currData && currData.temperature) {
            document.getElementById('current-temp').textContent = `${Math.round(currData.temperature.degrees)}°`;
            document.getElementById('current-humidity').textContent = `${currData.relativeHumidity || 0}%`;
            document.getElementById('current-wind').textContent = `${currData.wind && currData.wind.speed ? Math.round(currData.wind.speed.value) : 0}`;

            // max/min do dia atual
            if (dailyData && dailyData.forecastDays && dailyData.forecastDays.length > 0) {
                const nowLocal = new Date();
                // Ajuste de fuso horário (-1h) para equiparar com a lógica do relógio
                nowLocal.setHours(nowLocal.getHours() - 1);

                // Procura o índice do dia atual
                for (let i = 0; i < dailyData.forecastDays.length; i++) {
                    const dDate = dailyData.forecastDays[i].displayDate;
                    if (dDate && dDate.day === nowLocal.getDate() && dDate.month === (nowLocal.getMonth() + 1)) {
                        todayIndex = i;
                        break;
                    }
                }

                document.getElementById('current-max').textContent = `${Math.round(dailyData.forecastDays[todayIndex].maxTemperature.degrees)}°`;
                document.getElementById('current-min').textContent = `${Math.round(dailyData.forecastDays[todayIndex].minTemperature.degrees)}°`;
            }

            // Chance de chuva atual
            const precipPercent = (currData.precipitation && currData.precipitation.probability) ? currData.precipitation.probability.percent : 0;
            document.getElementById('current-rain').textContent = `${precipPercent}%`;
        }

        // Horas futuras (Google)
        const hourlyContainer = document.getElementById('hourly-forecast');
        if (hourlyContainer && hourlyData && hourlyData.forecastHours) {
            let hourlyHtml = '';
            const hoursList = hourlyData.forecastHours;
            for (let i = 0; i < hoursList.length; i++) {
                const hData = hoursList[i];
                // Formato retornado: '2026-09-17T15:00:00Z'
                const hourDate = new Date(hData.interval.startTime);
                const hStr = String(hourDate.getHours()).padStart(2, '0') + ':00';
                const temp = Math.round(hData.temperature.degrees);
                const rainProb = (hData.precipitation && hData.precipitation.probability) ? hData.precipitation.probability.percent : 0;
                const windSpeed = hData.wind && hData.wind.speed ? Math.round(hData.wind.speed.value) : 0;

                hourlyHtml += `
                    <div class="hourly-item">
                        <span class="hourly-time">${hStr}</span>
                        <span class="hourly-temp">${temp}°</span>
                        <span style="font-size: 0.7rem; color: var(--text-secondary);"><i class="ph ph-drop"></i> ${rainProb}%</span>
                        <span style="font-size: 0.7rem; color: var(--text-secondary);"><i class="ph ph-wind"></i> ${windSpeed} <span style="font-size: 0.5rem;">km</span></span>
                    </div>
                `;
            }
            hourlyContainer.innerHTML = hourlyHtml;
        }

        // Proximos Dias (Google Daily Forecast)
        const dailyContainer = document.getElementById('daily-forecast');
        if (dailyContainer && dailyData && dailyData.forecastDays) {
            let dailyHtml = '';
            const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

            // Começa do dia seguinte ao hoje (todayIndex + 1)
            for (let i = todayIndex + 1; i < dailyData.forecastDays.length; i++) {

                const dData = dailyData.forecastDays[i];

                const dDate = new Date(dData.displayDate.year, dData.displayDate.month - 1, dData.displayDate.day);
                const dayName = i === todayIndex + 1 ? 'Amanhã' : dayNames[dDate.getDay()];
                const dayPadded = String(dDate.getDate()).padStart(2, '0');
                const monthPadded = String(dDate.getMonth() + 1).padStart(2, '0');

                const tMax = Math.round(dData.maxTemperature.degrees);
                const tMin = Math.round(dData.minTemperature.degrees);

                // Pegar maior probabilidade do dia ou noite
                const rainDay = (dData.daytimeForecast && dData.daytimeForecast.precipitation && dData.daytimeForecast.precipitation.probability) ? dData.daytimeForecast.precipitation.probability.percent : 0;
                const rainNight = (dData.nighttimeForecast && dData.nighttimeForecast.precipitation && dData.nighttimeForecast.precipitation.probability) ? dData.nighttimeForecast.precipitation.probability.percent : 0;
                const pProb = Math.max(rainDay, rainNight);

                // Lógica oficial do Google: Mapeamento direto 1:1 com os arquivos da pasta 'light'
                let mainIconFile = "clear_day.svg"; // Padrão

                // Pegamos o código exato que o Google envia para o dia
                if (dData.daytimeForecast && dData.daytimeForecast.condition && dData.daytimeForecast.condition.iconCode) {
                    mainIconFile = dData.daytimeForecast.condition.iconCode.toLowerCase() + ".svg";
                } else if (pProb >= 75) {
                    // Mini fallback caso a API falhe em enviar a condição
                    mainIconFile = "thunderstorms.svg";
                } else if (pProb >= 50) {
                    mainIconFile = "heavy_rain.svg";
                } else if (pProb >= 30) {
                    mainIconFile = "showers_rain.svg";
                } else if (pProb >= 15) {
                    mainIconFile = "partly_cloudy_day.svg";
                }

                dailyHtml += `
                    <div class="daily-item">
                        <span class="daily-day">
                            <img src="icones/light/${mainIconFile}" class="daily-day-icon" alt="clima" onerror="handleMissingWeatherIcon(this, ${pProb})" />
                            ${dayName}, ${dayPadded}/${monthPadded}
                        </span>
                        <span class="daily-rain"><i class="ph ph-drop"></i> ${pProb}%</span>
                        <div class="daily-temps">
                            <span class="temp-max">${tMax}°</span>
                            <span style="color: var(--text-primary); font-weight: 400;">/</span>
                            <span class="temp-min">${tMin}°</span>
                        </div>
                    </div>
                `;
            }

            dailyContainer.innerHTML = dailyHtml;
        }

        if (refreshIcon) {
            setTimeout(() => refreshIcon.style.transform = 'rotate(0deg)', 500);
        }

    } catch (error) {
        if (refreshIcon) refreshIcon.style.transform = 'rotate(0deg)';
        console.error("Erro ao buscar clima: ", error);

        // Mudar o título para indicar erro
        const locTitle = document.getElementById('location-title');
        if (locTitle) {
            locTitle.innerHTML = '<i class="ph ph-warning-circle"></i> Erro ao conectar ao Clima';
            locTitle.style.color = '#ef4444';
            locTitle.style.opacity = '0.8';
        }

        // Injetar dados fictícios
        document.getElementById('current-temp').textContent = '24°';
        document.getElementById('current-max').textContent = '28°';
        document.getElementById('current-min').textContent = '18°';
        document.getElementById('current-humidity').textContent = '50%';
        document.getElementById('current-wind').textContent = '10';
        document.getElementById('current-rain').textContent = '15%';

        // Opacidade em todo o bloco de detalhe atual
        const currentBlock = document.querySelector('.weather-current');
        if (currentBlock) currentBlock.style.opacity = '0.5';

        const hourlyContainer = document.getElementById('hourly-forecast');
        if (hourlyContainer) {
            let fakeHourly = '';
            for (let i = 0; i < 8; i++) {
                fakeHourly += `
                <div class="hourly-item" style="opacity: 0.5;">
                    <span class="hourly-time">12:00</span>
                    <span class="hourly-temp">24°</span>
                    <span style="font-size: 0.7rem; color: var(--text-secondary);"><i class="ph ph-drop"></i> 15%</span>
                    <span style="font-size: 0.7rem; color: var(--text-secondary);"><i class="ph ph-wind"></i> 10 <span style="font-size: 0.5rem;">km</span></span>
                </div>`;
            }
            hourlyContainer.innerHTML = fakeHourly;
        }

        const dailyContainer = document.getElementById('daily-forecast');
        if (dailyContainer) {
            let fakeDaily = '';
            for (let i = 1; i <= 7; i++) {
                fakeDaily += `
                <div class="daily-item" style="opacity: 0.5;">
                    <span class="daily-day">
                        <img src="icones/light/showers_rain.svg" class="daily-day-icon" alt="clima" onerror="handleMissingWeatherIcon(this, 15)" />
                        Segunda, 01/01
                    </span>
                    <span class="daily-rain"><i class="ph ph-drop"></i> 15%</span>
                    <div class="daily-temps">
                        <span class="temp-max">28°</span>
                        <span style="color: var(--text-primary); font-weight: 400;">/</span>
                        <span class="temp-min">18°</span>
                    </div>
                </div>`;
            }
            dailyContainer.innerHTML = fakeDaily;
        }
    }
}
// Intervalo movido para a sessão INIT DASHBOARD

// Lógica do Slider do Clima
let isWeatherSlideDaily = false;
function toggleWeatherSlider() {
    const slider = document.getElementById('weather-slider');
    if (!slider) return;

    isWeatherSlideDaily = !isWeatherSlideDaily;
    if (isWeatherSlideDaily) {
        slider.style.transform = 'translateX(-50%)';
    } else {
        slider.style.transform = 'translateX(0)';
    }
}

// ======== NOTÍCIAS ========
const newsList = document.getElementById('news-list');
const RSS_FEEDS = [
    { url: 'https://iclnoticias.com.br/feed/', tag: 'ICL', class: 'tag-icl', source: 'ICL Notícias' },
    { url: 'https://www.gazetaesportiva.com/feed/', tag: 'Esportes', class: 'tag-esportes', source: 'Gazeta Esportiva' },
    { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', tag: 'Folha', class: 'tag-folha', source: 'Folha de S.Paulo' },
    { url: 'https://feeds.folha.uol.com.br/esporte/rss091.xml', tag: 'Esportes', class: 'tag-folha', source: 'Folha de S.Paulo' },
    { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', tag: 'BBC', class: 'tag-bbc', source: 'BBC Brasil' }
];

// ======= NOTÍCIAS =======
let globalNewsItems = [];

async function fetchAllNews() {
    newsList.innerHTML = '<div style="text-align: center; color: var(--text-secondary);">Carregando notícias...</div>';
    try {
        let allItems = [];

        for (const feed of RSS_FEEDS) {
            // ======== FETCH NEWS VIA RSS2JSON ========
            // Usamos a API pública rss2json.com para converter feeds XML (RSS) do G1/UOL em JSON puro.
            // Isso evita a necessidade de escrevermos um parser XML complexo e resolve possíveis bloqueios de CORS.
            const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.warn(`Aviso: Falha ao carregar o feed ${feed.source} (HTTP ${response.status})`);
                continue; // Pula este feed e tenta o próximo
            }

            const data = await response.json();

            if (data.status === 'ok' && data.items) {
                const items = data.items.slice(0, 10); // 10 de cada
                items.forEach(item => {
                    if (item.title && item.title.trim().length >= 40) {
                        // Filtros para remover notícias indesejadas (vídeos, onde assistir)
                        const titleLower = item.title.toLowerCase();

                        if (titleLower.includes('assista ao')) {
                            return; // Ignora esta notícia
                        }

                        if (feed.tag === 'Esportes' && (titleLower.includes('onde assistir') || titleLower.includes('melhores momentos'))) {
                            return; // Ignora esta notícia
                        }

                        allItems.push(Object.assign({}, item, {
                            tag: feed.tag,
                            tagClass: feed.class,
                            source: feed.source
                        }));
                    }
                });
            } else {
                console.warn(`Aviso: O feed ${feed.source} retornou um formato inesperado.`, data);
            }
        }

        if (allItems.length === 0) {
            newsList.innerHTML = '<div style="text-align: center; color: #ef4444;"><i class="ph ph-warning-circle" style="font-size: 1.5rem;"></i><br>Nenhuma notícia encontrada no momento.</div>';
            return;
        }

        // Separa as notícias do 'emcimadahora' (tag === 'Folha') das demais
        const folhaItems = allItems.filter(item => item.tag === 'Folha');
        const otherItems = allItems.filter(item => item.tag !== 'Folha');

        // Embaralha ambas as listas independentemente
        shuffleArray(folhaItems);
        shuffleArray(otherItems);

        // Intercala 1 Folha, 1 Aleatório, 1 Folha, 1 Aleatório...
        const interleavedItems = [];
        let fIndex = 0;
        let oIndex = 0;
        while (fIndex < folhaItems.length || oIndex < otherItems.length) {
            if (fIndex < folhaItems.length) interleavedItems.push(folhaItems[fIndex++]);
            if (oIndex < otherItems.length) interleavedItems.push(otherItems[oIndex++]);
        }

        allItems = interleavedItems;
        newsList.innerHTML = '';

        allItems.forEach((item, index) => {
            let dateStr = '';
            if (item.pubDate) {
                try {
                    const d = new Date(item.pubDate);
                    if (!isNaN(d.getTime())) {
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        dateStr = ` • ${day}/${month}/${year}`;
                    }
                } catch (e) { }
            }

            const el = document.createElement('div');
            el.className = 'news-item';
            el.style.cursor = 'pointer';
            el.onclick = () => openNewsModal(index);
            el.innerHTML = `
                <div class="news-header">
                    <span class="news-tag ${item.tagClass}">${item.tag}</span>
                    <span class="news-source">Fonte: ${item.source}${dateStr}</span>
                </div>
                <div class="news-title">${item.title}</div>
            `;
            newsList.appendChild(el);
        });

        globalNewsItems = allItems;

    } catch (error) {
        console.error("ERRO CRÍTICO NAS NOTÍCIAS (Falha no Proxy ou rss2json): ", error);
        newsList.innerHTML = ''; // Limpar aviso

        for (let i = 0; i < 6; i++) {
            const el = document.createElement('div');
            el.className = 'news-item';
            el.style.opacity = '0.5';
            el.innerHTML = `
                <div class="news-header">
                    <span class="news-tag" style="background: #ef4444; color: white;"><i class="ph ph-warning-circle"></i> OFF</span>
                    <span class="news-source" style="color: #ef4444;">Erro na Conexão</span>
                </div>
                <div class="news-title">Notícia Fictícia para Teste de Diagramação - Falha ao buscar dados oficiais. ${i + 1}</div>
            `;
            newsList.appendChild(el);
        }
    }
}

fetchAllNews();
setInterval(fetchAllNews, 30 * 60 * 1000);

// Auto-scroll das notícias e Suporte a Arrastar (Drag)
let scrollPos = 0;
let isDraggingNews = false;
let startDragY = 0;

const newsContainer = document.getElementById('news-list-container');
if (newsContainer) {
    const handleDragStart = (y) => { isDraggingNews = true; startDragY = y; };
    const handleDragMove = (y) => {
        if (!isDraggingNews) return;
        scrollPos -= (y - startDragY);
        if (scrollPos < 0) scrollPos = 0;
        if (scrollPos >= newsList.scrollHeight - newsContainer.clientHeight) {
            scrollPos = newsList.scrollHeight - newsContainer.clientHeight;
        }
        startDragY = y;
        newsList.style.transform = `translate3d(0, -${scrollPos}px, 0)`;
    };
    const handleDragEnd = () => { isDraggingNews = false; };

    newsContainer.addEventListener('mousedown', (e) => handleDragStart(e.pageY));
    window.addEventListener('mousemove', (e) => handleDragMove(e.pageY));
    window.addEventListener('mouseup', handleDragEnd);

    newsContainer.addEventListener('touchstart', (e) => handleDragStart(e.touches[0].pageY));
    window.addEventListener('touchmove', (e) => handleDragMove(e.touches[0].pageY));
    window.addEventListener('touchend', handleDragEnd);
}

function autoScrollNews() {
    if (!isDraggingNews && newsContainer) {
        if (newsList.scrollHeight > newsContainer.clientHeight) {
            scrollPos += 0.6; /* <--- Ajuste a VELOCIDADE das notícias aqui (Ex: 0.50 para mais rápido, 0.15 para mais lento) */
            if (scrollPos >= newsList.scrollHeight - newsContainer.clientHeight) {
                scrollPos = 0; // volta pro topo
            }
            newsList.style.transform = `translate3d(0, -${scrollPos}px, 0)`;
        }
    }
    requestAnimationFrame(autoScrollNews);
}
autoScrollNews();

// ======== CALENDÁRIO MENSAL ========
const calendarGrid = document.getElementById('calendar-grid');
const calendarLegend = document.getElementById('calendar-legend');

// Variável para armazenar o mês/ano gerado
let currentCalendarTitleText = "Calendário";
let isTimerSlideCalendar = true;
let currentMonthHolidays = [];
let legendPage = 0;
const LEGEND_ITEMS_PER_PAGE = 2;

window.changeLegendPage = function (dir) {
    if (currentMonthHolidays.length === 0) return;
    const maxPage = Math.ceil(currentMonthHolidays.length / LEGEND_ITEMS_PER_PAGE) - 1;
    legendPage += dir;
    if (legendPage < 0) legendPage = maxPage;
    if (legendPage > maxPage) legendPage = 0;
    renderLegend();
}

function renderLegend() {
    const legendEl = document.getElementById('calendar-legend');
    if (!legendEl) return;
    legendEl.innerHTML = '';

    const start = legendPage * LEGEND_ITEMS_PER_PAGE;
    const items = currentMonthHolidays.slice(start, start + LEGEND_ITEMS_PER_PAGE);

    items.forEach(h => {
        const item = document.createElement('div');
        if (h.isPast) item.style.opacity = '0.5';
        item.style.marginBottom = '2px';
        item.style.whiteSpace = 'nowrap';
        item.style.overflow = 'hidden';
        item.style.textOverflow = 'ellipsis';
        item.innerHTML = `<strong>${h.dateStr}</strong> - ${h.name}`;
        legendEl.appendChild(item);
    });
}

function toggleCalendarTimerSlider() {
    const slider = document.getElementById('calendar-timer-slider');
    const title = document.getElementById('calendar-timer-title');
    if (!slider || !title) return;

    isTimerSlideCalendar = !isTimerSlideCalendar;
    if (isTimerSlideCalendar) {
        slider.style.transform = 'translateX(-50%)';
        title.innerHTML = '<i class="ph ph-calendar"></i> ' + currentCalendarTitleText;
    } else {
        slider.style.transform = 'translateX(0)';
        title.innerHTML = '<i class="ph ph-timer"></i> Timer';
    }
}

async function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    currentCalendarTitleText = `${monthNames[month]} ${year}`;
    if (isTimerSlideCalendar) {
        const title = document.getElementById('calendar-timer-title');
        if (title) title.innerHTML = '<i class="ph ph-calendar"></i> ' + currentCalendarTitleText;
    }

    // Buscar feriados
    let holidays = [];
    try {
        const url = `https://brasilapi.com.br/api/feriados/v1/${year}`;
        const response = await fetch(url);
        holidays = await response.json();
    } catch (e) {
        console.error(e);
    }



    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    calendarGrid.innerHTML = '';
    if (calendarLegend) calendarLegend.innerHTML = '';
    currentMonthHolidays = [];

    // Preencher dias vazios antes do dia 1
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDiv);
    }

    // Preencher os dias do mês
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;

        // Verifica se é final de semana (0 = domingo, 6 = sábado)
        const dayOfWeek = new Date(year, month, i).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayDiv.classList.add('weekend');
        }

        // Verifica se é hoje
        if (year === now.getFullYear() && month === now.getMonth() && i === now.getDate()) {
            dayDiv.classList.add('today');
        }

        // Verifica se é feriado
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const holiday = holidays.find(h => h.date === dateStr);

        if (holiday) {
            let isPast = false;
            if (year === now.getFullYear() && month === now.getMonth() && i < now.getDate()) {
                dayDiv.classList.add('holiday-past');
                isPast = true;
            } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth())) {
                dayDiv.classList.add('holiday-past');
                isPast = true;
            } else {
                dayDiv.classList.add('holiday');
            }
            dayDiv.title = holiday.name;

            // Adiciona na legenda se o feriado for neste mês
            currentMonthHolidays.push({
                dateStr: `${String(i).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`,
                name: holiday.name,
                isPast: isPast,
                day: i
            });
        }

        calendarGrid.appendChild(dayDiv);
    }

    // Ordenar feriados: feriados passados vão para o final
    currentMonthHolidays.sort((a, b) => {
        if (a.isPast && !b.isPast) return 1;
        if (!a.isPast && b.isPast) return -1;
        return a.day - b.day;
    });

    legendPage = 0;
    renderLegend();
}

renderCalendar();
setInterval(renderCalendar, 24 * 60 * 60 * 1000); // Atualiza diariamente

// ======== TIMER ========
let timerSeconds = 0;
let timerInterval = null;
const timerDisplay = document.getElementById('timer-display');
const timerToggleBtn = document.getElementById('timer-toggle-btn');

function updateTimerDisplay() {
    const h = Math.floor(timerSeconds / 3600);
    const m = Math.floor((timerSeconds % 3600) / 60);
    const s = timerSeconds % 60;

    timerDisplay.textContent =
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');
}

function adjustTimer(amount, type) {
    stopAlarm();
    if (timerSeconds === 0 && amount < 0) return;

    if (type === 'm') {
        timerSeconds += amount * 60;
    } else if (type === 's') {
        timerSeconds += amount;
    }

    if (timerSeconds < 0) timerSeconds = 0;
    updateTimerDisplay();
}

function toggleTimer() {
    stopAlarm();
    if (timerInterval) {
        // Pausar
        clearInterval(timerInterval);
        timerInterval = null;
        timerToggleBtn.innerHTML = '<i class="ph ph-play"></i> Iniciar';
    } else {
        // Iniciar
        if (timerSeconds > 0) {
            timerInterval = setInterval(() => {
                timerSeconds--;
                updateTimerDisplay();
                if (timerSeconds <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    timerToggleBtn.innerHTML = '<i class="ph ph-play"></i> Iniciar';
                    playAlarm();
                }
            }, 1000);
            timerToggleBtn.innerHTML = '<i class="ph ph-pause"></i> Pausar';
        }
    }
}

function resetTimer() {
    stopAlarm();
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerSeconds = 0;
    updateTimerDisplay();
    timerToggleBtn.innerHTML = '<i class="ph ph-play"></i> Iniciar';
}

let alarmInterval = null;

function stopAlarm() {
    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
}

function playAlarm() {
    stopAlarm();
    triggerBeep();
    alarmInterval = setInterval(triggerBeep, 2000);
}

function triggerBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
        console.error("Áudio não suportado", e);
    }
}

// ======== FULLSCREEN ========
// Faz o navegador entrar em tela cheia e sumir com a barra de status ao tocar na tela
function toggleFullscreen() {
    var elem = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Específico para navegadores nativos antigos
            elem.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

// ======== BATERIA ========
const WEBHOOK_ON = 'https://sequematic.com/trigger-custom-webhook/6B26083F75/170653';
const WEBHOOK_OFF = 'https://sequematic.com/trigger-custom-webhook/6B26083F75/170655';

// LIMITES DA BATERIA PARA AUTOMAÇÃO (Altere aqui para testar)
const BATTERY_MIN = 20; // Liga a tomada se a bateria chegar neste valor ou menos
const BATTERY_MAX = 81; // Desliga a tomada se a bateria chegar neste valor ou mais

let webhookCooldown = false;
let lastLowBatteryLevel = null; // Controle para apitar apenas 1x a cada queda de %

async function initBattery() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            let prevChargingState = battery.charging;

            function updateBattery() {
                const levelEl = document.getElementById('battery-level');
                const iconEl = document.getElementById('battery-icon');
                if (!levelEl || !iconEl) return;

                const level = Math.round(battery.level * 100);
                levelEl.innerHTML = '&nbsp;' + level + '%';

                if (battery.charging) {
                    iconEl.className = 'ph ph-battery-charging';
                    iconEl.style.color = '#10b981'; // green
                } else {
                    iconEl.style.color = '';
                    if (level > 80) iconEl.className = 'ph ph-battery-full';
                    else if (level > 50) iconEl.className = 'ph ph-battery-high';
                    else if (level > 20) iconEl.className = 'ph ph-battery-medium';
                    else iconEl.className = 'ph ph-battery-low';
                }

                // Detecta se ACABOU de começar a carregar
                if (battery.charging && !prevChargingState) {
                    showBatteryPopup('Tomada ligada. Carregando!', '#10b981', 'ph-plug-charging');
                } else if (!battery.charging && prevChargingState) {
                    // Opcional: mostrar quando parar de carregar
                    showBatteryPopup('Tomada desligada.', '#ef4444', 'ph-power');
                }
                prevChargingState = battery.charging;

                // ======== MODO SEGURANÇA BATERIA CRÍTICA ========
                const lowBattOverlay = document.getElementById('low-battery-overlay');
                if (!battery.charging && level <= 10) {
                    if (lastLowBatteryLevel !== level) {
                        lastLowBatteryLevel = level;
                        if (lowBattOverlay) lowBattOverlay.style.display = 'flex';

                        let beepCount = 0;
                        let targetBeeps = level <= 5 ? 5 : 3;

                        let beepInterval = setInterval(() => {
                            const h = new Date().getHours();
                            const isQuietHours = (h >= 22 || h < 7);
                            if (typeof triggerBeep === 'function' && !isQuietHours) triggerBeep();

                            beepCount++;
                            if (beepCount >= targetBeeps) clearInterval(beepInterval);
                        }, 1000);
                    }
                } else if (battery.charging || level > 10) {
                    lastLowBatteryLevel = null;
                    if (lowBattOverlay) lowBattOverlay.style.display = 'none';
                }

                checkBatteryAutomation(level, battery.charging);
            }

            function showBatteryPopup(text, color, iconClass) {
                const popup = document.getElementById('battery-popup');
                if (!popup) return;

                popup.innerHTML = `<i class="ph ${iconClass}" style="color: ${color}; font-size: 1.5rem;"></i><span>${text}</span>`;
                popup.style.opacity = '1';

                setTimeout(() => {
                    popup.style.opacity = '0';
                }, 4000); // Fica 4 segundos na tela
            }

            function checkBatteryAutomation(level) {
                if (webhookCooldown) return;

                if (level <= BATTERY_MIN) {
                    console.log(`Bateria baixa (<= ${BATTERY_MIN}%). Ligando tomada...`);
                    triggerAutomation(WEBHOOK_ON);
                } else if (level >= BATTERY_MAX) {
                    console.log(`Bateria alta (>= ${BATTERY_MAX}%). Desligando tomada...`);
                    triggerAutomation(WEBHOOK_OFF);
                }
            }

            function triggerAutomation(url) {
                webhookCooldown = true;
                fetch(url, { mode: 'no-cors' })
                    .then(() => console.log('Automação de bateria disparada:', url))
                    .catch(err => console.error('Erro na automação de bateria:', err))
                    .finally(() => {
                        // Cooldown de 2 minutos para evitar disparos colados
                        setTimeout(() => { webhookCooldown = false; }, 120000);
                    });
            }

            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);

            // Verificação redundante a cada 2 minutos (reenvia o sinal se a bateria não tiver saído do limite)
            setInterval(updateBattery, 2 * 60 * 1000);

        } catch (e) { console.error('Battery API error', e); }
    }
}
initBattery();

// FUNÇÃO DE DEBUG: Teste manual de bateria
window.testBatterySafety = function (level) {
    const lowBattOverlay = document.getElementById('low-battery-overlay');
    if (!lowBattOverlay) return;

    // Simula a queda de energia e reseta o lastLevel para garantir que toque
    lastLowBatteryLevel = level;
    lowBattOverlay.style.display = 'flex';

    let beepCount = 0;
    let targetBeeps = level <= 5 ? 5 : 3;

    let beepInterval = setInterval(() => {
        const h = new Date().getHours();
        const isQuietHours = (h >= 22 || h < 7);
        if (typeof triggerBeep === 'function' && !isQuietHours) triggerBeep();

        beepCount++;
        if (beepCount >= targetBeeps) clearInterval(beepInterval);
    }, 1000);
};

// ======== MODO NOTURNO ========

window.toggleNightMode = function () {
    const overlay = document.getElementById('night-mode-overlay');
    if (!overlay) return;

    if (overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        nightModeOverride = false;
    } else {
        overlay.classList.add('active');
        nightModeOverride = true;
    }
}



// ======== MODAL DE NOTÍCIAS ========
window.openNewsModal = function (index) {
    const item = globalNewsItems[index];
    if (!item) return;

    document.getElementById('modal-title').textContent = item.title || '';
    document.getElementById('modal-source').textContent = 'Fonte: ' + (item.source || '');

    let desc = item.description || '';
    const tmp = document.createElement('div');
    tmp.innerHTML = desc;
    let cleanText = tmp.textContent || tmp.innerText || '';

    if (!cleanText.trim()) cleanText = 'Resumo não disponível para esta matéria.';

    document.getElementById('modal-desc').textContent = cleanText;
    document.getElementById('news-modal').classList.add('active');
}

window.closeNewsModal = function () {
    document.getElementById('news-modal').classList.remove('active');
}

document.getElementById('news-modal').addEventListener('click', function (e) {
    if (e.target === this) closeNewsModal();
});

// ======== MODAL TRÂNSITO PERSONALIZADO ========
window.openCustomTrafficModal = function (e) {
    if (e) e.stopPropagation();
    document.getElementById('ct-results').style.display = 'none';
    document.getElementById('ct-destination-input').value = '';
    document.getElementById('custom-traffic-modal').classList.add('active');
    document.getElementById('ct-destination-input').focus();
}

window.closeCustomTrafficModal = function () {
    document.getElementById('custom-traffic-modal').classList.remove('active');
}

document.getElementById('custom-traffic-modal').addEventListener('click', function (e) {
    if (e.target === this) closeCustomTrafficModal();
});

window.fetchCustomTraffic = async function () {
    const inputDest = document.getElementById('ct-destination-input').value.trim();
    const inputOrig = document.getElementById('ct-origin-input').value.trim();
    if (!inputDest || !inputOrig) return;

    const originsParam = encodeURIComponent(inputOrig);
    const destinationsParam = encodeURIComponent(inputDest);
    const workerUrl = `https://tablet.alison-zago.workers.dev/traffic?origins=${originsParam}&destinations=${destinationsParam}`;

    document.getElementById('ct-loading').style.display = 'block';
    document.getElementById('ct-results').style.display = 'none';

    try {
        const response = await fetch(workerUrl);

        if (!response.ok) throw new Error("Erro na API");

        const data = await response.json();
        document.getElementById('ct-loading').style.display = 'none';

        if (data.status === 'OK' && data.rows && data.rows[0]) {
            const element = data.rows[0].elements[0];

            if (element && element.status === 'OK') {
                const durationSecs = element.duration_in_traffic ? element.duration_in_traffic.value : element.duration.value;
                const staticSecs = element.duration.value;

                const diffSecs = durationSecs - staticSecs;
                const diffMins = Math.round(diffSecs / 60);

                const timeEl = document.getElementById('ct-time');
                const statusEl = document.getElementById('ct-status');

                timeEl.textContent = Math.round(durationSecs / 60) + ' min';

                if (diffMins <= 2) {
                    timeEl.style.color = 'var(--text-primary)';
                    statusEl.textContent = 'Trânsito Normal (Bom!)';
                    statusEl.style.color = '#4ade80'; // Verde
                } else if (diffMins <= 8) {
                    timeEl.style.color = '#facc15'; // Amarelo
                    statusEl.textContent = 'Trânsito atual: +' + diffMins + ' min';
                    statusEl.style.color = '#facc15';
                } else {
                    timeEl.style.color = '#ef4444'; // Vermelho
                    statusEl.textContent = 'Trânsito atual: +' + diffMins + ' min';
                    statusEl.style.color = '#ef4444';
                }

                document.getElementById('ct-results').style.display = 'block';
            } else {
                alert("Não foi possível calcular a rota para esse destino.");
            }
        } else {
            alert("Não foi possível encontrar uma rota para o destino informado.");
        }
    } catch (err) {
        document.getElementById('ct-loading').style.display = 'none';
        alert("Erro ao buscar a rota. Tente novamente.");
        console.error(err);
    }
}

// ======== API DO TRÂNSITO (GOOGLE MAPS VIA PROXY) ========

window.isTrafficSlidePage2 = false;
window.toggleTrafficSlider = function () {
    const slider = document.getElementById('traffic-slider');
    if (!slider) return;

    window.isTrafficSlidePage2 = !window.isTrafficSlidePage2;
    if (window.isTrafficSlidePage2) {
        slider.style.transform = 'translateX(-50%)';
    } else {
        slider.style.transform = 'translateX(0)';
    }
}

// Suporte a swipe para o Painel de Trânsito
setTimeout(() => {
    const trafficContainer = document.querySelector('.traffic-panel');
    if (trafficContainer) {
        let touchStartX = 0;
        let touchEndX = 0;

        trafficContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        trafficContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            if (touchEndX < touchStartX - 40) {
                // Swipe Left
                if (!window.isTrafficSlidePage2) window.toggleTrafficSlider();
            }
            if (touchEndX > touchStartX + 40) {
                // Swipe Right
                if (window.isTrafficSlidePage2) window.toggleTrafficSlider();
            }
        }
    }
}, 1000);

window.initGoogleMapsTraffic = async function () {
    const apiKey = 'AIzaSyAMPM6odYJFIjJyy0eYwGVsf0wn7u6GKzY';

    // O Proxy Mágico Universal do Alison na Cloudflare!
    const proxyBase = 'https://tablet.alison-zago.workers.dev/?url=';

    // Ponto de Partida: Rua Jaraguá, 737 (Latitude -23.524098, Longitude -46.647863)
    const origin = '-23.524098,-46.647863';

    // Destinos
    const destinations = [
        { id: 1, coords: '-23.511595,-46.694691' }, // R. Cenno Sbrigui, 378 (Água Branca)
        { id: 2, coords: '-23.612867,-46.668438' }, // R. dos Chanés, 205 (Moema)
        { id: 3, coords: '-23.522546,-46.663235' }, // R. Joaquim Manuel de Macedo, 329 (Barra Funda)
        { id: 4, coords: 'Av General Mac Arthur, 1587, Sao Paulo, SP' }, // JAG
        { id: 5, coords: 'Travessa Dr Claudio Damasceno, Sao Paulo, SP' }, // IPI
        { id: 6, coords: '-23.522546,-46.663235' }  // Vago
    ];

    // ======== FETCH TRAFFIC VIA PROXY ========
    // Fazemos a chamada para o nosso Worker no Cloudflare que atua como um Proxy Reverso.
    // Isso é necessário porque o tablet (Android 4.2.2 / Chrome 70) é incompatível com o SDK moderno do Google Maps.
    // O Worker faz a chamada Rest API para o Google, contorna problemas de CORS e devolve o JSON limpo.
    window.fetchTraffic = function () {
        const refreshIcon = document.getElementById('traffic-refresh-icon');
        if (refreshIcon) {
            refreshIcon.style.transform = 'rotate(180deg)';
        }

        const originsParam = encodeURIComponent(origin);
        const destinationsParam = encodeURIComponent(destinations.map(d => d.coords).join('|'));
        const workerUrl = `https://tablet.alison-zago.workers.dev/traffic?origins=${originsParam}&destinations=${destinationsParam}`;

        fetch(workerUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (refreshIcon) {
                    setTimeout(() => refreshIcon.style.transform = 'rotate(0deg)', 500);
                }

                if (data.status !== 'OK' || !data.rows || !data.rows[0]) {
                    console.error("Distance Matrix API retornou erro ou payload vazio:", data);
                    destinations.forEach(dest => {
                        const oldStatusEl = document.getElementById(`traffic-status-${dest.id}`);
                        if (oldStatusEl) { oldStatusEl.textContent = 'Erro API'; oldStatusEl.style.color = '#ef4444'; }
                        const newStatusEl = document.getElementById(`tf-status-${dest.id}`);
                        if (newStatusEl) { newStatusEl.textContent = 'Erro API'; newStatusEl.style.color = '#ef4444'; }
                    });
                    return;
                }

                const elements = data.rows[0].elements;

                destinations.forEach((dest, index) => {
                    const element = elements[index];

                    if (!element) {
                        console.error(`Elemento vazio para o destino ${dest.id}.`);
                        return;
                    }

                    if (element.status !== 'OK') {
                        console.error(`Trânsito Google Maps Falhou (Rota ${dest.id}):`, element.status);
                        const oldStatusEl = document.getElementById(`traffic-status-${dest.id}`);
                        if (oldStatusEl) {
                            oldStatusEl.textContent = 'Erro ao carregar';
                            oldStatusEl.style.color = '#ef4444';
                        }
                        const newStatusEl = document.getElementById(`tf-status-${dest.id}`);
                        if (newStatusEl) {
                            newStatusEl.textContent = 'Erro';
                            newStatusEl.style.color = '#ef4444';
                        }
                        return;
                    }

                    const trafficDuration = element.duration_in_traffic ? element.duration_in_traffic.value : element.duration.value;
                    const typicalDuration = element.duration.value;
                    let delay = trafficDuration - typicalDuration;
                    if (delay < 0) delay = 0;

                    const timeMin = Math.round(trafficDuration / 60);

                    // Atualiza Painel Antigo
                    const oldTimeEl = document.getElementById(`traffic-time-${dest.id}`);
                    if (oldTimeEl) oldTimeEl.textContent = timeMin + ' min';

                    // Atualiza Painel Novo (Condensado)
                    const newTimeEl = document.getElementById(`tf-time-${dest.id}`);
                    if (newTimeEl) newTimeEl.textContent = timeMin + ' min';

                    // Armazena a duração para o relógio atualizar o ETA dinamicamente
                    if (!window.trafficDurations) window.trafficDurations = {};
                    window.trafficDurations[dest.id] = trafficDuration;

                    let statusTextOld = 'Trânsito Leve (No tempo)';
                    let statusTextNew = 'Trânsito: <b>Bom!</b>';
                    let statusColor = '#10b981';
                    let iconColor = '#10b981';

                    if (delay > 180 && delay <= 600) {
                        const minDelay = Math.round(delay / 60);
                        statusTextOld = 'Trânsito Moderado (+ ' + minDelay + ' min)';
                        statusTextNew = 'Trânsito: <b>+' + minDelay + ' min</b>';
                        statusColor = '#fbbf24';
                        iconColor = '#fbbf24';
                    } else if (delay > 600) {
                        const minDelay = Math.round(delay / 60);
                        statusTextOld = 'Trânsito Pesado (+ ' + minDelay + ' min)';
                        statusTextNew = 'Trânsito: <b>+' + minDelay + ' min</b>';
                        statusColor = '#ef4444';
                        iconColor = '#ef4444';
                    }

                    // Painel Antigo Status
                    const oldStatusEl = document.getElementById(`traffic-status-${dest.id}`);
                    if (oldStatusEl) {
                        oldStatusEl.textContent = statusTextOld;
                        oldStatusEl.style.color = statusColor;
                        if (oldTimeEl) oldTimeEl.style.color = iconColor;
                    }
                    const iconEl = document.getElementById(`traffic-icon-${dest.id}`);
                    if (iconEl) iconEl.style.color = iconColor;

                    // Painel Novo Status
                    const newStatusEl = document.getElementById(`tf-status-${dest.id}`);
                    if (newStatusEl) {
                        newStatusEl.innerHTML = statusTextNew;
                        newStatusEl.style.color = statusColor;
                        if (newTimeEl) newTimeEl.style.color = iconColor;
                    }
                });
            })
            .catch(err => {
                const refreshIcon = document.getElementById('traffic-refresh-icon');
                if (refreshIcon) refreshIcon.style.transform = 'rotate(0deg)';

                console.error("ERRO CRÍTICO NO TRÂNSITO:", err.message);

                // Exibe fallback visual para que o usuário saiba que houve falha (ex: worker fora do ar)
                destinations.forEach(dest => {
                    const newStatusEl = document.getElementById(`tf-status-${dest.id}`);
                    if (newStatusEl) {
                        newStatusEl.textContent = 'Falha Conexão';
                        newStatusEl.style.color = '#ef4444';
                    }
                });
            });
    }

    fetchTraffic();
    setInterval(fetchTraffic, 15 * 60 * 1000);
}



// ======== PIXEL SHIFTING (ANTI BURN-IN) ========
// Move a interface sutilmente a cada 5 minutos para evitar retenção de imagem na tela
function applyPixelShift() {
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return;

    // Valores aleatórios entre -3px e 3px
    const shiftX = Math.floor(Math.random() * 7) - 3;
    const shiftY = Math.floor(Math.random() * 7) - 3;

    // Aplica transição suave para não ser um "pulo" brusco
    dashboard.style.transition = 'transform 2s ease-in-out';
    dashboard.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
}

// ======== INIT DASHBOARD ========
// Relógio
updateClock();
setInterval(updateClock, 1000);

// Fundo
changeBackground();
setInterval(changeBackground, CHANGE_BG_INTERVAL);

// Pixel Shift (Burn-in Protection)
setInterval(applyPixelShift, 5 * 60 * 1000);

// Clima
fetchWeather();
setInterval(fetchWeather, UPDATE_WEATHER_INTERVAL);

// Notícias
if (typeof fetchAllNews === 'function') {
    fetchAllNews();
    setInterval(fetchAllNews, 30 * 60 * 1000);
}

// Calendário
if (typeof renderCalendar === 'function') {
    renderCalendar();
    setInterval(renderCalendar, 60 * 60 * 1000);
}

// Bateria
initBattery();

// Inicia API do Trânsito pelo Worker
initGoogleMapsTraffic();

function checkInitialTrafficPage() {
    const now = new Date();
    now.setHours(now.getHours() - 1);

    const d = now.getDay();
    const h = now.getHours();

    let shouldBePage2 = false;
    if (d === 5 && h >= 18) shouldBePage2 = true;
    else if (d === 6 || d === 0) shouldBePage2 = true;

    if (shouldBePage2 && typeof window.toggleTrafficSlider === 'function' && !window.isTrafficSlidePage2) {
        window.toggleTrafficSlider();
    }
}
checkInitialTrafficPage();
