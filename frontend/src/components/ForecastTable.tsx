import { useState } from 'react';
import { ForecastData, ForecastItem } from '../types/weather';
import { convertTemp } from '../utils/temperature';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatTabLabel(dateStr: string) {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1].toUpperCase()}`;
}

function formatRowDate(dtTxt: string) {
  const [datePart, timePart] = dtTxt.split(' ');
  const [, month, day] = datePart.split('-');
  const hour = parseInt(timePart.split(':')[0]);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${displayHour}${ampm}`;
}

function groupByDay(list: ForecastItem[]): Record<string, ForecastItem[]> {
  return list.reduce<Record<string, ForecastItem[]>>((acc, item) => {
    const day = item.dtTxt.split(' ')[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
}

interface Props {
  forecast: ForecastData;
  unit: 'C' | 'F';
}

export default function ForecastTable({ forecast, unit }: Props) {
  const days = groupByDay(forecast.list);
  const dayKeys = Object.keys(days);
  const [activeDay, setActiveDay] = useState(dayKeys[0]);

  const tabId    = (day: string) => `forecast-tab-${day.replace(/-/g, '')}`;
  const panelId  = 'forecast-panel';

  return (
    <div>
      <div
        role="tablist"
        aria-label="Forecast days"
        className="flex flex-wrap justify-center gap-2 px-4 sm:px-8 py-4"
      >
        {dayKeys.map((day) => (
          <button
            key={day}
            role="tab"
            id={tabId(day)}
            aria-selected={activeDay === day}
            aria-controls={panelId}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2 text-[11px] font-semibold rounded-[8px] border transition-all duration-200 ${
              activeDay === day
                ? 'bg-primary text-white border-transparent'
                : 'bg-white/45 text-primary/60 border-primary/20'
            }`}
          >
            {formatTabLabel(day)}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(activeDay)}
        aria-label={`Forecast for ${formatTabLabel(activeDay)}`}
        className="overflow-x-auto pb-6 px-4 sm:px-8"
      >
        <table className="w-full text-sm text-primary night:text-night-text min-w-[520px]">
          <thead>
            <tr className="border-b border-primary/10 night:border-white/[0.10]">
              {['Date', 'Temp', 'Min Temp', 'Max Temp', 'Wind', 'Description'].map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="text-left pb-2 px-3 text-[10px] font-semibold tracking-[0.5px] uppercase text-primary/50 night:text-night-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days[activeDay]?.map((item) => (
              <tr key={item.dt} className="border-b border-primary/[0.06] night:border-white/[0.07] last:border-0">
                <td className="py-2 px-3 text-primary/60 night:text-night-muted">{formatRowDate(item.dtTxt)}</td>
                <td className="py-2 px-3">{convertTemp(item.temp, unit)} °{unit}</td>
                <td className="py-2 px-3">{convertTemp(item.tempMin, unit).toFixed(2)} °{unit}</td>
                <td className="py-2 px-3">{convertTemp(item.tempMax, unit).toFixed(2)} °{unit}</td>
                <td className="py-2 px-3">{item.wind} m/sec</td>
                <td className="py-2 px-3 capitalize text-primary/60 night:text-night-muted">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
