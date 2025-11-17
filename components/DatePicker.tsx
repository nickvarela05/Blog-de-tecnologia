import React, { useState, useMemo, useRef, useEffect } from 'react';
import Icon from './Icon';

interface DatePickerProps {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ initialStartDate, initialEndDate, onClose, onApply }) => {
  const [viewDate, setViewDate] = useState(initialStartDate || new Date());
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
            onClose();
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const daysInMonth = useMemo(() => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const days: Date[] = [];
    while (date.getMonth() === viewDate.getMonth()) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [viewDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day < startDate) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  const getDayClassName = (day: Date) => {
    let className = 'w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ';
    const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
    
    const sDate = startDate;
    const eDate = endDate;
    let inRange = false;
    if (sDate && eDate) {
        inRange = day > sDate && day < eDate;
    } else if (sDate && hoveredDate) {
        inRange = (day > sDate && day < hoveredDate) || (day < sDate && day > hoveredDate);
    }

    if (inRange) {
        className += 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-white ';
    }

    if (sDate && isSameDay(day, sDate)) {
        className += 'bg-blue-700 text-white font-semibold ';
    } else if (eDate && isSameDay(day, eDate)) {
        className += 'bg-blue-700 text-white font-semibold ';
    } else if (!inRange) {
         className += 'text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 ';
    }
    
    return className;
  };
  
  const handleApplyClick = () => {
    if (startDate && endDate) {
        onApply(startDate, endDate);
    }
  };

  return (
    <div ref={datePickerRef} className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-2xl z-20 p-4 w-72">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><Icon type="arrow-left" className="w-5 h-5" /></button>
        <span className="font-semibold text-gray-900 dark:text-white">
          {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={handleNextMonth} className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><Icon type="arrow-right" className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-gray-400 dark:text-gray-500 mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`}></div>)}
        {daysInMonth.map(day => (
          <button 
            key={day.toString()} 
            onClick={() => handleDayClick(day)}
            onMouseEnter={() => startDate && !endDate && setHoveredDate(day)}
            onMouseLeave={() => setHoveredDate(null)}
            className={getDayClassName(day)}
          >
            {day.getDate()}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4 border-t border-gray-200 dark:border-slate-600 pt-3">
        <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
        <button onClick={handleApplyClick} disabled={!startDate || !endDate} className="px-3 py-1.5 text-sm text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed">Aplicar</button>
      </div>
    </div>
  );
};

export default DatePicker;