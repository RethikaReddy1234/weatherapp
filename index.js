let unit = 'metric';
let chart;

function setUnit(selectedUnit) {
  unit = selectedUnit;
  const city = document.getElementById('cityInput').value;
  if (city) getWeather();
}

function setTheme(mode) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(mode);
}

window.onload = () => {
  setTheme('light');
};

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  const apiKey = 'e88b2100e628be7b938048fabbbed4d9';
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = getDailyForecasts(data.list);
    const currentTemp = data.list[0].main.temp;
    updateCards(daily);
    updateChart(daily, currentTemp);
    updateCurrentTemperatureDisplay(currentTemp);
    updateBackgroundVideo(currentTemp);
  } catch (err) {
    alert('Failed to fetch weather data. Please check the city name and API key.');
    console.error(err);
  }
}

function getDailyForecasts(dataList) {
  const days = {};
  for (let entry of dataList) {
    const date = entry.dt_txt.split(' ')[0];
    if (!days[date]) {
      days[date] = entry;
    }
  }
  return Object.values(days).slice(0, 5);
}

function updateCards(days) {
  const forecastCards = document.getElementById('forecastCards');
  forecastCards.innerHTML = '';
  days.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString();
    const temp = Math.round(day.main.temp);
    const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    forecastCards.innerHTML += `
      <div class="card">
        <h3>${date}</h3>
        <img src="${icon}" alt="${day.weather[0].description}" />
        <p>${temp}° ${unit === 'metric' ? 'C' : 'F'}</p>
      </div>
    `;
  });
}

function updateChart(days, currentTemp) {
  const labels = days.map(day => {
    const date = new Date(day.dt_txt);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const temps = days.map(day => day.main.temp);
  const ctx = document.getElementById('weatherChart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Temperature (°${unit === 'metric' ? 'C' : 'F'})`,
        data: temps,
        backgroundColor: 'skyblue', 
        borderColor: 'skyblue',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          title: {
            display: true,
            text: `Temperature (°${unit === 'metric' ? 'C' : 'F'})`,
            color: document.body.classList.contains('dark') ? '#fff' : '#000'
          },
          ticks: {
            color: document.body.classList.contains('dark') ? '#fff' : '#000'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Weekday',
            color: document.body.classList.contains('dark') ? '#fff' : '#000'
          },
          ticks: {
            color: document.body.classList.contains('dark') ? '#fff' : '#000'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: document.body.classList.contains('dark') ? '#fff' : '#000'
          }
        }
      }
    }
  });
}

function updateCurrentTemperatureDisplay(currentTemp) {
  const currentTempDisplay = document.getElementById('currentTempDisplay');
  const tempIcon = `https://openweathermap.org/img/wn/${getCurrentWeatherIcon()}@2x.png`;
  currentTempDisplay.innerHTML = `
    <div class="current-temp-info">
      <h2>Current Temperature</h2>
      <img src="${tempIcon}" alt="Weather Icon" />
      <p>${Math.round(currentTemp)}° ${unit === 'metric' ? 'C' : 'F'}</p>
    </div>
  `;
}

function getCurrentWeatherIcon() {
  return '10d'; 
}

function updateBackgroundVideo(currentTemp) {
  const videoElement = document.getElementById('backgroundVideo');
  if (currentTemp > 35) {
    videoElement.src = 'video3.mp4'; 
  } else {
    videoElement.src = 'rainy1.mp4';
  }
}
