// Element references
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const weatherDesc = document.getElementById('weatherDesc');
const weatherIcon = document.getElementById('weatherIcon');
const weatherInfoSection = document.querySelector('.weather-info');
const weatherTableBody = document.getElementById('weather-table-body');

// OpenWeather API key
const apiKey = '93f260bafcaa2da616ed23d3889f8d27';

// Background images for weather conditions
const backgroundStyles = {
    "Clear": "url('https://cdn.pixabay.com/photo/2019/10/14/16/03/sky-4556591_960_720.jpg')",
    "Clouds": "url('https://cdn.pixabay.com/photo/2016/12/20/12/33/clouds-1915011_960_720.jpg')",
    "Rain": "url('https://cdn.pixabay.com/photo/2020/01/16/20/39/rain-4772062_960_720.jpg')",
    "Drizzle": "url('https://cdn.pixabay.com/photo/2016/11/18/16/08/drizzle-1838539_960_720.jpg')",
    "Thunderstorm": "url('https://cdn.pixabay.com/photo/2015/03/26/09/44/storm-690134_960_720.jpg')",
    "Snow": "url('https://cdn.pixabay.com/photo/2014/12/15/13/40/snowfall-569202_960_720.jpg')",
    "Default": "url('https://cdn.pixabay.com/photo/2022/01/05/15/42/sky-6917375_960_720.jpg')"
};

let forecastData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Navigation Elements
const navDashboard = document.getElementById('nav-dashboard');
const navForecast = document.getElementById('nav-forecast');
const navCharts = document.getElementById('nav-charts');
const dashboardSection = document.getElementById('dashboard');
const forecastSection = document.getElementById('forecast');
const chartsSection = document.getElementById('charts');

// Function to switch views
function switchView(targetSection) {
    // Hide all sections
    dashboardSection.classList.add('hidden');
    forecastSection.classList.add('hidden');
    chartsSection.classList.add('hidden');

    // Show the target section
    targetSection.classList.remove('hidden');
}

// Add click event listeners to navigation
navDashboard.addEventListener('click', () => switchView(dashboardSection));
navForecast.addEventListener('click', () => switchView(forecastSection));
navCharts.addEventListener('click', () => switchView(chartsSection));

// Fetch and display weather data
function fetchWeatherData(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    Promise.all([fetch(weatherUrl), fetch(forecastUrl)])
        .then(responses => {
            if (!responses[0].ok || !responses[1].ok) {
                throw new Error('Error fetching data');
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(([weatherData, forecastData]) => {
            displayWeatherData(weatherData);
            displayForecastTable(forecastData);
            displayForecastChart(forecastData);
            displayDoughnutChart(forecastData);
            displayLineChart(forecastData);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
}

// Display current weather data
function displayWeatherData(data) {
    cityName.textContent = data.name;
    temperature.textContent = `Temperature: ${data.main.temp} °C`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} km/h`;
    weatherDesc.textContent = `Weather: ${data.weather[0].description}`;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    const condition = data.weather[0].main;
    const backgroundImage = backgroundStyles[condition] || backgroundStyles["Default"];
    weatherInfoSection.style.backgroundImage = backgroundImage;
    weatherInfoSection.style.backgroundSize = 'cover';
    weatherInfoSection.style.backgroundPosition = 'center';
}

// Display forecast table
function displayForecastTable(data) {
    forecastData = data.list.map(item => ({
        date: new Date(item.dt_txt).toLocaleDateString(),
        temperature: item.main.temp,
        condition: item.weather[0].description
    }));

    updateTable();
}

// Update table with pagination
function updateTable() {
    weatherTableBody.innerHTML = ''; // Clear table

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, forecastData.length);

    for (let i = startIndex; i < endIndex; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${forecastData[i].date}</td>
            <td>${forecastData[i].temperature} °C</td>
            <td>${forecastData[i].condition}</td>
        `;
        weatherTableBody.appendChild(row);
    }
}

// Event listener for fetching weather
document.getElementById('getWeatherBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        fetchWeatherData(city);
    } else {
        console.log("Please enter a city name.");
    }
});

// Chart.js functions for bar, doughnut, and line charts
let barChartInstance;
let doughnutChartInstance;
let lineChartInstance;

// Display Bar Chart
function displayForecastChart(data) {
    const labels = [];
    const temps = [];

    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt_txt).toLocaleDateString();
        labels.push(date);
        temps.push(forecast.main.temp);
    }

    const ctx = document.getElementById('barChart').getContext('2d');
    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            },
            responsive: true,
            maintainAspectRatio: true, // Maintain aspect ratio to avoid stretching
            animation: {
                duration: 2000,
                easing: 'easeOutBounce'
            }
        }
    });
}

// Display Doughnut Chart
function displayDoughnutChart(data) {
    const ctx = document.getElementById('doughnutChart').getContext('2d');
    if (doughnutChartInstance) doughnutChartInstance.destroy();

    const weatherConditions = data.list.map(item => item.weather[0].main);
    const conditionCounts = weatherConditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    doughnutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Maintain aspect ratio to avoid stretching
            animation: {
                duration: 2000,
                easing: 'easeOutBounce'
            }
        }
    });
}

// Display Line Chart
function displayLineChart(data) {
    const labels = [];
    const temps = [];

    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt_txt).toLocaleDateString();
        labels.push(date);
        temps.push(forecast.main.temp);
    }

    const ctx = document.getElementById('lineChart').getContext('2d');
    if (lineChartInstance) lineChartInstance.destroy();

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Maintain aspect ratio to avoid stretching
            scales: {
                y: { beginAtZero: true }
            },
            animation: {
                duration: 2000,
                onComplete: function() {
                    const ctx = this.chart.ctx;
                    ctx.save();
                    const meta = this.chart.getDatasetMeta(0);
                    meta.data.forEach((point, index) => {
                        ctx.fillStyle = this.chart.data.datasets[0].backgroundColor;
                        ctx.beginPath();
                        ctx.moveTo(point.x, this.chart.chartArea.bottom);
                        ctx.lineTo(point.x, point.y);
                        ctx.lineTo(point.x + 10, point.y);
                        ctx.closePath();
                        ctx.fill();
                    });
                    ctx.restore();
                }
            }
        }
    });
}

// Chatbot API Integration
const chatSubmitBtn = document.getElementById('chat-submit-btn');
const chatInput = document.getElementById('chat-input');
const chatOutput = document.getElementById('chat-output');
const apiKeyGemini = 'AIzaSyArWW7Yc_T6G5n2NRsBMAmMl3AG8nyrlbc'; // Replace with your Gemini API key

chatSubmitBtn.addEventListener('click', () => {
    const userQuery = chatInput.value.trim();
    if (userQuery) {
        appendMessage(userQuery, 'user');
        handleChatQuery(userQuery);
        chatInput.value = ''; // Clear input field
    }
});

function appendMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender);
    messageElement.textContent = message;
    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Handle user query based on intent (weather vs. non-weather)
function handleChatQuery(query) {
    // Check if the query is about weather using keywords and extract the city
    const weatherRegex = /\b(weather|forecast)\b/i;
    const cityRegex = /\b(in|at|for)\s+([a-zA-Z\s]+)\b/i;
    
    if (weatherRegex.test(query)) {
        const cityMatch = query.match(cityRegex);
        const city = cityMatch ? cityMatch[2].trim() : "London"; // Default to "London" if no city is mentioned

        appendMessage(`Fetching weather information for ${city}...`, "bot");
        
        // Fetch and display the weather data
        fetchWeatherData(city)
            .then(data => {
                if (data) {
                    const weatherMessage = `The weather in ${data.name} is ${data.weather[0].description} with a temperature of ${data.main.temp} °C, humidity of ${data.main.humidity}%, and wind speed of ${data.wind.speed} km/h.`;
                    appendMessage(weatherMessage, "bot");
                } else {
                    appendMessage("Sorry, I couldn't fetch the weather information.", "bot");
                }
            });
        
        return;
    }

    // Handle non-weather queries using Gemini API
    fetch('https://api.geminiapi.com/v1/assistant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyGemini}`
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
        const botMessage = data.answer || "Sorry, I didn't understand that.";
        appendMessage(botMessage, 'bot');
    })
    .catch(error => {
        console.error("Error with Gemini API:", error);
        appendMessage("An error occurred while processing your query.", 'bot');
    });
}
