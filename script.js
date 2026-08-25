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
const notepadEl = document.getElementById('notepad');

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

// ======== BLOCO DE NOTAS ========
const savedNote = localStorage.getItem('tablet_notes');
if (savedNote) notepadEl.value = savedNote;

notepadEl.addEventListener('input', (e) => {
    localStorage.setItem('tablet_notes', e.target.value);
});

// Calendário Removido Temporariamente 

// ======== PREVISÃO DO TEMPO ========
async function fetchWeather() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo`;

        const response = await fetch(url);
        const data = await response.json();

        // Dados atuais
        document.getElementById('current-temp').textContent = `${Math.round(data.current.temperature_2m)}°`;
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
                    <span style="font-size: 0.8rem; color: var(--text-secondary);"><i class="ph ph-wind"></i> ${windSpeed} km/h</span>
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
