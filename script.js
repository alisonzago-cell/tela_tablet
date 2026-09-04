// Configurações
const UPDATE_WEATHER_INTERVAL = 30 * 60 * 1000; // 30 min
const CHANGE_BG_INTERVAL = 5 * 60 * 1000; // 5 min
const LATITUDE = -23.5276;
const LONGITUDE = -46.6384;

// Imagens de natureza curadas para o fundo (Unsplash CDN/Source)
const backgroundImages = [
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506744012022-28d699411967?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1887&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop'
];

// Elementos
const bg1 = document.getElementById('bg1');
const bg2 = document.getElementById('bg2');
const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');

// ======== RELÓGIO & DATA ========
function updateClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;

    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let dateStr = now.toLocaleDateString('pt-BR', options);
    // Remove " de " por um espaço para ficar mais bonito
    dateEl.textContent = dateStr;
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
    const nextImage = `url('${backgroundImages[currentBgIndex]}')`;

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
}
setInterval(changeBackground, CHANGE_BG_INTERVAL);

// Calendário Removido Temporariamente 

// ======== PREVISÃO DO TEMPO ========
async function fetchWeather() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo`;

        const response = await fetch(url);
        const data = await response.json();

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

        // Proximas 9 horas
        for (let i = startIndex; i < startIndex + 9; i++) {
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
                    <span style="font-size: 0.8rem; color: var(--text-secondary);"><i class="ph ph-drop"></i> ${rainProb}%</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);"><i class="ph ph-wind"></i> ${windSpeed} <span style="font-size: 0.5rem;">km/h</span></span>
                </div>
            `;
        }

        hourlyContainer.innerHTML = hourlyHtml;

        // Proximos Dias (Daily Forecast)
        const dailyContainer = document.getElementById('daily-forecast');
        if (dailyContainer && data.daily) {
            let dailyHtml = '';
            const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

            // Começa de i = 1 para pegar o dia seguinte em diante. Pega próximos 5 dias.
            for (let i = 1; i <= 5; i++) {
                if (i >= data.daily.time.length) break;

                // Tratar timezone para pegar dia da semana correto local
                const [year, month, day] = data.daily.time[i].split('-');
                const dayDate = new Date(year, month - 1, day);
                const dayName = dayNames[dayDate.getDay()];
                const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                const monthName = monthNames[dayDate.getMonth()];

                const tMax = Math.round(data.daily.temperature_2m_max[i]);
                const tMin = Math.round(data.daily.temperature_2m_min[i]);
                const pProb = data.daily.precipitation_probability_max[i];

                dailyHtml += `
                    <div class="daily-item">
                        <span class="daily-day">${dayName}, ${dayDate.getDate()} de ${monthName}</span>
                        <span class="daily-rain"><i class="ph ph-drop"></i> ${pProb}%</span>
                        <div class="daily-temps">
                            <span class="temp-max">${tMax}°</span>
                            <span class="temp-min">${tMin}°</span>
                        </div>
                    </div>
                `;
            }
            dailyContainer.innerHTML = dailyHtml;
        }

    } catch (error) {
        console.error("Erro ao buscar clima: ", error);
        document.getElementById('current-temp').textContent = '--°';
    }
}
fetchWeather();
setInterval(fetchWeather, UPDATE_WEATHER_INTERVAL);

// ======== NOTÍCIAS ========
const newsList = document.getElementById('news-list');
const RSS_FEEDS = [
    { url: 'https://iclnoticias.com.br/feed/', tag: 'ICL', class: 'tag-icl', source: 'ICL Notícias' },
    { url: 'https://www.gazetaesportiva.com/feed/', tag: 'Esportes', class: 'tag-esportes', source: 'Gazeta Esportiva' },
    { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', tag: 'Folha', class: 'tag-folha', source: 'Folha de S.Paulo' },
    { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', tag: 'BBC', class: 'tag-bbc', source: 'BBC Brasil' }
];

// Função para embaralhar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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
        
        allItems.forEach(item => {
            let dateStr = '';
            if (item.pubDate) {
                try {
                    const d = new Date(item.pubDate);
                    if (!isNaN(d.getTime())) {
                        dateStr = ' • ' + d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });
                    }
                } catch(e) {}
            }
            
            const el = document.createElement('div');
            el.className = 'news-item';
            el.innerHTML = `
                <div class="news-header">
                    <span class="news-tag ${item.tagClass}">${item.tag}</span>
                    <span class="news-source">Fonte: ${item.source}${dateStr}</span>
                </div>
                <div class="news-title">${item.title}</div>
            `;
            newsList.appendChild(el);
        });

    } catch (error) {
        console.error("Erro ao buscar notícias: ", error);
        newsList.innerHTML = '<div style="text-align: center; color: red;">Erro ao carregar notícias.</div>';
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
        newsList.style.transform = `translateY(-${scrollPos}px)`;
    }
    requestAnimationFrame(autoScrollNews);
}
autoScrollNews();

// ======== CALENDÁRIO MENSAL ========
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthYear = document.getElementById('calendar-month-year');
const calendarLegend = document.getElementById('calendar-legend');

async function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    calendarMonthYear.innerHTML = `<i class="ph ph-calendar"></i> ${monthNames[month]} ${year}`;
    
    // Buscar feriados
    let holidays = [];
    try {
        const url = `https://brasilapi.com.br/api/feriados/v1/${year}`;
        const response = await fetch(url);
        holidays = await response.json();
    } catch(e) {
        console.error(e);
    }
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    calendarGrid.innerHTML = '';
    if (calendarLegend) calendarLegend.innerHTML = '';
    
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
            dayDiv.classList.add('holiday');
            dayDiv.title = holiday.name;
            
            // Adiciona na legenda se o feriado for neste mês
            if (calendarLegend) {
                const legendItem = document.createElement('div');
                legendItem.innerHTML = `<strong>${String(i).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}</strong> - ${holiday.name}`;
                calendarLegend.appendChild(legendItem);
            }
        }
        
        calendarGrid.appendChild(dayDiv);
    }
}

renderCalendar();
setInterval(renderCalendar, 24 * 60 * 60 * 1000); // Atualiza diariamente
