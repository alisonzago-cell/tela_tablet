// Configurações
const UPDATE_WEATHER_INTERVAL = 30 * 60 * 1000; // 30 min
const CHANGE_BG_INTERVAL = 5 * 60 * 1000; // 5 min
const LATITUDE = -23.5276;
const LONGITUDE = -46.6384;

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

// ======== RELÓGIO & DATA ========
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
}
setInterval(updateClock, 1000);
updateClock();

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
            bg2.style.opacity = 1;
            bg1.style.opacity = 0;
        } else {
            bg1.style.backgroundImage = nextImage;
            bg1.style.opacity = 1;
            bg2.style.opacity = 0;
        }
        isBg1Active = !isBg1Active;
    };
}
setInterval(changeBackground, CHANGE_BG_INTERVAL);

// Calendário Removido Temporariamente 

// ======== PREVISÃO DO TEMPO ========
async function fetchWeather() {
    try {
        const apiProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const url = `${apiProtocol}//api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,is_day&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=8&models=best_match`;
        const aqiUrl = `${apiProtocol}//air-quality-api.open-meteo.com/v1/air-quality?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=us_aqi&timezone=America%2FSao_Paulo`;

        const [response, aqiResponse] = await Promise.all([fetch(url), fetch(aqiUrl)]);
        const data = await response.json();
        const aqiData = await aqiResponse.json();

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

        // Dados atuais
        document.getElementById('current-temp').textContent = `${Math.round(data.current.temperature_2m)}°`;
        if (data.daily) {
            document.getElementById('current-max').textContent = `${Math.round(data.daily.temperature_2m_max[0])}°`;
            document.getElementById('current-min').textContent = `${Math.round(data.daily.temperature_2m_min[0])}°`;
        }
        document.getElementById('current-humidity').textContent = `${data.current.relative_humidity_2m}%`;
        document.getElementById('current-wind').textContent = `${Math.round(data.current.wind_speed_10m)}`;
        // Chance de chuva atual (vamos pegar da primeira hora próxima no forecast horário)

        const currentHour = new Date().getHours();
        let currentPrecipProb = 0;

        // Horas futuras
        const hourlyContainer = document.getElementById('hourly-forecast');
        let hourlyHtml = '';

        // A API retorna as 24h do dia em diante. Precisamos achar a hora atual.
        const times = data.hourly.time;
        const nowIso = new Date().toISOString().substring(0, 14) + "00"; // aproximando a hora
        let startIndex = 0;

        for (let i = 0; i < times.length; i++) {
            const tDate = new Date(times[i]);
            if (tDate.getHours() >= currentHour && tDate.getDate() === new Date().getDate()) {
                startIndex = i;
                break;
            }
        }

        currentPrecipProb = data.hourly.precipitation_probability[startIndex] || 0;
        document.getElementById('current-rain').textContent = `${currentPrecipProb}%`;

        // Proximas 8 horas
        for (let i = startIndex; i < startIndex + 8; i++) {
            if (i >= times.length) break;
            const hourDate = new Date(times[i]);
            const h = String(hourDate.getHours()).padStart(2, '0') + ':00';
            const temp = Math.round(data.hourly.temperature_2m[i]);
            const rainProb = data.hourly.precipitation_probability[i];
            const windSpeed = Math.round(data.hourly.wind_speed_10m[i]);

            hourlyHtml += `
                <div class="hourly-item">
                    <span class="hourly-time">${h}</span>
                    <span class="hourly-temp">${temp}°</span>
                    <span style="font-size: 0.7rem; color: var(--text-secondary);"><i class="ph ph-drop"></i> ${rainProb}%</span>
                    <span style="font-size: 0.7rem; color: var(--text-secondary);"><i class="ph ph-wind"></i> ${windSpeed} <span style="font-size: 0.5rem;">km</span></span>
                </div>
            `;
        }

        hourlyContainer.innerHTML = hourlyHtml;

        // Proximos Dias (Daily Forecast)
        const dailyContainer = document.getElementById('daily-forecast');
        if (dailyContainer && data.daily) {
            let dailyHtml = '';
            const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

            // Começa de i = 1 para pegar o dia seguinte em diante. Pega próximos 7 dias.
            for (let i = 1; i <= 7; i++) {
                if (i >= data.daily.time.length) break;

                // Tratar timezone para pegar dia da semana correto local
                const [year, month, day] = data.daily.time[i].split('-');
                const dayDate = new Date(year, month - 1, day);
                const dayName = dayNames[dayDate.getDay()];
                const dayPadded = String(dayDate.getDate()).padStart(2, '0');
                const monthPadded = String(dayDate.getMonth() + 1).padStart(2, '0');

                const tMax = Math.round(data.daily.temperature_2m_max[i]);
                const tMin = Math.round(data.daily.temperature_2m_min[i]);
                const pProb = data.daily.precipitation_probability_max[i];

                dailyHtml += `
                    <div class="daily-item">
                        <span class="daily-day">${dayName}, ${dayPadded}/${monthPadded}</span>
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

    } catch (error) {
        console.error("Erro ao buscar clima: ", error);

        // Mudar o título para indicar erro
        const locTitle = document.getElementById('location-title');
        if (locTitle) {
            locTitle.innerHTML = '<i class="ph ph-warning-circle"></i> Erro ao conectar ao Meteo';
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
                    <span class="daily-day">Segunda, 01/01</span>
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
fetchWeather();
setInterval(fetchWeather, UPDATE_WEATHER_INTERVAL);

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
    { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', tag: 'BBC', class: 'tag-bbc', source: 'BBC Brasil' }
];

// ======= NOTÍCIAS =======
let globalNewsItems = [];

async function fetchAllNews() {
    newsList.innerHTML = '<div style="text-align: center; color: var(--text-secondary);">Carregando notícias...</div>';
    try {
        let allItems = [];

        for (const feed of RSS_FEEDS) {
            const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'ok') {
                const items = data.items.slice(0, 10); // 10 de cada
                items.forEach(item => {
                    allItems.push(Object.assign({}, item, {
                        tag: feed.tag,
                        tagClass: feed.class,
                        source: feed.source
                    }));
                });
            }
        }

        shuffleArray(allItems);
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
        console.error("Erro ao buscar notícias: ", error);
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
                <div class="news-title">Notícia Fictícia para Teste de Diagramação - Manchete de Exemplo que Ocupa Mais de Uma Linha para Testar o Espaçamento e a Rolagem Automática ${i + 1}</div>
            `;
            newsList.appendChild(el);
        }
    }
}

fetchAllNews();
setInterval(fetchAllNews, 30 * 60 * 1000);

// Auto-scroll das notícias
let scrollPos = 0;
function autoScrollNews() {
    const container = document.getElementById('news-list-container');
    if (newsList.scrollHeight > container.clientHeight) {
        scrollPos += 0.2; // velocidade do scroll reduzida pela metade
        if (scrollPos >= newsList.scrollHeight - container.clientHeight) {
            scrollPos = 0; // volta pro topo
        }
        newsList.style.transform = `translate3d(0, -${scrollPos}px, 0)`;
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
async function initBattery() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
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
            }
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
        } catch (e) { console.error('Battery API error', e); }
    }
}
initBattery();

// ======== MODO NOTURNO ========
let nightModeOverride = null;

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

function checkNightMode() {
    if (nightModeOverride !== null) return; // User manually toggled
    const overlay = document.getElementById('night-mode-overlay');
    if (!overlay) return;

    const hour = new Date().getHours();
    const isNight = hour >= 23 || hour < 5;

    if (isNight && !overlay.classList.contains('active')) {
        overlay.classList.add('active');
    } else if (!isNight && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
    }
}
setInterval(checkNightMode, 60000);
checkNightMode();

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

// ======== API DO TRÂNSITO (GOOGLE MAPS VIA PROXY) ========
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
        { id: 3, coords: '-23.522546,-46.663235' }  // R. Joaquim Manuel de Macedo, 329 (Barra Funda)
    ];

    async function fetchTraffic() {
        for (const dest of destinations) {
            const googleUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${dest.coords}&departure_time=now&key=${apiKey}`;
            // Envia a URL do Google Maps para o Worker do Cloudflare usando encodeURIComponent para segurança
            const url = proxyBase + encodeURIComponent(googleUrl);

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.rows && data.rows[0].elements && data.rows[0].elements[0].status === "OK") {
                    const element = data.rows[0].elements[0];

                    const trafficDuration = element.duration_in_traffic ? element.duration_in_traffic.value : element.duration.value;
                    const typicalDuration = element.duration.value;
                    let delay = trafficDuration - typicalDuration;
                    if (delay < 0) delay = 0;

                    const timeMin = Math.round(trafficDuration / 60);
                    document.getElementById(`traffic-time-${dest.id}`).textContent = timeMin + ' min';

                    const arrivalTime = new Date(Date.now() + trafficDuration * 1000);
                    const arrH = String(arrivalTime.getHours()).padStart(2, '0');
                    const arrM = String(arrivalTime.getMinutes()).padStart(2, '0');
                    document.getElementById(`traffic-arrival-${dest.id}`).textContent = 'Chegada est. ' + arrH + ':' + arrM;

                    let statusText = 'Trânsito Leve (No tempo)';
                    let statusColor = 'var(--text-secondary)';
                    let iconColor = '#10b981';

                    if (delay > 180 && delay <= 600) {
                        statusText = 'Trânsito Moderado (+ ' + Math.round(delay / 60) + ' min)';
                        statusColor = '#fbbf24';
                        iconColor = '#fbbf24';
                    } else if (delay > 600) {
                        statusText = 'Trânsito Pesado (+ ' + Math.round(delay / 60) + ' min)';
                        statusColor = '#ef4444';
                        iconColor = '#ef4444';
                    }

                    document.getElementById(`traffic-status-${dest.id}`).textContent = statusText;
                    document.getElementById(`traffic-status-${dest.id}`).style.color = statusColor;
                    document.getElementById(`traffic-time-${dest.id}`).style.color = iconColor;

                    const iconEl = document.getElementById(`traffic-icon-${dest.id}`);
                    if (iconEl) iconEl.style.color = iconColor;
                }
            } catch (e) {
                console.error(`Trânsito Google Maps Falhou (Rota ${dest.id}):`, e);
                document.getElementById(`traffic-status-${dest.id}`).textContent = 'Erro ao carregar';
                document.getElementById(`traffic-status-${dest.id}`).style.color = '#ef4444';
                document.getElementById(`traffic-time-${dest.id}`).textContent = '--';
            }
        }
    }

    fetchTraffic();
    setInterval(fetchTraffic, 15 * 60 * 1000);
}
initGoogleMapsTraffic();
