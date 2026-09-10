// Configurações
var UPDATE_WEATHER_INTERVAL = 30 * 60 * 1000; // 30 min
var CHANGE_BG_INTERVAL = 5 * 60 * 1000; // 5 min
var LATITUDE = -23.5276;
var LONGITUDE = -46.6384;

// PadStart Polyfill/Helper para números antigos
function padZero(num) {
    return num < 10 ? '0' + num : '' + num;
}

// Função genérica para embaralhar array
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// Imagens de fundo locais (80 imagens curadas baixadas)
var backgroundImages = [
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
shuffleArray(backgroundImages);

// Elementos
var bg1 = document.getElementById('bg1');
var bg2 = document.getElementById('bg2');
var timeEl = document.getElementById('time');
var dateEl = document.getElementById('date');

// ======== RELÓGIO & DATA ========
function updateClock() {
    var now = new Date();

    var hours = padZero(now.getHours());
    var minutes = padZero(now.getMinutes());
    timeEl.textContent = hours + ':' + minutes;

    var day = padZero(now.getDate());
    var month = padZero(now.getMonth() + 1);
    var year = now.getFullYear();
    dateEl.textContent = day + '/' + month + '/' + year;
}
setInterval(updateClock, 1000);
updateClock();

// ======== BACKGROUND ROTATIVO ========
var currentBgIndex = 0;
var isBg1Active = true;

// Preload da primeira imagem
bg1.style.backgroundImage = "url('" + backgroundImages[currentBgIndex] + "')";

function changeBackground() {
    currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
    var nextImageUrl = backgroundImages[currentBgIndex];

    var img = new Image();
    img.src = nextImageUrl;

    img.onload = function() {
        var nextImage = "url('" + nextImageUrl + "')";
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

// ======== PREVISÃO DO TEMPO ========
function fetchWeather() {
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + LATITUDE + "&longitude=" + LONGITUDE + "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=8";

    fetch(url)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            document.getElementById('current-temp').textContent = Math.round(data.current.temperature_2m) + "°";
            if (data.daily) {
                document.getElementById('current-max').textContent = Math.round(data.daily.temperature_2m_max[0]) + "°";
                document.getElementById('current-min').textContent = Math.round(data.daily.temperature_2m_min[0]) + "°";
            }
            document.getElementById('current-humidity').textContent = data.current.relative_humidity_2m + "%";
            document.getElementById('current-wind').textContent = Math.round(data.current.wind_speed_10m);

            var currentHour = new Date().getHours();
            var currentPrecipProb = 0;

            var hourlyContainer = document.getElementById('hourly-forecast');
            var hourlyHtml = '';

            var times = data.hourly.time;
            var startIndex = 0;

            for (var i = 0; i < times.length; i++) {
                var tDate = new Date(times[i]);
                if (tDate.getHours() >= currentHour && tDate.getDate() === new Date().getDate()) {
                    startIndex = i;
                    break;
                }
            }

            currentPrecipProb = data.hourly.precipitation_probability[startIndex] || 0;
            document.getElementById('current-rain').textContent = currentPrecipProb + "%";

            for (var j = startIndex; j < startIndex + 9; j++) {
                if (j >= times.length) break;
                var hourDate = new Date(times[j]);
                var h = padZero(hourDate.getHours()) + ':00';
                var temp = Math.round(data.hourly.temperature_2m[j]);
                var rainProb = data.hourly.precipitation_probability[j];
                var windSpeed = Math.round(data.hourly.wind_speed_10m[j]);

                hourlyHtml += '<div class="hourly-item">' +
                    '<span class="hourly-time">' + h + '</span>' +
                    '<span class="hourly-temp">' + temp + '°</span>' +
                    '<span style="font-size: 0.7rem; color: #e2e8f0;"><i class="ph ph-drop"></i> ' + rainProb + '%</span>' +
                    '<span style="font-size: 0.7rem; color: #e2e8f0;"><i class="ph ph-wind"></i> ' + windSpeed + ' <span style="font-size: 0.5rem;">km</span></span>' +
                '</div>';
            }

            hourlyContainer.innerHTML = hourlyHtml;

            var dailyContainer = document.getElementById('daily-forecast');
            if (dailyContainer && data.daily) {
                var dailyHtml = '';
                var dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

                for (var k = 1; k <= 7; k++) {
                    if (k >= data.daily.time.length) break;

                    var parts = data.daily.time[k].split('-');
                    var dayDate = new Date(parts[0], parts[1] - 1, parts[2]);
                    var dayName = dayNames[dayDate.getDay()];
                    var monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                    var monthName = monthNames[dayDate.getMonth()];

                    var tMax = Math.round(data.daily.temperature_2m_max[k]);
                    var tMin = Math.round(data.daily.temperature_2m_min[k]);
                    var pProb = data.daily.precipitation_probability_max[k];

                    dailyHtml += '<div class="daily-item">' +
                        '<span class="daily-day">' + dayName + ', ' + dayDate.getDate() + ' de ' + monthName + '</span>' +
                        '<span class="daily-rain"><i class="ph ph-drop"></i> ' + pProb + '%</span>' +
                        '<div class="daily-temps">' +
                            '<span class="temp-max">' + tMax + '°</span>' +
                            '<span style="color: #ffffff; font-weight: 400;">/</span>' +
                            '<span class="temp-min">' + tMin + '°</span>' +
                        '</div>' +
                    '</div>';
                }
                dailyContainer.innerHTML = dailyHtml;
            }

        })
        .catch(function(error) {
            console.error("Erro ao buscar clima: ", error);
            document.getElementById('current-temp').textContent = '--°';
            var hourlyContainer = document.getElementById('hourly-forecast');
            if (hourlyContainer) {
                hourlyContainer.innerHTML = '<div style="color: red; font-size: 0.8rem; padding: 10px;">Erro: ' + error.message + '</div>';
            }
        });
}
fetchWeather();
setInterval(fetchWeather, UPDATE_WEATHER_INTERVAL);

// Lógica do Slider do Clima
var isWeatherSlideDaily = false;
function toggleWeatherSlider() {
    var slider = document.getElementById('weather-slider');
    if (!slider) return;

    isWeatherSlideDaily = !isWeatherSlideDaily;
    if (isWeatherSlideDaily) {
        slider.style.transform = 'translateX(-50%)';
        slider.style.webkitTransform = 'translateX(-50%)';
    } else {
        slider.style.transform = 'translateX(0)';
        slider.style.webkitTransform = 'translateX(0)';
    }
}

// ======== NOTÍCIAS ========
var newsList = document.getElementById('news-list');
var RSS_FEEDS = [
    { url: 'https://iclnoticias.com.br/feed/', tag: 'ICL', class: 'tag-icl', source: 'ICL Notícias' },
    { url: 'https://www.gazetaesportiva.com/feed/', tag: 'Esportes', class: 'tag-esportes', source: 'Gazeta Esportiva' },
    { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', tag: 'Folha', class: 'tag-folha', source: 'Folha de S.Paulo' },
    { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', tag: 'BBC', class: 'tag-bbc', source: 'BBC Brasil' }
];

function fetchAllNews() {
    newsList.innerHTML = '<div style="text-align: center; color: #e2e8f0;">Carregando notícias...</div>';
    
    var allItems = [];
    var requestsCompleted = 0;

    for (var i = 0; i < RSS_FEEDS.length; i++) {
        (function(feed) {
            var url = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.url);
            fetch(url)
                .then(function(response) { return response.json(); })
                .then(function(data) {
                    if (data.status === 'ok') {
                        var items = data.items.slice(0, 10);
                        for (var j = 0; j < items.length; j++) {
                            var itemCopy = {};
                            for (var key in items[j]) { itemCopy[key] = items[j][key]; }
                            itemCopy.tag = feed.tag;
                            itemCopy.tagClass = feed.class;
                            itemCopy.source = feed.source;
                            allItems.push(itemCopy);
                        }
                    }
                })
                .catch(function(error) {
                    console.error("Erro ao buscar feed " + feed.tag, error);
                })
                .finally(function() {
                    requestsCompleted++;
                    if (requestsCompleted === RSS_FEEDS.length) {
                        shuffleArray(allItems);
                        newsList.innerHTML = '';
                        
                        for (var k = 0; k < allItems.length; k++) {
                            var item = allItems[k];
                            var dateStr = '';
                            if (item.pubDate) {
                                try {
                                    var d = new Date(item.pubDate);
                                    if (!isNaN(d.getTime())) {
                                        var day = padZero(d.getDate());
                                        var month = padZero(d.getMonth() + 1);
                                        var year = d.getFullYear();
                                        dateStr = ' • ' + day + '/' + month + '/' + year;
                                    }
                                } catch (e) { }
                            }

                            var el = document.createElement('div');
                            el.className = 'news-item';
                            el.innerHTML = '<div class="news-header">' +
                                '<span class="news-tag ' + item.tagClass + '">' + item.tag + '</span>' +
                                '<span class="news-source">Fonte: ' + item.source + dateStr + '</span>' +
                            '</div>' +
                            '<div class="news-title">' + item.title + '</div>';
                            newsList.appendChild(el);
                        }
                    }
                });
        })(RSS_FEEDS[i]);
    }
}
fetchAllNews();
setInterval(fetchAllNews, 30 * 60 * 1000);

var scrollPos = 0;
function autoScrollNews() {
    var container = document.getElementById('news-list-container');
    if (newsList.scrollHeight > container.clientHeight) {
        scrollPos += 0.2;
        if (scrollPos >= newsList.scrollHeight - container.clientHeight) {
            scrollPos = 0;
        }
        newsList.style.transform = "translateY(-" + scrollPos + "px)";
        newsList.style.webkitTransform = "translateY(-" + scrollPos + "px)";
    }
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(cb){ setTimeout(cb, 1000/60); };
    requestAnimationFrame(autoScrollNews);
}
autoScrollNews();

// ======== CALENDÁRIO MENSAL ========
var calendarGrid = document.getElementById('calendar-grid');
var calendarMonthYear = document.getElementById('calendar-month-year');
var calendarLegend = document.getElementById('calendar-legend');

function renderCalendar() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();

    var monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    calendarMonthYear.innerHTML = '<i class="ph ph-calendar"></i> ' + monthNames[month] + ' ' + year;

    var url = "https://brasilapi.com.br/api/feriados/v1/" + year;
    fetch(url)
        .then(function(response) { return response.json(); })
        .then(function(holidays) {
            buildCalendarGrid(year, month, holidays, now);
        })
        .catch(function(e) {
            console.error(e);
            buildCalendarGrid(year, month, [], now);
        });
}

function buildCalendarGrid(year, month, holidays, now) {
    var firstDayIndex = new Date(year, month, 1).getDay();
    var lastDay = new Date(year, month + 1, 0).getDate();

    calendarGrid.innerHTML = '';
    if (calendarLegend) calendarLegend.innerHTML = '';

    for (var i = 0; i < firstDayIndex; i++) {
        var emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDiv);
    }

    for (var j = 1; j <= lastDay; j++) {
        var dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = j;

        var dayOfWeek = new Date(year, month, j).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayDiv.classList.add('weekend');
        }

        if (year === now.getFullYear() && month === now.getMonth() && j === now.getDate()) {
            dayDiv.classList.add('today');
        }

        var dateStr = year + '-' + padZero(month + 1) + '-' + padZero(j);
        
        var holiday = null;
        for (var h = 0; h < holidays.length; h++) {
            if (holidays[h].date === dateStr) {
                holiday = holidays[h];
                break;
            }
        }

        if (holiday) {
            dayDiv.classList.add('holiday');
            dayDiv.title = holiday.name;

            if (calendarLegend) {
                var legendItem = document.createElement('div');
                legendItem.innerHTML = '<strong>' + padZero(j) + '/' + padZero(month + 1) + '</strong> - ' + holiday.name;
                calendarLegend.appendChild(legendItem);
            }
        }

        calendarGrid.appendChild(dayDiv);
    }
}
renderCalendar();
setInterval(renderCalendar, 24 * 60 * 60 * 1000);

// ======== TIMER ========
var timerSeconds = 0;
var timerInterval = null;
var timerDisplay = document.getElementById('timer-display');
var timerToggleBtn = document.getElementById('timer-toggle-btn');

function updateTimerDisplay() {
    var h = Math.floor(timerSeconds / 3600);
    var m = Math.floor((timerSeconds % 3600) / 60);
    var s = timerSeconds % 60;

    timerDisplay.textContent = padZero(h) + ':' + padZero(m) + ':' + padZero(s);
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
        clearInterval(timerInterval);
        timerInterval = null;
        timerToggleBtn.innerHTML = '<i class="ph ph-play"></i> Iniciar';
    } else {
        if (timerSeconds > 0) {
            timerInterval = setInterval(function() {
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

var alarmInterval = null;

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
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        var audioCtx = new AudioContextClass();
        var oscillator = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(0);
        oscillator.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
        console.error("Áudio não suportado", e);
    }
}

// ======== FULLSCREEN ========
document.body.addEventListener('click', function () {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
});
