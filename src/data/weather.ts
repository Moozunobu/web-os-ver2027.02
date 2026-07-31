export interface WeatherInfo {
  temp: string;
  conditionJa: string;
  conditionEn: string;
  iconType: 'sun' | 'cloud-sun' | 'rain' | 'cloud';
  highLow: string;
  humidity: string;
  wind: string;
}

export const WEATHER_DATA: Record<string, WeatherInfo> = {
  Tokyo: { temp: '22°C', conditionJa: '晴れ', conditionEn: 'Sunny', iconType: 'sun', highLow: '24° / 16°', humidity: '48%', wind: '3.2 m/s' },
  Osaka: { temp: '24°C', conditionJa: '晴れ時々曇り', conditionEn: 'Partly Cloudy', iconType: 'cloud-sun', highLow: '26° / 18°', humidity: '52%', wind: '2.8 m/s' },
  Nagoya: { temp: '23°C', conditionJa: '快晴', conditionEn: 'Clear', iconType: 'sun', highLow: '25° / 17°', humidity: '42%', wind: '3.0 m/s' },
  Fukuoka: { temp: '25°C', conditionJa: '雨', conditionEn: 'Rain', iconType: 'rain', highLow: '26° / 20°', humidity: '78%', wind: '4.5 m/s' },
  Sapporo: { temp: '16°C', conditionJa: '曇り', conditionEn: 'Cloudy', iconType: 'cloud', highLow: '18° / 12°', humidity: '62%', wind: '3.8 m/s' },
  'New York': { temp: '19°C', conditionJa: '快晴', conditionEn: 'Clear', iconType: 'sun', highLow: '21° / 14°', humidity: '50%', wind: '4.0 m/s' },
  London: { temp: '15°C', conditionJa: '小雨', conditionEn: 'Light Rain', iconType: 'rain', highLow: '17° / 11°', humidity: '82%', wind: '5.1 m/s' },
  Paris: { temp: '18°C', conditionJa: '晴れ', conditionEn: 'Mild', iconType: 'cloud-sun', highLow: '20° / 13°', humidity: '55%', wind: '3.5 m/s' },
};
