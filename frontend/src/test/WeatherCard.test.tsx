import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import WeatherCard from '../components/TodaysForecast';
import { WeatherData } from '../types/weather';

const mockWeather: WeatherData = {
  city: 'Tokyo',
  country: 'JP',
  condition: 'Clouds',
  description: 'broken clouds',
  temp: 23,
  feelsLike: 21,
  tempMin: 20.5,
  tempMax: 25.2,
  humidity: 65,
  wind: 4,
  timezone: 32400,
  sunrise: 1700000000,
  sunset: 1700040000,
};

describe('WeatherCard', () => {
  it('renders description', () => {
    render(<WeatherCard weather={mockWeather} unit="C" showForecast={false} onToggleForecast={vi.fn()} />);
    expect(screen.getByText('broken clouds')).toBeInTheDocument();
  });

  it('renders wind speed', () => {
    render(<WeatherCard weather={mockWeather} unit="C" showForecast={false} onToggleForecast={vi.fn()} />);
    expect(screen.getByText('Wind')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('displays temperature in Celsius', () => {
    render(<WeatherCard weather={mockWeather} unit="C" showForecast={false} onToggleForecast={vi.fn()} />);
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('displays temperature converted to Fahrenheit', () => {
    render(<WeatherCard weather={mockWeather} unit="F" showForecast={false} onToggleForecast={vi.fn()} />);
    expect(screen.getByText('73')).toBeInTheDocument();
    expect(screen.getByText('°F')).toBeInTheDocument();
  });

  it('shows 5-Day Forecast button', () => {
    render(<WeatherCard weather={mockWeather} unit="C" showForecast={false} onToggleForecast={vi.fn()} />);
    expect(screen.getByRole('button', { name: /5-Day Forecast/i })).toBeInTheDocument();
  });

  it('calls onToggleForecast when button is clicked', async () => {
    const onToggle = vi.fn();
    render(<WeatherCard weather={mockWeather} unit="C" showForecast={false} onToggleForecast={onToggle} />);
    await userEvent.click(screen.getByRole('button', { name: /5-Day Forecast/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
