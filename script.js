const UI = {
    location: document.getElementById('location'),
    datetime: document.getElementById('datetime'),
    icon: document.getElementById('weather-icon'),
    temp: document.getElementById('temperature'),
    condition: document.getElementById('condition'),
    humidity: document.getElementById('humidity'),
    wind: document.getElementById('wind'),
    feelsLike: document.getElementById('feels-like')
};

// WMO Weather interpretation codes (WW)
const weatherCodes = {
    0: { label: 'Clear sky', icon: 'ph-sun', nightIcon: 'ph-moon' },
    1: { label: 'Mainly clear', icon: 'ph-cloud-sun', nightIcon: 'ph-cloud-moon' },
    2: { label: 'Partly cloudy', icon: 'ph-cloud-sun', nightIcon: 'ph-cloud-moon' },
    3: { label: 'Overcast', icon: 'ph-cloud', nightIcon: 'ph-cloud' },
    45: { label: 'Fog', icon: 'ph-cloud-fog', nightIcon: 'ph-cloud-fog' },
    48: { label: 'Depositing rime fog', icon: 'ph-cloud-fog', nightIcon: 'ph-cloud-fog' },
    51: { label: 'Light drizzle', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    53: { label: 'Moderate drizzle', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    55: { label: 'Dense drizzle', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    56: { label: 'Light freezing drizzle', icon: 'ph-cloud-snow', nightIcon: 'ph-cloud-snow' },
    57: { label: 'Dense freezing drizzle', icon: 'ph-cloud-snow', nightIcon: 'ph-cloud-snow' },
    61: { label: 'Slight rain', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    63: { label: 'Moderate rain', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    65: { label: 'Heavy rain', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    66: { label: 'Light freezing rain', icon: 'ph-cloud-snow', nightIcon: 'ph-cloud-snow' },
    67: { label: 'Heavy freezing rain', icon: 'ph-cloud-snow', nightIcon: 'ph-cloud-snow' },
    71: { label: 'Slight snow', icon: 'ph-snowflake', nightIcon: 'ph-snowflake' },
    73: { label: 'Moderate snow', icon: 'ph-snowflake', nightIcon: 'ph-snowflake' },
    75: { label: 'Heavy snow', icon: 'ph-snowflake', nightIcon: 'ph-snowflake' },
    77: { label: 'Snow grains', icon: 'ph-snowflake', nightIcon: 'ph-snowflake' },
    80: { label: 'Slight rain showers', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    81: { label: 'Moderate rain showers', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    82: { label: 'Violent rain showers', icon: 'ph-cloud-rain', nightIcon: 'ph-cloud-rain' },
    85: { label: 'Slight snow showers', icon: 'ph-snowflake', nightIcon: 'ph-snowflake' },
    86: { label: 'Heavy snow showers', icon: 'ph-snowflake', nightIcon: 'ph-snowflake' },
    95: { label: 'Thunderstorm', icon: 'ph-cloud-lightning', nightIcon: 'ph-cloud-lightning' },
    96: { label: 'Thunderstorm with hail', icon: 'ph-cloud-lightning', nightIcon: 'ph-cloud-lightning' },
    99: { label: 'Thunderstorm with heavy hail', icon: 'ph-cloud-lightning', nightIcon: 'ph-cloud-lightning' }
};

function updateClock() {
    const now = new Date();
    // Format: Fri, Oct 27 • 10:30 AM
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit' };
    
    const dateStr = now.toLocaleDateString('en-US', dateOptions);
    const timeStr = now.toLocaleTimeString('en-US', timeOptions);
    
    UI.datetime.textContent = `${dateStr} • ${timeStr}`;
}

async function getLocation() {
    try {
        // Try IP-based location first
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Location service unavailable');
        const data = await response.json();
        return {
            lat: data.latitude,
            lon: data.longitude,
            city: data.city,
            country: data.country_name
        };
    } catch (error) {
        console.warn('Geolocation failed, falling back to London:', error);
        // Fallback to London
        return {
            lat: 51.5074,
            lon: -0.1278,
            city: 'London',
            country: 'United Kingdom'
        };
    }
}

async function fetchWeather() {
    try {
        const location = await getLocation();
        UI.location.textContent = `${location.city}, ${location.country}`;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data unavailable');
        const data = await response.json();
        const current = data.current;

        // Update UI
        UI.temp.textContent = Math.round(current.temperature_2m);
        UI.humidity.textContent = `${current.relative_humidity_2m}%`;
        UI.wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
        UI.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;

        // Weather Code & Icon
        const code = current.weather_code;
        const isDay = current.is_day === 1;
        const weatherInfo = weatherCodes[code] || { label: 'Unknown', icon: 'ph-question', nightIcon: 'ph-question' };
        
        UI.condition.textContent = weatherInfo.label;
        
        // Update icon class
        UI.icon.className = `ph ${isDay ? weatherInfo.icon : weatherInfo.nightIcon}`;

    } catch (error) {
        console.error('Error fetching weather:', error);
        UI.condition.textContent = 'Error loading data';
        UI.location.textContent = 'Check Connection';
    }
}

// Initial Load
updateClock();
fetchWeather();

// Refresh clock every second
setInterval(updateClock, 1000);

// Refresh weather every 15 minutes
setInterval(fetchWeather, 15 * 60 * 1000);
