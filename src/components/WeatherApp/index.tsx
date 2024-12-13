import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import styles from './index.module.less';

const YOU_API_KEY = 'f4efab1249b3ea1c3c089c51595d9608';
const YOU_LOCATION = 'Beijing';

const WeatherApp = (props: any) => {
    const { style, ...rest } = props;
    const [weatherData, setWeatherData] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    const fetchWeather = async () => {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${YOU_LOCATION}&appid=${YOU_API_KEY}&units=metric`);
            setWeatherData(response.data);
        } catch (err) {
            setError(err);
        }
    };
    // 初始化天气
    useEffect(() => {
        fetchWeather();
    }, []);
    // 如果接口报错返回
    if (error) {
        return <div>Error: {error.message}</div>;
    };
    // 接口pendding
    if (!weatherData) {
        return <div>Loading...</div>;
    };
    console.log(weatherData);

    return <div className={`flex-box ${styles.weatherBox}`} style={{
        // backgroundImage: `url(http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png)`,
        ...style
    }} {...rest}>
        <img src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`} alt="" />
        <div className="weather-speed">风速: {weatherData.wind.speed} m/s</div>

    </div>

    // <div>
    // {/* <p>Weather in {weatherData.name}</p>
    // <p>Temperature: {weatherData.main.temp}°C</p>
    // <p>Weather: {weatherData.weather[0].description}</p>
    // <p>Humidity: {weatherData.main.humidity}%</p>
    // <p>Wind Speed: {weatherData.wind.speed} m/s</p> */}

    // </div>;
}

export default memo(WeatherApp);