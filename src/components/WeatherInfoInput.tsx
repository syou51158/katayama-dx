import type { WeatherType } from '../types/constructionTypes';

// 天候オプション定義
const WEATHER_OPTIONS: { value: WeatherType; label: string; icon: string }[] = [
  { value: 'sunny', label: '晴れ', icon: '☀️' },
  { value: 'cloudy', label: '曇り', icon: '☁️' },
  { value: 'rainy', label: '雨', icon: '🌧️' },
  { value: 'snowy', label: '雪', icon: '❄️' },
  { value: 'foggy', label: '霧', icon: '🌫️' },
  { value: 'windy', label: '風', icon: '💨' },
  { value: 'stormy', label: '嵐', icon: '⛈️' },
  { value: 'other', label: 'その他', icon: '🌡️' },
];

// 風向きオプション
const WIND_DIRECTIONS = [
  { value: 'N', label: '北' },
  { value: 'NE', label: '北東' },
  { value: 'E', label: '東' },
  { value: 'SE', label: '南東' },
  { value: 'S', label: '南' },
  { value: 'SW', label: '南西' },
  { value: 'W', label: '西' },
  { value: 'NW', label: '北西' },
  { value: '', label: '無風/不明' },
];

// コンポーネントのProps
interface WeatherInfoInputProps {
  weatherType: WeatherType;
  weather: string;
  temperature: string | number;
  humidity: string | number;
  windSpeed: string | number;
  windDirection: string;
  onWeatherTypeChange: (value: WeatherType) => void;
  onWeatherChange: (value: string) => void;
  onTemperatureChange: (value: string) => void;
  onHumidityChange: (value: string) => void;
  onWindSpeedChange: (value: string) => void;
  onWindDirectionChange: (value: string) => void;
}

const WeatherInfoInput: React.FC<WeatherInfoInputProps> = ({
  weatherType,
  weather,
  temperature,
  humidity,
  windSpeed,
  windDirection,
  onWeatherTypeChange,
  onWeatherChange,
  onTemperatureChange,
  onHumidityChange,
  onWindSpeedChange,
  onWindDirectionChange,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">天候情報</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 天候タイプ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            天候タイプ
          </label>
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onWeatherTypeChange(option.value);
                  // 天候タイプが変更されたら天候詳細も自動更新
                  if (weather === '' || 
                      WEATHER_OPTIONS.find(o => o.value === weatherType)?.label === weather) {
                    onWeatherChange(option.label);
                  }
                }}
                className={`inline-flex items-center px-3 py-2 border rounded-md ${
                  weatherType === option.value
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 天候詳細 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            天候詳細
          </label>
          <input
            type="text"
            value={weather}
            onChange={(e) => onWeatherChange(e.target.value)}
            placeholder="例: 晴れ時々曇り、にわか雨"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 気温 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            気温 (°C)
          </label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => onTemperatureChange(e.target.value)}
            placeholder="例: 25.5"
            step="0.1"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 湿度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            湿度 (%)
          </label>
          <input
            type="number"
            value={humidity}
            onChange={(e) => onHumidityChange(e.target.value)}
            placeholder="例: 60"
            min="0"
            max="100"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 風速 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            風速 (m/s)
          </label>
          <input
            type="number"
            value={windSpeed}
            onChange={(e) => onWindSpeedChange(e.target.value)}
            placeholder="例: 3.5"
            step="0.1"
            min="0"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 風向き */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            風向き
          </label>
          <div className="flex flex-wrap gap-2">
            {WIND_DIRECTIONS.map((direction) => (
              <button
                key={direction.value}
                type="button"
                onClick={() => onWindDirectionChange(direction.value)}
                className={`inline-flex items-center px-3 py-2 border rounded-md ${
                  windDirection === direction.value
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {direction.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 天候に応じたワーニング表示 */}
      {(weatherType === 'rainy' || weatherType === 'snowy' || weatherType === 'stormy') && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">注意事項</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {weatherType === 'rainy' && '雨天時は滑りやすくなっています。足元にご注意ください。'}
                  {weatherType === 'snowy' && '積雪・凍結に注意してください。防寒対策と転倒防止が必要です。'}
                  {weatherType === 'stormy' && '悪天候のため、作業の中断や安全確保を最優先してください。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherInfoInput; 