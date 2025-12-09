
import React from 'react';
import { SessionRecord } from '../types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CalendarProps {
  history: SessionRecord[];
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: string) => void;
  selectedDateStr: string | null;
  activePlanId?: string | null;
}

export const Calendar: React.FC<CalendarProps> = ({
  history,
  currentDate,
  onMonthChange,
  onDateSelect,
  selectedDateStr,
  activePlanId
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Helper to check if a day has history
  const getHistoryForDay = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return history.filter(h => h.date === dateStr && (!activePlanId || h.planId === activePlanId));
  };

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-sage-800 capitalize">
          {monthNames[month]} <span className="text-stone-400 font-normal">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 mb-4">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-bold text-stone-300">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-4 gap-x-2">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-10" />
        ))}

        {days.map(day => {
          const sessions = getHistoryForDay(day);
          const hasSession = sessions.length > 0;
          const dateStr = new Date(year, month, day).toISOString().split('T')[0];
          const isSelected = selectedDateStr === dateStr;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <button
              key={day}
              onClick={() => onDateSelect(dateStr)}
              className={`
                relative h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm transition-all
                ${isSelected ? 'ring-2 ring-sage-400 ring-offset-2' : ''}
                ${isToday && !hasSession ? 'bg-stone-100 text-stone-800 font-bold' : ''}
                ${!isToday && !hasSession ? 'hover:bg-stone-50 text-stone-600' : ''}
                ${hasSession ? 'bg-sage-600 text-white shadow-md' : ''}
              `}
            >
              {day}
              {hasSession && (
                <div className="absolute -bottom-1 w-1 h-1 bg-white/50 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend / Stats */}
      <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-sage-600 rounded-full" />
          <span>Praticado</span>
        </div>
        <div>
          {history.filter(h => h.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} dias este mês
        </div>
      </div>
    </div>
  );
};
