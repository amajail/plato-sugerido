import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiDayCloudyHigh,
  WiFog,
  WiDayRain
} from 'react-icons/wi';

const WeatherIcon = ({ condition, size = 80 }) => {
  const getIcon = () => {
    switch (condition?.toLowerCase()) {
      case 'clear':
        return <WiDaySunny size={size} />;
      case 'clouds':
        return <WiCloudy size={size} />;
      case 'rain':
        return <WiRain size={size} />;
      case 'drizzle':
        return <WiDayRain size={size} />;
      case 'snow':
        return <WiSnow size={size} />;
      case 'thunderstorm':
        return <WiThunderstorm size={size} />;
      case 'mist':
      case 'fog':
      case 'haze':
        return <WiFog size={size} />;
      default:
        return <WiDayCloudyHigh size={size} />;
    }
  };

  return (
    <div className="weather-icon" style={{ color: 'var(--primary-color)' }}>
      {getIcon()}
    </div>
  );
};

export default WeatherIcon;
