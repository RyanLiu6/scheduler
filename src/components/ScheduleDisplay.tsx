import { useState } from 'react';
import classNames from 'classnames';
import { textStyle } from '@ryanliu6/xi/styles';
import { Button } from '@/components/Button';
import NameSelector from '@/components/NameSelector';
import type { ScheduleEntry } from '@/utils/processSchedule';
import ExpiryTimer from '@/components/ExpiryTimer';

interface ScheduleDisplayProps {
  scheduleData: ScheduleEntry[];
  scheduleId: string;
  expiryTime: number;
}

const ScheduleDisplay = ({ scheduleData, scheduleId, expiryTime }: ScheduleDisplayProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedName) params.set('name', selectedName);

      const response = await fetch(`/api/download-ics/${scheduleId}?${params}`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to download schedule');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-${selectedName || 'all'}-${scheduleId}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download schedule');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDateClick = (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  // Get unique dates from schedule
  const dates = [...new Set(scheduleData.map((entry) => entry.date))].sort();

  // Filter entries by selected name and date
  const filteredEntries = scheduleData.filter((entry) => {
    if (selectedName && entry.name !== selectedName) return false;
    if (selectedDate && entry.date !== selectedDate) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header row with name selector and expiry timer */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-64">
          {' '}
          {/* Fixed width for name selector on larger screens */}
          <NameSelector
            scheduleData={scheduleData}
            selectedName={selectedName}
            onNameSelect={setSelectedName}
          />
        </div>
        <ExpiryTimer expiryTime={expiryTime} />
      </div>

      {/* Date selector */}
      <div className="w-full overflow-x-auto">
        <div className="flex flex-row gap-2 p-2">
          {dates.map((date) => (
            <div
              key={date}
              className={classNames('rounded-lg p-[2px]', {
                'outline outline-2 outline-violet-500': selectedDate === date,
              })}
            >
              <button
                onClick={() => handleDateClick(date)}
                className={classNames(
                  'px-4 py-2 rounded-lg whitespace-nowrap',
                  'bg-white dark:bg-slate-700',
                  'border border-slate-200 dark:border-slate-600',
                  'hover:border-violet-500 dark:hover:border-violet-500',
                  'transition-colors duration-200',
                  {
                    'border-transparent': selectedDate === date,
                  }
                )}
              >
                {new Date(date).toLocaleDateString()}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule table */}
      <div
        className={classNames(
          'overflow-x-auto rounded-lg',
          'bg-white dark:bg-slate-700',
          'shadow-md'
        )}
      >
        <table className="min-w-full">
          <thead>
            <tr>
              <th className={classNames('px-4 py-2', textStyle)}>Name</th>
              <th className={classNames('px-4 py-2', textStyle)}>Date</th>
              <th className={classNames('px-4 py-2', textStyle)}>Shift</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry, index) => (
              <tr key={`${entry.name}-${entry.date}-${index}`}>
                <td className={classNames('px-4 py-2 border-t', textStyle)}>{entry.name}</td>
                <td className={classNames('px-4 py-2 border-t', textStyle)}>
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className={classNames('px-4 py-2 border-t', textStyle)}>{entry.shift}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-end gap-2">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleDownload} disabled={isDownloading}>
          {isDownloading
            ? 'Downloading...'
            : `Download ${selectedName ? selectedName + "'s" : 'All'} Schedule`}
        </Button>
      </div>
    </div>
  );
};

export default ScheduleDisplay;
