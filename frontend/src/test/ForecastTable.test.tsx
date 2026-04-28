import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import ForecastTable from '../components/ForecastTable';
import { ForecastData } from '../types/weather';

const mockForecast: ForecastData = {
  city: 'Tokyo',
  country: 'JP',
  list: [
    { dt: 1, dtTxt: '2023-09-15 12:00:00', condition: 'Rain', description: 'light rain', temp: 24, tempMin: 24.05, tempMax: 24.85, wind: 3 },
    { dt: 2, dtTxt: '2023-09-15 15:00:00', condition: 'Rain', description: 'moderate rain', temp: 25, tempMin: 24.0, tempMax: 25.5, wind: 3 },
    { dt: 3, dtTxt: '2023-09-16 12:00:00', condition: 'Clouds', description: 'few clouds', temp: 0, tempMin: -1.0, tempMax: 1.0, wind: 2 },
    { dt: 4, dtTxt: '2023-09-16 15:00:00', condition: 'Clear', description: 'clear sky', temp: 26, tempMin: 25.0, tempMax: 27.0, wind: 1 },
  ],
};

describe('ForecastTable', () => {
  it('renders all column headers', () => {
    render(<ForecastTable forecast={mockForecast} unit="C" />);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Temp')).toBeInTheDocument();
    expect(screen.getByText('Min Temp')).toBeInTheDocument();
    expect(screen.getByText('Max Temp')).toBeInTheDocument();
    expect(screen.getByText('Wind')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders a tab for each day', () => {
    render(<ForecastTable forecast={mockForecast} unit="C" />);
    expect(screen.getByRole('tab', { name: '15 SEP' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '16 SEP' })).toBeInTheDocument();
  });

  it('shows the first day by default', () => {
    render(<ForecastTable forecast={mockForecast} unit="C" />);
    expect(screen.getByText('light rain')).toBeInTheDocument();
    expect(screen.getByText('moderate rain')).toBeInTheDocument();
    expect(screen.queryByText('few clouds')).not.toBeInTheDocument();
  });

  it('switches day when a tab is clicked', async () => {
    render(<ForecastTable forecast={mockForecast} unit="C" />);
    await userEvent.click(screen.getByRole('tab', { name: '16 SEP' }));
    expect(screen.getByText('few clouds')).toBeInTheDocument();
    expect(screen.queryByText('light rain')).not.toBeInTheDocument();
  });

  it('shows temperatures in Celsius', () => {
    render(<ForecastTable forecast={mockForecast} unit="C" />);
    expect(screen.getByText('24.05 °C')).toBeInTheDocument();
  });

  it('shows temperatures in Fahrenheit', () => {
    render(<ForecastTable forecast={mockForecast} unit="F" />);
    expect(screen.getAllByText(/°F/).length).toBeGreaterThan(0);
  });

  it('0°C shows as 32°F', async () => {
    render(<ForecastTable forecast={mockForecast} unit="F" />);
    await userEvent.click(screen.getByRole('tab', { name: '16 SEP' }));
    expect(screen.getByText('32 °F')).toBeInTheDocument();
  });

  it('shows wind speed in rows', () => {
    render(<ForecastTable forecast={mockForecast} unit="C" />);
    expect(screen.getAllByText('3 m/sec').length).toBeGreaterThan(0);
  });
});
