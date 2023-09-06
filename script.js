const API_KEY = "8f8510b8a38056361963b2331a06daa2";
const yourWeatherRender = document.querySelector("#yourWeatherRender");
const nameRender = document.querySelector("#nameRender");
const feelsLikeRender = document.querySelector("#feelsLikeRender");
const currentTempRender = document.querySelector("#currentTempRender");
const maxTempRender = document.querySelector("#maxTempRender");
const minTempRender = document.querySelector("#minTempRender");
const windSpeedRender = document.querySelector("#windSpeedRender");
const flagRender = document.querySelector("#flagRender");
const visibilityRender = document.querySelector("#visibilityRender");
const humidityRender = document.querySelector("#humidityRender");
const weatherDesc = document.querySelector("#weatherDesc");
const loading = document.querySelector("#loading");
const loading2 = document.querySelector("#loading2");
const chart = document.querySelector("#chart");
const searchForm = document.querySelector("#searchForm");
const searchCity = document.querySelector("#searchCity");
const mainImage = document.querySelector("#mainImage");

//Your Weather Functions
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showposition);
    }
    else {
        console.log("No Location Support in this browser");
    }
}

function showposition(position) {
    let lat = position.coords.latitude;
    let long = position.coords.longitude;
    getWeatherInfoByCoords(lat, long);
}

async function getWeatherInfoByCoords(lat, long) {
    try {
        //using Open Weather Map API to find location name and 'feels like'
        let weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_KEY}&units=metric`);

        // using Open Meteo API because the current, max and min temp in OWM are the same
        // other values are incorrect in OWM as well so only use it for feelsLike and location name
        let openMeteoResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=Asia%2FTokyo&forecast_days=7&current_weather=true&hourly=temperature_2m`);
        let openMeteoOutput = await openMeteoResponse.json();

        let weatherOutput = await weatherResponse.json();
        renderWeatherOutput(weatherOutput, openMeteoOutput);
    }
    catch (e) {
        alert("An error has occured. Please check the console.");
        console.log(e);
    }
}

function renderWeatherOutput(weatherOutput, openMeteoOutput) {
    renderWeekForecast(weatherOutput, openMeteoOutput);
    console.log(weatherOutput);
    console.log(openMeteoOutput);
    loading.style.scale = 0;
    loading2.style.scale = 0;
    let weatherCode = openMeteoOutput.current_weather.weathercode;
    let weatherCondition = getWeatherCondition(weatherCode.toString());
    let cityName = weatherOutput.name;
    let currentTemp = openMeteoOutput.current_weather.temperature;
    let windSpeed = openMeteoOutput.current_weather.windspeed;
    let feelsLike = weatherOutput.main.feels_like;
    let countryCode = weatherOutput.sys.country;
    let visibility = (weatherOutput.visibility) / 1000;
    let humidity = weatherOutput.main.humidity;
    let mainImageSrc = getWeatherIcons(weatherCode.toString());
    nameRender.textContent = cityName;
    currentTempRender.textContent = currentTemp + '°C';
    weatherDesc.textContent = weatherCondition;
    feelsLikeRender.textContent = feelsLike + '°C';
    windSpeedRender.textContent = windSpeed + ' km/h';
    visibilityRender.textContent = visibility + ' km';
    humidityRender.textContent = humidity + '%';
    mainImage.src = mainImageSrc;
    try {
        flagRender.src = `https://flagcdn.com/32x24/${countryCode.toLowerCase()}.png`;
    }
    catch (e) {
        alert("Could not find flag icon for this location.");
        flagRender.src = "";
    }
    plotGraph(openMeteoOutput);
}

function renderWeekForecast(weatherOutput, openMeteoOutput) {
    //getting dayarray
    dayArray = (openMeteoOutput.daily.time).map((element) => {
        date = new Date(element);
        return date.getDay();
    });
    //getting day strings
    dayArray = getDayString(dayArray);

    //rendering weekdays
    document.querySelector("#weekDayRender1").textContent = dayArray[0];
    document.querySelector("#weekDayRender2").textContent = dayArray[1];
    document.querySelector("#weekDayRender3").textContent = dayArray[2];
    document.querySelector("#weekDayRender4").textContent = dayArray[3];
    document.querySelector("#weekDayRender5").textContent = dayArray[4];
    document.querySelector("#weekDayRender6").textContent = dayArray[5];
    document.querySelector("#weekDayRender7").textContent = dayArray[6];

    //rendering dates
    document.querySelector("#weekDateRender1").textContent = openMeteoOutput.daily.time[0];
    document.querySelector("#weekDateRender2").textContent = openMeteoOutput.daily.time[1];
    document.querySelector("#weekDateRender3").textContent = openMeteoOutput.daily.time[2];
    document.querySelector("#weekDateRender4").textContent = openMeteoOutput.daily.time[3];
    document.querySelector("#weekDateRender5").textContent = openMeteoOutput.daily.time[4];
    document.querySelector("#weekDateRender6").textContent = openMeteoOutput.daily.time[5];
    document.querySelector("#weekDateRender7").textContent = openMeteoOutput.daily.time[6];

    //rendering maxtemps
    document.querySelector("#weekMaxRender1").textContent = openMeteoOutput.daily.temperature_2m_max[0];
    document.querySelector("#weekMaxRender2").textContent = openMeteoOutput.daily.temperature_2m_max[1];
    document.querySelector("#weekMaxRender3").textContent = openMeteoOutput.daily.temperature_2m_max[2];
    document.querySelector("#weekMaxRender4").textContent = openMeteoOutput.daily.temperature_2m_max[3];
    document.querySelector("#weekMaxRender5").textContent = openMeteoOutput.daily.temperature_2m_max[4];
    document.querySelector("#weekMaxRender6").textContent = openMeteoOutput.daily.temperature_2m_max[5];
    document.querySelector("#weekMaxRender7").textContent = openMeteoOutput.daily.temperature_2m_max[6];

    //rendering mintemps
    document.querySelector("#weekMinRender1").textContent = openMeteoOutput.daily.temperature_2m_min[0];
    document.querySelector("#weekMinRender2").textContent = openMeteoOutput.daily.temperature_2m_min[1];
    document.querySelector("#weekMinRender3").textContent = openMeteoOutput.daily.temperature_2m_min[2];
    document.querySelector("#weekMinRender4").textContent = openMeteoOutput.daily.temperature_2m_min[3];
    document.querySelector("#weekMinRender5").textContent = openMeteoOutput.daily.temperature_2m_min[4];
    document.querySelector("#weekMinRender6").textContent = openMeteoOutput.daily.temperature_2m_min[5];
    document.querySelector("#weekMinRender7").textContent = openMeteoOutput.daily.temperature_2m_min[6];

    //rendering cloud icons
    let weatherCode = openMeteoOutput.daily.weathercode;
    document.querySelector("#weekImage1").src = getWeatherIcons(weatherCode[0].toString());
    document.querySelector("#weekImage2").src = getWeatherIcons(weatherCode[1].toString());
    document.querySelector("#weekImage3").src = getWeatherIcons(weatherCode[2].toString());
    document.querySelector("#weekImage4").src = getWeatherIcons(weatherCode[3].toString());
    document.querySelector("#weekImage5").src = getWeatherIcons(weatherCode[4].toString());
    document.querySelector("#weekImage6").src = getWeatherIcons(weatherCode[5].toString());
    document.querySelector("#weekImage7").src = getWeatherIcons(weatherCode[6].toString());
}

function getDayString(dayArray) {
    const dayOfWeekMapping = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
    };
    dayArray = dayArray.map((date) => {
        return dayOfWeekMapping[date];
    });
    return dayArray;
}

//WMO codes
function getWeatherCondition(weatherCode) {
    let wmoCodes = {
        "0": "Clear sky",
        "1": "Mainly clear",
        "2": "Partly cloudy",
        "3": "Overcast",
        "45": "Fog",
        "48": "Fog",
        "51": "Drizzle, Light intensity",
        "53": "Drizzle, Moderate intensity",
        "55": "Drizzle, Dense intensity",
        "56": "Freezing Drizzle, Light intensity",
        "57": "Freezing Drizzle, Dense intensity",
        "61": "Rain, Slight intensity",
        "63": "Rain, Moderate intensity",
        "65": "Rain, Heavy intensity",
        "66": "Freezing Rain, Light intensity",
        "67": "Freezing Rain, Heavy intensity",
        "71": "Snow fall, Slight intensity",
        "73": "Snow fall, Moderate intensity",
        "75": "Snow fall, Heavy intensity",
        "77": "Snow grains",
        "80": "Rain showers, Slight intensity",
        "81": "Rain showers, Moderate intensity",
        "82": "Rain showers, Violent intensity",
        "85": "Snow showers, Slight intensity",
        "86": "Snow showers, Heavy intensity",
        "95": "Thunderstorm, Slight or moderate",
        "96": "Thunderstorm with slight hail",
        "99": "Thunderstorm with heavy hail"
    };
    return wmoCodes[weatherCode];
}

//WMO icons
function getWeatherIcons(weatherCode) {
    let wmoCodes = {
        "0": "https://img.icons8.com/?size=256&id=8EUmYhfLPTCF&format=png",
        "1": "https://img.icons8.com/?size=256&id=8EUmYhfLPTCF&format=png",
        "2": "https://img.icons8.com/?size=256&id=qA3w9Yp2vY7r&format=png",
        "3": "https://img.icons8.com/?size=256&id=zIVmoh4T8wh7&format=png",
        "45": "https://img.icons8.com/?size=256&id=IL2szZWdo0Bo&format=png",
        "48": "https://img.icons8.com/?size=256&id=IL2szZWdo0Bo&format=png",
        "51": "https://img.icons8.com/?size=256&id=QZJFPE7TNi5Q&format=png",
        "53": "https://img.icons8.com/?size=256&id=QZJFPE7TNi5Q&format=png",
        "55": "https://img.icons8.com/?size=256&id=kKxyuLXD4w0n&format=png",
        "56": "https://img.icons8.com/?size=256&id=fyJ8mNcBHced&format=png",
        "57": "https://img.icons8.com/?size=256&id=fyJ8mNcBHced&format=png",
        "61": "https://img.icons8.com/?size=256&id=PIXtKMDAXCzo&format=png",
        "63": "https://img.icons8.com/?size=256&id=HWPdQMFoVy95&format=png",
        "65": "https://img.icons8.com/?size=256&id=uzabNvAfhNNr&format=png",
        "66": "https://img.icons8.com/?size=256&id=fyJ8mNcBHced&format=png",
        "67": "https://img.icons8.com/?size=256&id=fyJ8mNcBHced&format=png",
        "71": "https://img.icons8.com/?size=256&id=JBQOSn7KOSuD&format=png",
        "73": "https://img.icons8.com/?size=256&id=cyZConbteZk9&format=png",
        "75": "https://img.icons8.com/?size=256&id=cyZConbteZk9&format=png",
        "77": "https://img.icons8.com/?size=256&id=jws4rTJ5EmwZ&format=png",
        "80": "https://img.icons8.com/?size=256&id=7Dcax1eBasEf&format=png",
        "81": "https://img.icons8.com/?size=256&id=7Dcax1eBasEf&format=png",
        "82": "https://img.icons8.com/?size=256&id=7Dcax1eBasEf&format=png",
        "85": "https://img.icons8.com/?size=256&id=Mi2BdbZQWNYQ&format=png",
        "86": "https://img.icons8.com/?size=256&id=Mi2BdbZQWNYQ&format=png",
        "95": "https://img.icons8.com/?size=256&id=6AAyqKfBlzoB&format=png",
        "96": "https://img.icons8.com/?size=256&id=6AAyqKfBlzoB&format=png",
        "99": "https://img.icons8.com/?size=256&id=6AAyqKfBlzoB&format=png"
    };
    return wmoCodes[weatherCode];
}

function plotGraph(openMeteoOutput) {
    let outputDateArray = openMeteoOutput.hourly.time;
    let dateArray = convertIntoDate(outputDateArray);

    //converting from JST to IST
    dateArray = convertToIST(dateArray);

    //trimming the array as per current time
    let trimDateArray = trimArray(dateArray);

    //finding index to trim the dataset while plotting
    let index = dateArray.indexOf(trimDateArray[0]);

    //stringfying the trimmed data array
    trimDateArray = stringifyDate(trimDateArray);

    let dataSet = (openMeteoOutput.hourly.temperature_2m).slice(index, index + 24);
    let dataLabel = trimDateArray.slice(0, 24);

    //check if chart already exists
    let chartStatus = Chart.getChart("chart");
    if (chartStatus != undefined) {
        chartStatus.destroy(); //destroy existing chart to free the canvas
    }

    let graph = new Chart(chart, {
        type: 'line',
        data: {
            labels: dataLabel,
            datasets: [
                {
                    label: 'Hourly Temperature (IST)',
                    data: dataSet,
                    borderColor: 'yellow',
                    backgroundColor: 'rgba(255, 204, 0,0.5)',
                    fill: true
                }
            ],
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    });
}

function convertIntoDate(outputDateArray) {
    let convert = [];
    for (let element of outputDateArray) {
        let tempDate = new Date(element);
        convert.push(tempDate);
    }
    return convert;
}

function convertToIST(dateArray) {
    // Time difference between JST and IST (3 hours and 30 minutes)
    let hourDiff = 3;
    let minDiff = 30;

    dateArray = dateArray.map((dateJST) => {
        let istDate = new Date(dateJST);
        istDate.setHours(dateJST.getHours() - hourDiff);
        istDate.setMinutes(dateJST.getMinutes() - minDiff);

        return istDate;
    });
    return dateArray;
}

function trimArray(dateArray) {
    let currentDate = new Date();
    let trimDateArray = dateArray.filter((date) => {
        return date >= currentDate;
    });

    return trimDateArray;
}

function stringifyDate(trimDateArray) {
    trimDateArray = trimDateArray.map((date) => {
        return date.toLocaleString();
    });
    return trimDateArray;
}

//search Weather functions
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('form submit');
    if (searchCity.value == "") {
        window.location.reload();
    }
    else {
        loading.style.scale = 1;
        loading2.style.scale = 1;
        getCoords(searchCity.value);
    }
});

async function getCoords(city) {
    try {
        let geoRespone = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`)
        let geoOutput = await geoRespone.json();
        let lat = geoOutput.results[0].latitude;
        let long = geoOutput.results[0].longitude;
        getWeatherInfoByCoords(lat, long);
    }
    catch (e) {
        alert("Could not find data for this location.");
        console.log(e);
        getUserLocation();
    }
}