const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const weatherTableBody = document.getElementById('weather-table-body'); // Weather table body
const chatOutput = document.getElementById('chat-output'); // Chatbot output
const chatInput = document.getElementById('chat-input'); // Chatbot input
const chatSubmitBtn = document.getElementById('chat-submit-btn'); // Chatbot submit button
const unitToggle = document.getElementById('unit-toggle'); // Toggle button for units
const loadingSpinner = document.getElementById('loading-spinner'); // Loading spinner

let useCelsius = true; // Default unit
let forecastData = []; // Store forecast data for filtering

// Function to toggle units
unitToggle.addEventListener('click', () => {
    useCelsius = !useCelsius; // Toggle the unit
    updateTemperatureDisplay(); // Update the display
});

// Function to fetch weather data
function fetchWeatherData(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    loadingSpinner.style.display = 'block'; // Show loading spinner

    Promise.all([fetch(weatherUrl), fetch(forecastUrl)])
        .then(responses => {
            if (!responses[0].ok || !responses[1].ok) {
                throw new Error('Error fetching data');
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(([weatherData, forecast]) => {
            displayWeatherData(weatherData);
            forecastData = forecast.list; // Store forecast data
            displayWeatherTable(forecast); // Populate the weather table
            displayForecastChart(forecast);
            loadingSpinner.style.display = 'none'; // Hide loading spinner
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            loadingSpinner.style.display = 'none'; // Hide loading spinner
        });
}

// Function to display the weather data
function displayWeatherData(data) {
    const cityName = document.getElementById('cityName');
    const temperature = document.getElementById('temperature');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const weatherDesc = document.getElementById('weatherDesc');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherInfoSection = document.querySelector('.weather-info');

    cityName.textContent = data.name;
    temperature.textContent = `Temperature: ${data.main.temp} °C`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} km/h`;
    weatherDesc.textContent = `Weather: ${data.weather[0].description}`;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    // Background based on weather condition
    const condition = data.weather[0].main;
    const backgroundImage = backgroundStyles[condition] || "url('path/to/default-image.jpg')";
    weatherInfoSection.style.backgroundImage = backgroundImage;
    weatherInfoSection.style.backgroundSize = 'cover';
    weatherInfoSection.style.backgroundPosition = 'center';
}

// Function to display the weather table
function displayWeatherTable(data) {
    weatherTableBody.innerHTML = ''; // Clear existing rows
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt_txt).toLocaleDateString();
        const temperature = forecast.main.temp;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${temperature} °C</td>
            <td>${forecast.weather[0].description}</td>
        `;
        weatherTableBody.appendChild(row);
    }
}

// Chatbot functionality
chatSubmitBtn.addEventListener('click', () => {
    const userQuestion = chatInput.value.trim();
    chatInput.value = ''; // Clear input

    // Process the user question
    if (userQuestion) {
        handleChatbotQuery(userQuestion);
    }
});

function handleChatbotQuery(question) {
    const lowerCaseQuestion = question.toLowerCase();
    
    if (lowerCaseQuestion.includes("highest temperature")) {
        const highestTemp = Math.max(...forecastData.map(f => f.main.temp));
        chatOutput.innerHTML = `The highest temperature this week is ${highestTemp} °C.`;
    } else if (lowerCaseQuestion.includes("lowest temperature")) {
        const lowestTemp = Math.min(...forecastData.map(f => f.main.temp));
        chatOutput.innerHTML = `The lowest temperature this week is ${lowestTemp} °C.`;
    } else if (lowerCaseQuestion.includes("average temperature")) {
        const averageTemp = forecastData.reduce((acc, f) => acc + f.main.temp, 0) / forecastData.length;
        chatOutput.innerHTML = `The average temperature this week is ${averageTemp.toFixed(2)} °C.`;
    } else {
        chatOutput.innerHTML = "I'm sorry, I don't understand the question.";
    }
}

// Function to update temperature display based on the unit toggle
function updateTemperatureDisplay() {
    const temperatures = Array.from(weatherTableBody.querySelectorAll('td:nth-child(2)'));
    temperatures.forEach(tempCell => {
        let tempValue = parseFloat(tempCell.textContent);
        if (!useCelsius) {
            tempValue = (tempValue * 9/5) + 32; // Convert to Fahrenheit
            tempCell.textContent = `${tempValue.toFixed(2)} °F`;
        } else {
            tempCell.textContent = `${tempValue} °C`; // Convert back to Celsius
        }
    });
}

// Function for geolocation support
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherDataByCoords(lat, lon); // Fetch weather by coordinates
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Function to fetch weather data by coordinates
function fetchWeatherDataByCoords(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    loadingSpinner.style.display = 'block'; // Show loading spinner

    Promise.all([fetch(weatherUrl), fetch(forecastUrl)])
        .then(responses => {
            if (!responses[0].ok || !responses[1].ok) {
                throw new Error('Error fetching data');
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(([weatherData, forecast]) => {
            displayWeatherData(weatherData);
            forecastData = forecast.list; // Store forecast data
            displayWeatherTable(forecast); // Populate the weather table
            loadingSpinner.style.display = 'none'; // Hide loading spinner
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            loadingSpinner.style.display = 'none'; // Hide loading spinner
        });
}

// Automatically get user location on page load
window.onload = getLocation;
