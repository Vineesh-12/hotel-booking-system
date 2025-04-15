import { useState, useEffect } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRooms } from '@/hooks/useRooms';

interface RoomCalendarProps {
  roomId: number;
  selectedStartDate?: Date;
  selectedEndDate?: Date;
  onDateChange?: (start: Date | undefined, end: Date | undefined) => void;
}

type DateSelectionMode = 'start' | 'end' | 'none';

export function RoomCalendar({ roomId, selectedStartDate, selectedEndDate, onDateChange }: RoomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionMode, setSelectionMode] = useState<DateSelectionMode>('start');
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(selectedStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(selectedEndDate);
  
  const { useRoomAvailability } = useRooms();
  
  // Get room availability for current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const { data: availability } = useRoomAvailability(
    roomId,
    format(monthStart, 'yyyy-MM-dd'),
    format(addDays(monthEnd, 1), 'yyyy-MM-dd')
  );
  
  // Update local state when props change
  useEffect(() => {
    if (selectedStartDate) {
      setStartDate(selectedStartDate);
      setSelectionMode(selectedEndDate ? 'none' : 'end');
    }
    
    if (selectedEndDate) {
      setEndDate(selectedEndDate);
      setSelectionMode('none');
    }
  }, [selectedStartDate, selectedEndDate]);
  
  // Generate calendar days
  const calendarDays = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });
  
  // Navigation functions
  const previousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Date selection handlers
  const handleDateClick = (date: Date) => {
    // Don't allow selection of unavailable dates
    if (isDateDisabled(date)) return;
    
    if (selectionMode === 'start' || (selectionMode === 'end' && isBefore(date, startDate!))) {
      setStartDate(date);
      setEndDate(undefined);
      setSelectionMode('end');
      if (onDateChange) onDateChange(date, undefined);
    } else if (selectionMode === 'end') {
      setEndDate(date);
      setSelectionMode('none');
      if (onDateChange) onDateChange(startDate, date);
    } else {
      // If both dates are already selected, start over
      setStartDate(date);
      setEndDate(undefined);
      setSelectionMode('end');
      if (onDateChange) onDateChange(date, undefined);
    }
  };
  
  const handleDateHover = (date: Date) => {
    setHoverDate(date);
  };
  
  // Helper functions
  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Check availability data
    if (availability && availability.dates) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dateAvailability = availability.dates.find(d => 
        d.date.toString().split('T')[0] === dateStr
      );
      
      return dateAvailability ? !dateAvailability.isAvailable : false;
    }
    
    return false;
  };
  
  const isBefore = (date1: Date, date2: Date): boolean => {
    return date1.getTime() < date2.getTime();
  };
  
  const isInRange = (date: Date): boolean => {
    if (!startDate || !endDate) {
      // If we're in the process of selecting end date, show preview range
      if (startDate && hoverDate && selectionMode === 'end' && hoverDate > startDate) {
        return isWithinInterval(date, { start: startDate, end: hoverDate });
      }
      return false;
    }
    
    return isWithinInterval(date, { start: startDate, end: endDate });
  };
  
  // Day rendering
  const renderDay = (date: Date, index: number) => {
    const dayNumber = date.getDate();
    const isToday = isSameDay(date, new Date());
    const isStart = startDate && isSameDay(date, startDate);
    const isEnd = endDate && isSameDay(date, endDate);
    const isInCurrentMonth = isSameMonth(date, currentMonth);
    const disabled = isDateDisabled(date);
    const inRange = !disabled && isInRange(date);
    
    return (
      <div
        key={index}
        className={cn(
          "calendar-day",
          !isInCurrentMonth && "opacity-30",
          disabled && "calendar-day-disabled",
          isStart && "calendar-day-selected",
          isEnd && "calendar-day-selected",
          inRange && !isStart && !isEnd && "calendar-day-in-range",
          isToday && !isStart && !isEnd && "border border-primary"
        )}
        onClick={() => !disabled && handleDateClick(date)}
        onMouseEnter={() => !disabled && handleDateHover(date)}
      >
        {dayNumber}
      </div>
    );
  };
  
  return (
    <div className="mt-4 text-center">
      <div className="inline-block">
        <div className="flex justify-between items-center mb-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons">chevron_left</span>
          </Button>
          <div className="font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons">chevron_right</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mt-2">
          <div className="text-xs font-medium text-gray-500">Su</div>
          <div className="text-xs font-medium text-gray-500">Mo</div>
          <div className="text-xs font-medium text-gray-500">Tu</div>
          <div className="text-xs font-medium text-gray-500">We</div>
          <div className="text-xs font-medium text-gray-500">Th</div>
          <div className="text-xs font-medium text-gray-500">Fr</div>
          <div className="text-xs font-medium text-gray-500">Sa</div>
          
          {calendarDays.map((day, index) => renderDay(day, index))}
        </div>
        
        <div className="mt-2 text-xs text-left">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div> Available
            <div className="w-3 h-3 bg-gray-300 rounded-full ml-2"></div> Unavailable
            <div className="w-3 h-3 bg-blue-100 rounded-full ml-2"></div> Selected Range
          </div>
        </div>
      </div>
    </div>
  );
}
